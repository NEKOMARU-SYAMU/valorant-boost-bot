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
        .setName("delete")
        .setDescription("自分のプロフィールを削除します"),

    async execute(interaction) {
        const user = getUser(interaction.user.id);

        if (!user) {
            return interaction.reply({
                content: "削除できるプロフィールがありません。",
                ephemeral: true
            });
        }

        const modal = new ModalBuilder()
            .setCustomId("delete_confirm_modal")
            .setTitle("プロフィール削除確認");

        const input = new TextInputBuilder()
            .setCustomId("confirm_text")
            .setLabel("削除するには DELETE と入力してください")
            .setPlaceholder("DELETE")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        modal.addComponents(
            new ActionRowBuilder().addComponents(input)
        );

        await interaction.showModal(modal);
    }
};