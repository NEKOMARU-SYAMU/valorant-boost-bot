const { EmbedBuilder } = require("discord.js");

const {
    getAllUsers,
    getSubs
} = require("../database/database");

const { getRankText } = require("../utils/rankManager");
const { calculateProgress, makeBar } = require("../utils/progressManager");

function formatLastMatch(user) {
    if (!user.lastMatchId) return "なし";

    const result = user.lastMatchResult || "未取得";
    const resultIcon =
        result.toLowerCase().includes("victory") || result.includes("勝")
            ? "🟢"
            : result.toLowerCase().includes("defeat") || result.includes("負")
                ? "🔴"
                : "⚪";

    const rr = Number(user.lastMatchRR || 0);
    const rrText = rr > 0 ? `+${rr}RR` : rr < 0 ? `${rr}RR` : "±0RR";

    return `${resultIcon} ${result}
🗺️ ${user.lastMatchMap || "不明"}
⭐ ${rrText}`;
}

function formatSubs(userId) {
    const subs = getSubs(userId);

    if (!subs.length) {
        return "なし";
    }

    const total = subs.reduce((sum, sub) => sum + sub.amount, 0);

    const text = subs
        .map(sub => `${getRankText(sub.rankId)} ×${sub.amount}`)
        .join("\n");

    return `${text}
（合計${total}個）`;
}

function buildMemberListEmbed() {
    const users = getAllUsers();

    const text = users.length
        ? users.map((user, index) => {
            const medal =
                index === 0 ? "🥇" :
                index === 1 ? "🥈" :
                index === 2 ? "🥉" :
                `**${index + 1}.**`;

            const progress = calculateProgress(
                user.currentRank,
                user.rr,
                user.targetRank
            );

            const riotId = user.riotName && user.riotTag
                ? `${user.riotName}#${user.riotTag}`
                : "未登録";

            const unratedText = user.isUnrated
                ? "\n⚠️ コンペ未認定（アイアン1・0RRで仮登録）"
                : "";

            return `${medal} <@${user.userId}>
🎮 ${riotId}

📈 ${getRankText(user.currentRank)} ${user.rr}RR${unratedText}
🎯 ${getRankText(user.targetRank)}

${makeBar(progress.percent)} ${progress.percent}%

📌 あと${progress.remainingRR}RR

⚔️ 最新試合
${formatLastMatch(user)}

📦 サブ垢
${formatSubs(user.userId)}

🕒 ${user.lastApiUpdate || user.updatedAt || "不明"} 更新
────────────────────`;
        }).join("\n")
        : "まだ登録されているメンバーはいません。";

    return new EmbedBuilder()
        .setColor(0xE63946)
        .setTitle("🏆 BOOST MEMBER LIST")
        .setDescription(text)
        .setFooter({
            text: `👥 登録メンバー：${users.length}人`
        })
        .setTimestamp();
}

module.exports = {
    buildMemberListEmbed
};