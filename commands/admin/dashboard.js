const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    EmbedBuilder
} = require("discord.js");

const {
    getAllUsers,
    getWeeklyRRRanking
} = require("../../database/database");

const { getRankText } = require("../../utils/rankManager");

function getTodayStartMs() {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now.getTime();
}

function getWeekStartMs() {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;

    const monday = new Date(now);
    monday.setDate(now.getDate() - diff);
    monday.setHours(0, 0, 0, 0);

    return monday.getTime();
}

function isInactive(updatedAt) {
    if (!updatedAt) return true;

    const time = new Date(updatedAt).getTime();
    if (Number.isNaN(time)) return false;

    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - time >= sevenDays;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("dashboard")
        .setDescription("管理者用ダッシュボードを表示します")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        const users = getAllUsers();

        if (!users.length) {
            return interaction.reply({
                content: "まだ登録されているメンバーがいません。",
                ephemeral: true
            });
        }

        const todayRanking = getWeeklyRRRanking(getTodayStartMs());
        const weeklyRanking = getWeeklyRRRanking(getWeekStartMs());

        const todayTop = todayRanking[0];
        const weeklyTop = weeklyRanking[0];

        const inactiveUsers = users.filter(user => isInactive(user.updatedAt));

        const averageProgress =
            users.reduce((sum, user) => sum + Number(user.progress || 0), 0) / users.length;

        const averageRank =
            Math.round(users.reduce((sum, user) => sum + user.currentRank, 0) / users.length);

        const embed = new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle("📋 BOOST DASHBOARD")
            .setDescription(
`👥 **登録者**
${users.length}人

📈 **平均ランク**
${getRankText(averageRank)}

📊 **平均達成率**
${averageProgress.toFixed(1)}%

━━━━━━━━━━━━━━━━━━━━

🔥 **今日一番伸びた人**
${todayTop ? `<@${todayTop.userId}>  +${todayTop.totalDiff}RR` : "なし"}

🏆 **今週1位**
${weeklyTop ? `<@${weeklyTop.userId}>  +${weeklyTop.totalDiff}RR` : "なし"}

━━━━━━━━━━━━━━━━━━━━

⚠️ **7日以上更新なし**
${inactiveUsers.length}人

${inactiveUsers.length
    ? inactiveUsers.slice(0, 10).map(user => `・<@${user.userId}>`).join("\n")
    : "なし"}`
            )
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
};