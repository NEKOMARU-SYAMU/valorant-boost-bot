const { EmbedBuilder } = require("discord.js");

const {
    getAllUsers,
    getSubs
} = require("../database/database");

const { getRankText } = require("../utils/rankManager");
const { calculateProgress, makeBar } = require("../utils/progressManager");

function formatDate(value) {
    if (!value) return "不明";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("ja-JP", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function formatLastMatch(user) {
    const result = user.lastMatchResult || "未取得";

    const resultIcon =
        result.toLowerCase().includes("victory") || result.includes("勝")
            ? "🟢"
            : result.toLowerCase().includes("defeat") || result.includes("負")
                ? "🔴"
                : "⚪";

    const rr = Number(user.lastMatchRR || 0);
    const rrText = rr > 0 ? `+${rr}RR` : rr < 0 ? `${rr}RR` : "±0RR";

    if (!user.lastMatchId || result === "未取得") {
        return `${resultIcon} 未取得
Unknown
${rrText}`;
    }

    const map = user.lastMatchMap || "Unknown";
    const score = user.lastMatchScore ? `（${user.lastMatchScore}）` : "";

    return `${resultIcon} ${result}
${map}${score}
${rrText}`;
}

function formatSubs(userId) {
    const subs = getSubs(userId);

    if (!subs.length) {
        return {
            total: 0,
            text: "なし"
        };
    }

    const total = subs.reduce((sum, sub) => sum + sub.amount, 0);

    const text = subs
        .map(sub => `${getRankText(sub.rankId)} ×${sub.amount}`)
        .join("\n");

    return {
        total,
        text
    };
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
                ? "\n⚠️ コンペ未認定（仮登録）"
                : "";

            const subs = formatSubs(user.userId);

            return `${medal} <@${user.userId}>
${riotId}

• 現在
${getRankText(user.currentRank)}　${user.rr}RR${unratedText}

• 目標
${getRankText(user.targetRank)}

• 進捗
${makeBar(progress.percent)} ${progress.percent}%
あと${progress.remainingRR}RR

• 最新試合
${formatLastMatch(user)}

• サブ垢（合計${subs.total}個）
${subs.text}

最終更新：${formatDate(user.lastApiUpdate || user.updatedAt)}
────────────────────`;
        }).join("\n")
        : "まだ登録されているメンバーはいません。";

    return new EmbedBuilder()
        .setColor(0xE63946)
        .setTitle("🏆 VALORANT MEMBER LIST")
        .setDescription(text)
        .setFooter({
            text: `登録メンバー：${users.length}人`
        })
        .setTimestamp();
}

module.exports = {
    buildMemberListEmbed
};