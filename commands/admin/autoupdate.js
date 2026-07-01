const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const {
    getRemainingTime
} = require("../../utils/autoUpdateManager");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("autoupdate")
        .setDescription("次回自動更新までの残り時間を表示します")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const remain = getRemainingTime();

        const minutes = Math.floor(remain / 60000);
        const seconds = Math.floor((remain % 60000) / 1000);

        await interaction.reply({
            content:
`⏰ 次回自動更新まで

${minutes}分${seconds}秒`,
            ephemeral: true
        });

    }

};