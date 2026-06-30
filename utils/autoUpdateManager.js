const {
    getAllUsers,
    saveUser,
    addRRHistory,
    getSettings
} = require("../database/database");

const { getCurrentMMR, getLatestMatch } = require("./valorantApi");
const { getRankIdByName, getRankText } = require("./rankManager");
const { calculateProgress } = require("./progressManager");
const { updatePublish } = require("./publishManager");

let isRunning = false;

function calcDiffRR(oldRank, oldRR, newRank, newRR) {
    return ((newRank - oldRank) * 100 + newRR) - oldRR;
}

function formatDiffRR(diffRR) {
    if (diffRR > 0) return `+${diffRR}RR`;
    if (diffRR < 0) return `${diffRR}RR`;
    return "±0RR";
}

async function sendNotify(guild, channelId, content) {
    if (!channelId) return;

    const channel = await guild.channels.fetch(channelId).catch(() => null);
    if (!channel) return;

    await channel.send({ content }).catch(console.error);
}

async function sendNotifications(guild, oldUser, updatedUser, diffRR) {
    const settings = getSettings(guild.id);
    if (!settings) return;

    const oldRankText = getRankText(oldUser.currentRank);
    const newRankText = getRankText(updatedUser.currentRank);
    const diffText = formatDiffRR(diffRR);

    const matchText =
`⚔️ 試合結果更新

<@${updatedUser.userId}>

${newRankText} ${updatedUser.rr}RR
${diffText}

⚔️ 最新試合
${updatedUser.lastMatchResult || "未取得"}
🗺️ ${updatedUser.lastMatchMap || "不明"}
🏆 ${updatedUser.lastMatchScore || "不明"}`;

    await sendNotify(guild, settings.matchResultChannel, matchText);

    if (updatedUser.currentRank > oldUser.currentRank) {
        await sendNotify(
            guild,
            settings.rankUpChannel,
`🎉 ランクアップ！

<@${updatedUser.userId}>

${oldRankText} ${oldUser.rr}RR
↓
${newRankText} ${updatedUser.rr}RR

${diffText}`
        );
    }

    if (updatedUser.currentRank < oldUser.currentRank) {
        await sendNotify(
            guild,
            settings.rankDownChannel,
`📉 ランクダウン

<@${updatedUser.userId}>

${oldRankText} ${oldUser.rr}RR
↓
${newRankText} ${updatedUser.rr}RR

${diffText}`
        );
    }

    const wasBelowTarget = oldUser.currentRank < oldUser.targetRank;
    const nowReachedTarget = updatedUser.currentRank >= updatedUser.targetRank;

    if (wasBelowTarget && nowReachedTarget) {
        await sendNotify(
            guild,
            settings.targetAchievedChannel,
`🎯 目標ランク達成！

<@${updatedUser.userId}> さんが
${getRankText(updatedUser.targetRank)}
に到達しました！`
        );
    }
}

async function updateOneUser(client, guild, user) {
    if (!user.riotName || !user.riotTag) {
        return { checked: true, updated: false, skipped: true };
    }

    try {
        const region = user.region || "ap";
        const latestMatch = await getLatestMatch(region, user.riotName, user.riotTag);

        if (!latestMatch?.matchId) {
            return { checked: true, updated: false, skipped: true };
        }

        if (latestMatch.matchId === user.lastMatchId) {
            return { checked: true, updated: false, skipped: true };
        }

        const mmr = await getCurrentMMR(region, user.riotName, user.riotTag);
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

            await new Promise(resolve => setTimeout(resolve, 1500));
        }

        if (updated > 0) {
            await updatePublish(guild);
        }

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
        }, 60 * 60 * 1000);

        console.log("Auto RR update started: every 1 hour");
    });
}

module.exports = {
    startAutoUpdate,
    runAutoUpdate
};