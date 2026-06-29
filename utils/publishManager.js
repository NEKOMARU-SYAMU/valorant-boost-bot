const { buildMemberListEmbed } = require("../embeds/memberListEmbed");
const { getSettings, saveSettings } = require("../database/database");

async function updatePublish(guild) {
    const settings = getSettings(guild.id);

    if (!settings?.publishChannel || !settings?.publishMessage) {
        return;
    }

    const channel = await guild.channels.fetch(settings.publishChannel).catch(() => null);
    if (!channel) return;

    const message = await channel.messages.fetch(settings.publishMessage).catch(() => null);
    if (!message) return;

    const embed = buildMemberListEmbed();

    await message.edit({
        embeds: [embed]
    });

    saveSettings(guild.id, {
        publishChannel: settings.publishChannel,
        publishMessage: message.id
    });
}

module.exports = {
    updatePublish
};