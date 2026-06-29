const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType
} = require("discord.js");

const {
    getSettings,
    saveSettings
} = require("../../database/database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setrankup")
        .setDescription("ランクアップ通知チャンネルを設定します")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("ランクアップ通知を送るチャンネル")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        ),

    async execute(interaction) {
        const channel = interaction.options.getChannel("channel");
        const current = getSettings(interaction.guild.id);

        saveSettings(interaction.guild.id, {
            publishChannel: current?.publishChannel || null,
            publishMessage: current?.publishMessage || null,
            rankUpChannel: channel.id
        });

        await interaction.reply({
            content: `✅ ランクアップ通知チャンネルを設定しました。\n🎉 <#${channel.id}>`,
            ephemeral: true
        });
    }
};