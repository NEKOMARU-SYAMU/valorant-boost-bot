const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { getCurrentMMR, getLatestMatch } = require("../../utils/valorantApi");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("apitest")
        .setDescription("Henrik APIの取得テストをします")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName("name")
                .setDescription("Riot ID")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("tag")
                .setDescription("Tag")
                .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const name = interaction.options.getString("name");
        const tag = interaction.options.getString("tag");
        const region = "ap";

        try {
            const mmr = await getCurrentMMR(region, name, tag);
            const match = await getLatestMatch(region, name, tag);

            await interaction.editReply({
                content:
`✅ API取得成功

Riot ID：${name}#${tag}
現在ランク：${mmr.rankName}
現在RR：${mmr.rr}

最新試合ID：${match?.matchId || "なし"}
マップ：${match?.map || "不明"}
スコア：${match?.score || "不明"}`
            });
        } catch (error) {
            await interaction.editReply({
                content:
`❌ API取得失敗

\`\`\`
${error.message}
\`\`\``
            });
        }
    }
};