const { EmbedBuilder } = require("discord.js");
const { getRankText, getRankInfo } = require("../utils/rankManager");

function buildRankUpEmbed(userId, oldRank, newRank, diffRR) {
    const newRankInfo = getRankInfo(newRank);

    return new EmbedBuilder()
        .setColor(newRankInfo?.color || 0x5865f2)
        .setTitle("🎉 RANK UP!")
        .setDescription(
`👤 <@${userId}>

${getRankText(oldRank)}
⬇
${getRankText(newRank)}

📈 変動：${diffRR > 0 ? `+${diffRR}` : diffRR}RR

おめでとうございます！🎊`
        )
        .setTimestamp();
}

module.exports = {
    buildRankUpEmbed
};