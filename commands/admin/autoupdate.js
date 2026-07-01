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
        .setDescription("自動更新状況を表示します")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {

        const remain = getRemainingTime();

        const totalSeconds = Math.ceil(remain / 1000);

        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;

        await interaction.reply({
            content:
`⏰ 自動更新

次回更新まで
${minutes}分${seconds}秒

更新間隔：5分`,
            ephemeral: true
        });

    }

};