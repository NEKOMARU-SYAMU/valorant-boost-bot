const {
    SlashCommandBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

const { getUser } = require("../../database/database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("register")
        .setDescription("プロフィールを登録します"),

    async execute(interaction) {
        const existingUser = getUser(interaction.user.id);

        if (existingUser) {
            return interaction.reply({
                content:
`⚠️ すでにプロフィールが登録されています。

内容を変更したい場合は \`/update\` を使ってください。
RRはRiot APIから自動更新されます。`,
                ephemeral: true
            });
        }

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