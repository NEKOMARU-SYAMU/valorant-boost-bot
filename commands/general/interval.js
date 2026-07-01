const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const {
    getUpdateInterval
} = require("../../database/database");

const autoUpdateManager = require("../../utils/autoUpdateManager");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("interval")
        .setDescription("現在の自動更新設定を表示します"),

    async execute(interaction) {

        const minutes = getUpdateInterval(interaction.guild.id);

        const status = autoUpdateManager.getStatus();

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle("⏰ 自動更新設定")
            .addFields(
                {
                    name: "更新間隔",
                    value: `${minutes}分`,
                    inline: true
                },
                {
                    name: "前回更新",
                    value: status.lastRun
                        ? `<t:${Math.floor(status.lastRun / 1000)}:F>`
                        : "まだ実行されていません",
                    inline: false
                },
                {
                    name: "次回更新予定",
                    value: status.nextRun
                        ? `<t:${Math.floor(status.nextRun / 1000)}:R>`
                        : "未定",
                    inline: false
                }
            )
            .setFooter({
                text: "VALORANT MANAGER"
            });

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });

    }

};