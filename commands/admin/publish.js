const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const {
    getSettings,
    saveSettings
} = require("../../database/database");

const { buildMemberListEmbed } = require("../../embeds/memberListEmbed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("publish")
        .setDescription("メンバー一覧を公開・更新します")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const settings = getSettings(interaction.guild.id);

        if (!settings?.publishChannel) {
            return interaction.reply({
                content: "⚠️ 先に `/setup channel:#チャンネル` を実行してください。",
                ephemeral: true
            });
        }

        const channel = await interaction.guild.channels.fetch(settings.publishChannel).catch(() => null);

        if (!channel) {
            return interaction.reply({
                content: "⚠️ 設定されている公開チャンネルが見つかりません。もう一度 `/setup` を実行してください。",
                ephemeral: true
            });
        }

        const embed = buildMemberListEmbed();

        let message = null;

        if (settings.publishMessage) {
            message = await channel.messages.fetch(settings.publishMessage).catch(() => null);
        }

        if (message) {
            await message.edit({
                embeds: [embed]
            });
        } else {
            message = await channel.send({
                embeds: [embed]
            });
        }

        saveSettings(interaction.guild.id, {
            publishChannel: settings.publishChannel,
            publishMessage: message.id
        });

        await interaction.reply({
            content: `✅ メンバー一覧を公開・更新しました。\n<#${settings.publishChannel}>`,
            ephemeral: true
        });
    }
};