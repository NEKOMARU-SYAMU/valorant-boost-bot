const { EmbedBuilder } = require("discord.js");
const { getRankText } = require("../utils/rankManager");

function formatDiffRR(diffRR) {
    if (diffRR > 0) return `+${diffRR}RR`;
    if (diffRR < 0) return `${diffRR}RR`;
    return "±0RR";
}

function buildMatchResultEmbed(user, diffRR) {
    return new EmbedBuilder()
        .setColor(diffRR >= 0 ? 0x2ecc71 : 0xe74c3c)
        .setTitle("⚔️ 試合結果更新")
        .setDescription(`<@${user.userId}>`)
        .addFields(
            {
                name: "📈 現在ランク",
                value: `${getRankText(user.currentRank)} ${user.rr}RR`,
                inline: false
            },
            {
                name: "⭐ RR変動",
                value: formatDiffRR(diffRR),
                inline: true
            },
            {
                name: "🗺️ マップ",
                value: user.lastMatchMap || "不明",
                inline: true
            },
            {
                name: "🏆 スコア",
                value: user.lastMatchScore || "不明",
                inline: true
            },
            {
                name: "結果",
                value: user.lastMatchResult || "未取得",
                inline: false
            }
        )
        .setFooter({ text: `更新：${user.lastApiUpdate || "不明"}` });
}

function buildRankUpEmbed(oldUser, newUser, diffRR) {
    return new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle("🎉 RANK UP!")
        .setDescription(`<@${newUser.userId}>`)
        .addFields(
            {
                name: "Before",
                value: `${getRankText(oldUser.currentRank)} ${oldUser.rr}RR`,
                inline: true
            },
            {
                name: "After",
                value: `${getRankText(newUser.currentRank)} ${newUser.rr}RR`,
                inline: true
            },
            {
                name: "RR変動",
                value: formatDiffRR(diffRR),
                inline: false
            }
        );
}

function buildRankDownEmbed(oldUser, newUser, diffRR) {
    return new EmbedBuilder()
        .setColor(0xe74c3c)
        .setTitle("📉 RANK DOWN")
        .setDescription(`<@${newUser.userId}>`)
        .addFields(
            {
                name: "Before",
                value: `${getRankText(oldUser.currentRank)} ${oldUser.rr}RR`,
                inline: true
            },
            {
                name: "After",
                value: `${getRankText(newUser.currentRank)} ${newUser.rr}RR`,
                inline: true
            },
            {
                name: "RR変動",
                value: formatDiffRR(diffRR),
                inline: false
            }
        );
}

function buildTargetAchievedEmbed(user) {
    return new EmbedBuilder()
        .setColor(0xf1c40f)
        .setTitle("🏆 TARGET COMPLETE")
        .setDescription(`🎉 <@${user.userId}> さんが目標ランクに到達しました！`)
        .addFields({
            name: "🎯 目標ランク",
            value: getRankText(user.targetRank),
            inline: false
        });
}

module.exports = {
    buildMatchResultEmbed,
    buildRankUpEmbed,
    buildRankDownEmbed,
    buildTargetAchievedEmbed
};