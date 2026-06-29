const {
    getUser,
    getSubs,
    saveUser,
    saveUndo,
    getSettings,
    addRRHistory
} = require("../database/database");

const { buildProfileEmbed } = require("../embeds/profileEmbed");
const { buildRankUpEmbed } = require("../embeds/rankUpEmbed");

const { calculateProgress } = require("../utils/progressManager");
const { applyRR } = require("../utils/rrManager");
const { getRankText } = require("../utils/rankManager");
const { updatePublish } = require("../utils/publishManager");

function normalizeRRInput(value) {
    value = value
        .replaceAll("＋", "+")
        .replaceAll("－", "-")
        .replaceAll("ー", "-")
        .replaceAll("−", "-")
        .replaceAll("―", "-")
        .replaceAll("ｰ", "-")
        .replace(/[０-９]/g, s =>
            String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
        )
        .trim();

    if (!value.startsWith("+") && !value.startsWith("-")) {
        value = "+" + value;
    }

    return Number(value);
}

async function handleRRModal(interaction) {
    const input = interaction.fields.getTextInputValue("rr_value");
    const diff = normalizeRRInput(input);

    if (Number.isNaN(diff)) {
        return interaction.reply({
            content: "⚠️ 数字を入力してください。\n例：20 / -15 / ＋25 / －30",
            ephemeral: true
        });
    }

    const user = getUser(interaction.user.id);

    if (!user) {
        return interaction.reply({
            content: "プロフィールが登録されていません。先に /register を実行してください。",
            ephemeral: true
        });
    }

    const oldRank = user.currentRank;
    const oldRR = user.rr;

    saveUndo(interaction.user.id, {
        user,
        subs: getSubs(interaction.user.id)
    });

    const result = applyRR(user.currentRank, user.rr, diff);

    const progress = calculateProgress(
        result.rank,
        result.rr,
        user.targetRank
    );

    const updatedUser = {
        ...user,
        username: interaction.user.username,
        currentRank: result.rank,
        rr: result.rr,
        previousRank: oldRank,
        previousRR: oldRR,
        lastDiffRR: diff,
        progress: progress.percent,
        updatedAt: new Date().toLocaleString("ja-JP")
    };

    saveUser(updatedUser);

    addRRHistory({
        userId: interaction.user.id,
        oldRank,
        oldRR,
        newRank: result.rank,
        newRR: result.rr,
        diffRR: diff,
        createdAt: new Date().toLocaleString("ja-JP"),
        createdAtMs: Date.now()
    });

    await updatePublish(interaction.guild);

    const subs = getSubs(interaction.user.id);
    const profileEmbed = buildProfileEmbed(updatedUser, subs, interaction.user);

    const rankUpEmbed = result.rank > oldRank
        ? buildRankUpEmbed(interaction.user.id, oldRank, result.rank, diff)
        : null;

    await interaction.reply({
        content:
`✅ RRを更新しました。

${getRankText(oldRank)} ${oldRR}RR
⬇
${getRankText(result.rank)} ${result.rr}RR

📈 変動：${diff > 0 ? `+${diff}` : diff}RR`,
        embeds: [profileEmbed],
        ephemeral: true
    });

    if (rankUpEmbed) {
        const settings = getSettings(interaction.guild.id);

        const notifyChannel = settings?.rankUpChannel
            ? await interaction.guild.channels.fetch(settings.rankUpChannel).catch(() => null)
            : interaction.channel;

        if (notifyChannel) {
            await notifyChannel.send({
                embeds: [rankUpEmbed]
            });
        }
    }
}

module.exports = {
    handleRRModal
};