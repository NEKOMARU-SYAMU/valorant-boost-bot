const { EmbedBuilder } = require("discord.js");
const { getRankInfo, getRankText } = require("../utils/rankManager");
const { calculateProgress, calculateDiffText, makeBar } = require("../utils/progressManager");

function buildSubText(subs, getRankText) {
    if (!subs || subs.length === 0) return "なし";

    return subs
        .map(sub => `${getRankText(sub.rankId)} ×${sub.amount}`)
        .join("\n");
}

function buildLastMatchText(user) {
    if (!user.lastMatchId) return "なし";

    const result = user.lastMatchResult || "未取得";
    const map = user.lastMatchMap || "不明";
    const score = user.lastMatchScore || "不明";
    const rr = Number(user.lastMatchRR || 0);

    const rrText =
        rr > 0 ? `+${rr}RR` :
        rr < 0 ? `${rr}RR` :
        "±0RR";

    return `${result}
🗺️ ${map}
🏆 ${score}
⭐ ${rrText}`;
}

function buildProfileEmbed(user, subs, discordUser) {
    const currentRank = getRankInfo(user.currentRank);
    const progress = calculateProgress(user.currentRank, user.rr, user.targetRank);

    const totalSubs = subs.reduce((sum, sub) => sum + sub.amount, 0);

    const riotId = user.riotName && user.riotTag
        ? `${user.riotName}#${user.riotTag}`
        : "未登録";

    const embed = new EmbedBuilder()
        .setColor(currentRank?.color || 0x2f3136)
        .setTitle("🎮 VALORANT PROFILE")
        .setThumbnail(discordUser.displayAvatarURL({ dynamic: true }))
        .addFields(
            {
                name: "👤【ユーザー】",
                value: `<@${user.userId}>`,
                inline: false
            },
            {
                name: "🎮【Riot ID】",
                value: riotId,
                inline: false
            },
            {
                name: "🎯【目標ランク】",
                value: getRankText(user.targetRank),
                inline: false
            },
            {
                name: "📈【現在ランク】",
                value:
`${getRankText(user.currentRank)}

⭐【現在RR】
${makeBar(user.rr)}
${user.rr} / 100RR

${calculateDiffText(user.lastDiffRR)}`,
                inline: false
            },
            {
                name: "⚔️【最新試合】",
                value: buildLastMatchText(user),
                inline: false
            },
            {
                name: "📊【目標達成率】",
                value:
`${progress.bar}
${progress.percent}%

🎯 あと ${progress.remainingRR}RR`,
                inline: false
            },
            {
                name: "📦【サブアカウント】",
                value:
`${buildSubText(subs, getRankText)}

総保持数：${totalSubs}アカウント`,
                inline: false
            }
        )
        .setFooter({
            text: `最終更新：${user.updatedAt || "不明"} / API更新：${user.lastApiUpdate || "未取得"}`
        });

    if (user.comment && user.comment.trim() !== "") {
        embed.addFields({
            name: "💬【コメント】",
            value: user.comment,
            inline: false
        });
    }

    if (user.apiError) {
        embed.addFields({
            name: "⚠️【API状態】",
            value: user.apiError,
            inline: false
        });
    }

    return embed;
}

module.exports = {
    buildProfileEmbed
};