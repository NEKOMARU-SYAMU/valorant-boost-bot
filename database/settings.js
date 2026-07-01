const db = require("./connection");

function getSettings(guildId) {
    return db.prepare(`
        SELECT *
        FROM settings
        WHERE guildId = ?
    `).get(guildId);
}

function saveSettings(guildId, data) {
    const current = getSettings(guildId);

    db.prepare(`
        INSERT OR REPLACE INTO settings (
            guildId,
            publishChannel,
            publishMessage,
            rankUpChannel,
            matchResultChannel,
            rankDownChannel,
            targetAchievedChannel,
            updateInterval
        )
        VALUES (
            @guildId,
            @publishChannel,
            @publishMessage,
            @rankUpChannel,
            @matchResultChannel,
            @rankDownChannel,
            @targetAchievedChannel,
            @updateInterval
        )
    `).run({
        guildId,

        publishChannel:
            data.publishChannel ?? current?.publishChannel ?? null,

        publishMessage:
            data.publishMessage ?? current?.publishMessage ?? null,

        rankUpChannel:
            data.rankUpChannel ?? current?.rankUpChannel ?? null,

        matchResultChannel:
            data.matchResultChannel ?? current?.matchResultChannel ?? null,

        rankDownChannel:
            data.rankDownChannel ?? current?.rankDownChannel ?? null,

        targetAchievedChannel:
            data.targetAchievedChannel ?? current?.targetAchievedChannel ?? null,

        updateInterval:
            data.updateInterval ?? current?.updateInterval ?? 60
    });
}

function getUpdateInterval(guildId) {
    return getSettings(guildId)?.updateInterval ?? 60;
}

function setUpdateInterval(guildId, minutes) {
    saveSettings(guildId, {
        updateInterval: minutes
    });
}

module.exports = {
    getSettings,
    saveSettings,
    getUpdateInterval,
    setUpdateInterval
};