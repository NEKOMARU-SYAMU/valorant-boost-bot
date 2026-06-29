const {
    SlashCommandBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rr")
        .setDescription("RRをフォームで更新します"),

    async execute(interaction) {
        const modal = new ModalBuilder()
            .setCustomId("rr_modal")
            .setTitle("RR更新");

        const rrInput = new TextInputBuilder()
            .setCustomId("rr_value")
            .setLabel("RR変動")
            .setPlaceholder("例：20 / -15 / ＋25 / －30")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        modal.addComponents(
            new ActionRowBuilder().addComponents(rrInput)
        );

        await interaction.showModal(modal);
    }
};