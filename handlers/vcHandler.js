const { createVCEmbed } = require("../utils/vcEmbedManager");

async function handleVCButton(interaction) {
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
        return interaction.reply({
            content: "⚠️ VCに参加してください。",
            ephemeral: true
        });
    }

    const { embed, components } = createVCEmbed(voiceChannel);

    return interaction.update({
        embeds: [embed],
        components
    });
}

module.exports = {
    handleVCButton
};