const {
    SlashCommandBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    PermissionFlagsBits
} = require("discord.js");

const { getUser } = require("../database/database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("register")
        .setDescription("プロフィールを登録します")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("管理者用：登録する対象ユーザー")
                .setRequired(false)
        ),

    async execute(interaction) {
        const targetUser = interaction.options.getUser("user") || interaction.user;

        if (targetUser.id !== interaction.user.id) {
            const isAdmin = interaction.member.permissions.has(PermissionFlagsBits.Administrator);

            if (!isAdmin) {
                return interaction.reply({
                    content: "⚠️ 他人のプロフィールを登録できるのは管理者のみです。",
                    ephemeral: true
                });
            }
        }

        const existingUser = getUser(targetUser.id);

        if (existingUser) {
            return interaction.reply({
                content:
`⚠️ すでにプロフィールが登録されています。

内容を変更したい場合は \`/update\` を使ってください。
RRはRiot APIから自動更新されます。`,
                ephemeral: true
            });
        }

        interaction.client.registerCache.set(interaction.user.id, {
            targetUserId: targetUser.id,
            targetUsername: targetUser.username,
            targetAvatar: targetUser.displayAvatarURL({ dynamic: true })
        });

        const modal = new ModalBuilder()
            .setCustomId("register_modal")
            .setTitle("プロフィール登録");

        const riotNameInput = new TextInputBuilder()
            .setCustomId("riot_name")
            .setLabel("Riot ID")
            .setPlaceholder("例：ねこまる")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        const riotTagInput = new TextInputBuilder()
            .setCustomId("riot_tag")
            .setLabel("Tag")
            .setPlaceholder("例：4545")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        const commentInput = new TextInputBuilder()
            .setCustomId("comment")
            .setLabel("コメント（任意）")
            .setPlaceholder("例：夜なら対応できます")
            .setRequired(false)
            .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(
            new ActionRowBuilder().addComponents(riotNameInput),
            new ActionRowBuilder().addComponents(riotTagInput),
            new ActionRowBuilder().addComponents(commentInput)
        );

        await interaction.showModal(modal);
    }
};