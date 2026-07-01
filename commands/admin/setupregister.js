const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("setupregister")
        .setDescription("登録パネルを設置します")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor(0xE63946)
            .setTitle("👤 プロフィール登録")
            .setDescription(
`VALORANT MANAGERへようこそ！

初めて利用する方は
下のボタンからプロフィールを登録してください。

登録後は

• ランク
• RR
• 目標ランク
• サブ垢

を管理できます。`
            );

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("register_panel")
                    .setLabel("プロフィールを登録する")
                    .setEmoji("👤")
                    .setStyle(ButtonStyle.Success)
            );

        await interaction.reply({
            embeds: [embed],
            components: [row]
        });

    }

};