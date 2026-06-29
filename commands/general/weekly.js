const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const {
    getWeeklyRRRanking,
    getUser
} = require("../../database/database");

const { getRankText } = require("../../utils/rankManager");

function getWeekStartMs() {
    const now = new Date();

    const day = now.getDay(); 
    const diff = day === 0 ? 6 : day - 1;

    const monday = new Date(now);
    monday.setDate(now.getDate() - diff);
    monday.setHours(0, 0, 0, 0);

    return monday.getTime();
}

function formatDate(ms) {
    return new Date(ms).toLocaleDateString("ja-JP");
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("weekly")
        .setDescription("今週のRR増加ランキングを表示します"),

    async execute(interaction) {
        const weekStartMs = getWeekStartMs();
        const ranking = getWeeklyRRRanking(weekStartMs);

        if (!ranking.length) {
            return interaction.reply({
                content: "今週のRR履歴がまだありません。",
                ephemeral: true
            });
        }

        const text = ranking.map((row, index) => {
            const medal =
                index === 0 ? "🥇" :
                index === 1 ? "🥈" :
                index === 2 ? "🥉" :
                `${index + 1}.`;

            const user = getUser(row.userId);

            const rankText = user
                ? `${getRankText(user.currentRank)} ${user.rr}RR`
                : "プロフィールなし";

            const diffText = row.totalDiff > 0
                ? `+${row.totalDiff}RR`
                : `${row.totalDiff}RR`;

            return `${medal} <@${row.userId}>
📈 **${diffText}**
${rankText}`;
        }).join("\n\n").slice(0, 4096);

        const embed = new EmbedBuilder()
            .setColor(0xf1c40f)
            .setTitle("🏆 WEEKLY RR RANKING")
            .setDescription(
`${text}

━━━━━━━━━━━━━━

📅 **集計期間**
${formatDate(weekStartMs)} ～`
            )
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            ephemeral: false
        });
    }
};