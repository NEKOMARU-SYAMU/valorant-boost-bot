const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setinterval")
        .setDescription("自動更新間隔を変更します")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const menu = new StringSelectMenuBuilder()
            .setCustomId("setinterval_select")
            .setPlaceholder("自動更新間隔を選択")
            .addOptions(
                { label: "5分", value: "5" },
                { label: "10分", value: "10" },
                { label: "15分", value: "15" },
                { label: "30分", value: "30" },
                { label: "60分", value: "60" }
            );

        await interaction.reply({
            content: "⏰ 自動更新間隔を選択してください。",
            components: [
                new ActionRowBuilder().addComponents(menu)
            ],
            ephemeral: true
        });
    }
};