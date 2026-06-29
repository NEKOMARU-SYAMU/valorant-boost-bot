const { SlashCommandBuilder } = require("discord.js");
const { createVCEmbed } = require("../../utils/vcEmbedManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("vc")
        .setDescription("今いるVCメンバーのプロフィール一覧を表示します"),

    async execute(interaction) {
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({
                content: "⚠️ 先にVCに参加してください。",
                ephemeral: true
            });
        }

        const { embed, components } = createVCEmbed(voiceChannel, "rank");

        await interaction.reply({
            embeds: [embed],
            components,
            ephemeral: false
        });
    }
};