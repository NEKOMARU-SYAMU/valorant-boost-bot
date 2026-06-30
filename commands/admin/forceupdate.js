const {
    SlashCommandBuilder,
    PermissionFlagsBits
} = require("discord.js");

const { runAutoUpdate } = require("../../utils/autoUpdateManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("forceupdate")
        .setDescription("登録者のRRを今すぐ手動更新します")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const result = await runAutoUpdate(interaction.client, interaction.guild, {
            force: true
        });

        if (result.running) {
            return interaction.editReply({
                content: "⚠️ 自動更新が実行中です。少し待ってからもう一度実行してください。"
            });
        }

        await interaction.editReply({
            content:
`✅ 手動更新が完了しました。

確認人数：${result.checked}人
更新人数：${result.updated}人
スキップ：${result.skipped}人
失敗：${result.failed}人`
        });
    }
};