const { EmbedBuilder } = require("discord.js");
const { getUser } = require("../database/database");
const { getRankText } = require("./rankManager");

function createVCEmbed(voiceChannel) {
    const members = [...voiceChannel.members.values()].filter(m => !m.user.bot);

    const registered = [];
    const unregistered = [];

    for (const member of members) {
        const user = getUser(member.user.id);

        if (!user) {
            unregistered.push(member.user.id);
            continue;
        }

        registered.push(user);
    }

    registered.sort((a, b) => {
        if (b.currentRank !== a.currentRank) return b.currentRank - a.currentRank;
        return b.rr - a.rr;
    });

    const registeredText = registered.length
        ? registered.map((user, index) => {
            const medal =
                index === 0 ? "🥇" :
                index === 1 ? "🥈" :
                index === 2 ? "🥉" :
                `${index + 1}.`;

            return `${medal} <@${user.userId}>｜${getRankText(user.currentRank)} ${user.rr}RR`;
        }).join("\n")
        : "なし";

    const unregisteredText = unregistered.length
        ? unregistered.map(id => `<@${id}>`).join(" / ")
        : "なし";

    const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("🎮 VCメンバー一覧")
        .setDescription(`🔊 **${voiceChannel.name}**\n👥 参加人数：${members.length}人`)
        .addFields(
            {
                name: `✅ 登録済み ${registered.length}人`,
                value: registeredText,
                inline: false
            },
            {
                name: `⚠️ 未登録 ${unregistered.length}人`,
                value: unregisteredText,
                inline: false
            }
        )
        .setFooter({
            text: "詳細は /search user:@メンバー"
        })
        .setTimestamp();

    return {
        embed,
        components: []
    };
}

module.exports = {
    createVCEmbed
};