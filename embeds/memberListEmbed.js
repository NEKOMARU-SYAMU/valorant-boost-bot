const { EmbedBuilder } = require("discord.js");
const { getAllUsers } = require("../database/database");
const { getRankText } = require("../utils/rankManager");
const { calculateProgress } = require("../utils/progressManager");

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

            return `${medal} <@${user.userId}>

📈 **現在ランク**
${getRankText(user.currentRank)}　**${user.rr}RR**

🎯 **目標ランク**
${getRankText(user.targetRank)}

📊 **達成率**
**${progress.percent}%**

📌 **目標まで**
あと **${progress.remainingRR}RR**

────────────────────────`;
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