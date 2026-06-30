const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const { getUser } = require("../../database/database");
const { buildUpdateMenu } = require("../../handlers/updateHandler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("update")
        .setDescription("プロフィール情報を更新します")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("管理者用：更新する対象ユーザー")
                .setRequired(false)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser("user") || interaction.user;

        if (targetUser.id !== interaction.user.id) {
            const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

            if (!isAdmin) {
                return interaction.reply({
                    content: "⚠️ 他人のプロフィールを更新できるのは管理者のみです。",
                    ephemeral: true
                });
            }
        }

        const user = getUser(targetUser.id);

        if (!user) {
            return interaction.reply({
                content: "プロフィールが登録されていません。先に `/register` を実行してください。",
                ephemeral: true
            });
        }

        interaction.client.updateTargetCache ??= new Map();

        interaction.client.updateTargetCache.set(interaction.user.id, {
            targetUserId: targetUser.id,
            targetUsername: targetUser.username
        });

        await interaction.reply({
            content: `✏️ **更新する項目を選択してください。**\n対象：<@${targetUser.id}>`,
            components: buildUpdateMenu(),
            ephemeral: true
        });
    }
};