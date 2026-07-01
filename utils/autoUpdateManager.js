const {
    getAllUsers,
    saveUser,
    addRRHistory,
    getSettings
} = require("../database/database");

const { getCurrentMMR, getLatestMatch } = require("./valorantApi");
const { getRankIdByName } = require("./rankManager");
const { calculateProgress } = require("./progressManager");
const { updatePublish } = require("./publishManager");

const {
    buildMatchResultEmbed,
    buildRankUpEmbed,
    buildRankDownEmbed,
    buildTargetAchievedEmbed
} = require("../embeds/notificationEmbed");

let isRunning = false;
let lastUpdateTime = Date.now();

const UPDATE_INTERVAL = 5; // 分

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function isRateLimitError(error) {
    return (
        error?.response?.status === 429 ||
        error?.status === 429 ||
        String(error?.message || "").includes("429")
    );
}

async function retryOnRateLimit(fn, retries = 1) {
    try {
        return await fn();
    } catch (error) {
        if (isRateLimitError(error) && retries > 0) {
            await sleep(5000);
            return retryOnRateLimit(fn, retries - 1);
        }

        throw error;
    }
}

function calcDiffRR(oldRank, oldRR, newRank, newRR) {
    return ((newRank - oldRank) * 100 + newRR) - oldRR;
}

async function sendNotify(guild, channelId, embed) {
    if (!channelId) return;

    const channel = await guild.channels.fetch(channelId).catch(() => null);
    if (!channel) return;

    await channel.send({ embeds: [embed] }).catch(console.error);
}

async function sendNotifications(guild, oldUser, updatedUser, diffRR) {
    const settings = getSettings(guild.id);
    if (!settings) return;

    await sendNotify(
        guild,
        settings.matchResultChannel,
        buildMatchResultEmbed(updatedUser, diffRR)
    );

    if (updatedUser.currentRank > oldUser.currentRank) {
        await sendNotify(
            guild,
            settings.rankUpChannel,
            buildRankUpEmbed(oldUser, updatedUser, diffRR)
        );
    }

    if (updatedUser.currentRank < oldUser.currentRank) {
        await sendNotify(
            guild,
            settings.rankDownChannel,
            buildRankDownEmbed(oldUser, updatedUser, diffRR)
        );
    }

    const wasBelowTarget = oldUser.currentRank < oldUser.targetRank;
    const nowReachedTarget = updatedUser.currentRank >= updatedUser.targetRank;

    if (wasBelowTarget && nowReachedTarget) {
        await sendNotify(
            guild,
            settings.targetAchievedChannel,
            buildTargetAchievedEmbed(updatedUser)
        );
    }
}

async function updateOneUser(client, guild, user) {
    if (!user.riotName || !user.riotTag) {
        return { checked: true, updated: false, skipped: true };
    }

    try {
        const region = user.region || "ap";

        const latestMatch = await retryOnRateLimit(() =>
            getLatestMatch(region, user.riotName, user.riotTag)
        );

        if (!latestMatch?.matchId) {
            return { checked: true, updated: false, skipped: true };
        }

        if (latestMatch.matchId === user.lastMatchId) {
            return { checked: true, updated: false, skipped: true };
        }

        await sleep(300 + Math.random() * 200);

        const mmr = await retryOnRateLimit(() =>
            getCurrentMMR(region, user.riotName, user.riotTag)
        );

        const rankId = getRankIdByName(mmr.rankName);

        if (!rankId) {
            const failedUser = {
                ...user,
                apiError: `ランク変換不可: ${mmr.rankName}`,
                lastApiUpdate: new Date().toLocaleString("ja-JP")
            };

            saveUser(failedUser);
            return { checked: true, updated: false, failed: true };
        }

        const diffRR = calcDiffRR(user.currentRank, user.rr, rankId, mmr.rr);
        const progress = calculateProgress(rankId, mmr.rr, user.targetRank);
        const now = new Date().toLocaleString("ja-JP");

        const updatedUser = {
            ...user,
            currentRank: rankId,
            rr: mmr.rr,
            isUnrated: 0,
            previousRank: user.currentRank,
            previousRR: user.rr,
            lastDiffRR: diffRR,
            progress: progress.percent,
            lastMatchId: latestMatch.matchId,
            lastMatchMap: latestMatch.map || null,
            lastMatchScore: latestMatch.score || null,
            lastMatchResult: latestMatch.result || null,
            lastMatchRR: diffRR,
            lastApiUpdate: now,
            apiError: null,
            updatedAt: now
        };

        saveUser(updatedUser);

        addRRHistory({
            userId: user.userId,
            oldRank: user.currentRank,
            oldRR: user.rr,
            newRank: rankId,
            newRR: mmr.rr,
            diffRR,
            createdAt: now,
            createdAtMs: Date.now()
        });

        await sendNotifications(guild, user, updatedUser, diffRR);

        return { checked: true, updated: true };

    } catch (error) {
        const failedUser = {
            ...user,
            apiError: error.message,
            lastApiUpdate: new Date().toLocaleString("ja-JP")
        };

        saveUser(failedUser);

        return {
            checked: true,
            updated: false,
            failed: true,
            error: error.message
        };
    }
}

async function runAutoUpdate(client, guild, options = {}) {
    if (isRunning && !options.force) {
        return {
            checked: 0,
            updated: 0,
            failed: 0,
            skipped: 0,
            running: true
        };
    }

    isRunning = true;

    let checked = 0;
    let updated = 0;
    let failed = 0;
    let skipped = 0;

    try {
        const users = getAllUsers();

        for (const user of users) {
            const result = await updateOneUser(client, guild, user);

            if (result.checked) checked++;
            if (result.updated) updated++;
            if (result.failed) failed++;
            if (result.skipped) skipped++;

            // APIレート制限対策
            await sleep(300 + Math.random() * 200);
        }

        if (updated > 0) {
            await updatePublish(guild);
        }

        lastUpdateTime = Date.now();

        return {
            checked,
            updated,
            failed,
            skipped,
            running: false
        };

    } finally {
        isRunning = false;
    }
}

function startAutoUpdate(client) {
    client.once("ready", () => {
        setInterval(async () => {
            for (const guild of client.guilds.cache.values()) {
                await runAutoUpdate(client, guild).catch(console.error);
            }
        }, UPDATE_INTERVAL * 60 * 1000);

        console.log(`Auto RR update started: every ${UPDATE_INTERVAL} minutes`);
    });
}

function getRemainingTime() {
    const next = lastUpdateTime + UPDATE_INTERVAL * 60 * 1000;
    return Math.max(0, next - Date.now());
}

module.exports = {
    startAutoUpdate,
    runAutoUpdate,
    getRemainingTime
};