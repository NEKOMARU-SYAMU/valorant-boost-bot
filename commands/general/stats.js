const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const { getAllUsers } = require("../../database/database");
const { getRankText } = require("../../utils/rankManager");

function getRankGroup(rankId) {
    if (rankId === 25) return "radiant";
    if (rankId >= 22) return "immortal";
    if (rankId >= 19) return "ascendant";
    if (rankId >= 16) return "diamond";
    if (rankId >= 13) return "platinum";
    if (rankId >= 10) return "gold";
    if (rankId >= 7) return "silver";
    if (rankId >= 4) return "bronze";
    return "iron";
}

function isUpdatedToday(updatedAt) {
    if (!updatedAt) return false;

    const today = new Date().toLocaleDateString("ja-JP");
    return updatedAt.startsWith(today);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("サーバー全体の統計を表示します"),

    async execute(interaction) {
        const users = getAllUsers();

        if (!users.length) {
            return interaction.reply({
                content: "まだ登録されているメンバーがいません。",
                ephemeral: true
            });
        }

        const total = users.length;

        const averageRankRaw =
            users.reduce((sum, user) => sum + user.currentRank, 0) / total;

        const averageRank = Math.round(averageRankRaw);

        const averageProgress =
            users.reduce((sum, user) => sum + Number(user.progress || 0), 0) / total;

        const groups = {
            radiant: 0,
            immortal: 0,
            ascendant: 0,
            diamond: 0,
            platinum: 0,
            gold: 0,
            silver: 0,
            bronze: 0,
            iron: 0
        };

        for (const user of users) {
            groups[getRankGroup(user.currentRank)]++;
        }

        const updatedToday = users.filter(user => isUpdatedToday(user.updatedAt)).length;

        const topUser = users[0];

        const embed = new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle("📊 BOOST SERVER STATS")
            .setDescription(
`👥 **登録人数**
${total}人

📈 **平均ランク**
${getRankText(averageRank)}

📊 **平均達成率**
${averageProgress.toFixed(1)}%

🕒 **今日更新した人数**
${updatedToday}人

🏆 **最高ランク**
<@${topUser.userId}>
${getRankText(topUser.currentRank)} ${topUser.rr}RR

━━━━━━━━━━━━━━━━━━━━

🟨 レディアント：${groups.radiant}人
🔴 イモータル：${groups.immortal}人
🟢 アセンダント：${groups.ascendant}人
🟣 ダイヤモンド：${groups.diamond}人
🔵 プラチナ：${groups.platinum}人
🟡 ゴールド：${groups.gold}人
⚪ シルバー：${groups.silver}人
🟤 ブロンズ：${groups.bronze}人
⚫ アイアン：${groups.iron}人`
            )
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            ephemeral: false
        });
    }
};