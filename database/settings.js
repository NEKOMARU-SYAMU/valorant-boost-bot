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
            rankUpChannel
        )
        VALUES (
            @guildId,
            @publishChannel,
            @publishMessage,
            @rankUpChannel
        )
    `).run({
        guildId,
        publishChannel: data.publishChannel ?? current?.publishChannel ?? null,
        publishMessage: data.publishMessage ?? current?.publishMessage ?? null,
        rankUpChannel: data.rankUpChannel ?? current?.rankUpChannel ?? null
    });
}

module.exports = {
    saveSettings,
    getSettings
};