const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { getUser, getSubs } = require("../database/database");
const { getRankText } = require("./rankManager");
const { calculateProgress } = require("./progressManager");

function sortUsers(users, mode) {
    if (mode === "progress") {
        return users.sort((a, b) => b.progress - a.progress);
    }

    if (mode === "updated") {
        return users.sort((a, b) => {
            const aTime = new Date(a.updatedAt || 0).getTime();
            const bTime = new Date(b.updatedAt || 0).getTime();
            return bTime - aTime;
        });
    }

    return users.sort((a, b) => {
        if (b.currentRank !== a.currentRank) return b.currentRank - a.currentRank;
        return b.rr - a.rr;
    });
}

function createVCEmbed(voiceChannel, mode = "rank") {
    const members = [...voiceChannel.members.values()].filter(m => !m.user.bot);

    const registered = [];
    const unregistered = [];

    for (const member of members) {
        const user = getUser(member.user.id);

        if (!user) {
            unregistered.push(member.user.id);
            continue;
        }

        const subs = getSubs(member.user.id);
        const totalSubs = subs.reduce((sum, sub) => sum + sub.amount, 0);
        const progress = calculateProgress(user.currentRank, user.rr, user.targetRank);

        registered.push({
            userId: member.user.id,
            currentRank: user.currentRank,
            rr: user.rr,
            targetRank: user.targetRank,
            progress: progress.percent,
            remainingRR: progress.remainingRR,
            totalSubs,
            updatedAt: user.updatedAt
        });
    }

    sortUsers(registered, mode);

    const modeText =
        mode === "progress" ? "🎯 達成率順" :
        mode === "updated" ? "🕒 更新順" :
        "🏆 ランク順";

    const registeredText = registered.length
        ? registered.map((user, index) => {
            const medal =
                index === 0 ? "🥇" :
                index === 1 ? "🥈" :
                index === 2 ? "🥉" :
                `${index + 1}.`;

            return `${medal} <@${user.userId}>
${getRankText(user.currentRank)} ${user.rr}RR
🎯 目標：${getRankText(user.targetRank)}
📊 達成率：${user.progress}%
🎯 あと${user.remainingRR}RR
📦 サブ垢：${user.totalSubs}個`;
        }).join("\n\n").slice(0, 1024)
        : "登録済みメンバーはいません。";

    const unregisteredText = unregistered.length
        ? unregistered.map(id => `<@${id}>`).join("\n")
        : "なし";

    const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("🎮 VCメンバー一覧")
        .setDescription(`🔊 **${voiceChannel.name}**\n👥 参加人数：${members.length}人\n📌 表示：${modeText}`)
        .addFields(
            {
                name: `✅【登録済み】${registered.length}人`,
                value: registeredText,
                inline: false
            },
            {
                name: `⚠️【未登録】${unregistered.length}人`,
                value: unregisteredText,
                inline: false
            },
            {
                name: "👤【詳細表示】",
                value: "詳しく見たい場合は `/search user:@メンバー` を使ってください。",
                inline: false
            }
        )
        .setTimestamp();

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("vc_sort_rank")
            .setLabel("ランク順")
            .setEmoji("🏆")
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId("vc_sort_progress")
            .setLabel("達成率順")
            .setEmoji("🎯")
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId("vc_sort_updated")
            .setLabel("更新順")
            .setEmoji("🕒")
            .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
            .setCustomId("vc_refresh")
            .setLabel("更新")
            .setEmoji("🔄")
            .setStyle(ButtonStyle.Secondary)
    );

    return {
        embed,
        components: [buttons]
    };
}

module.exports = {
    createVCEmbed
};