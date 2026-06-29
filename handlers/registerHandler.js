const {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    StringSelectMenuBuilder
} = require("discord.js");

const {
    saveUser,
    getSubs,
    addSub,
    clearSubs
} = require("../database/database");

const { buildProfileEmbed } = require("../embeds/profileEmbed");
const { RANKS, getRankText } = require("../utils/rankManager");
const { calculateProgress } = require("../utils/progressManager");
const { updatePublish } = require("../utils/publishManager");

function rankOptions() {
    return RANKS.map(rank => ({
        label: rank.name,
        value: String(rank.id),
        emoji: rank.emoji
    }));
}

function amountOptions() {
    return Array.from({ length: 10 }, (_, i) => ({
        label: `${i + 1}個`,
        value: String(i + 1)
    }));
}

function buildSubAccountText(subs) {
    if (!subs || subs.length === 0) return "なし";

    return subs
        .map(sub => `${getRankText(sub.rankId)} ×${sub.amount}`)
        .join("\n");
}

function buildSubRegisterComponents() {
    const addButton = new ButtonBuilder()
        .setCustomId("register_sub_add")
        .setLabel("サブアカ追加")
        .setEmoji("📦")
        .setStyle(ButtonStyle.Secondary);

    const finishButton = new ButtonBuilder()
        .setCustomId("register_finish")
        .setLabel("登録完了")
        .setEmoji("✅")
        .setStyle(ButtonStyle.Success);

    return [
        new ActionRowBuilder().addComponents(addButton, finishButton)
    ];
}

async function handleRegisterSelectMenu(interaction, client) {
    const data = client.registerCache.get(interaction.user.id);

    if (!data) {
        return interaction.reply({
            content: "登録データが見つかりません。もう一度 `/register` を実行してください。",
            ephemeral: true
        });
    }

    if (interaction.customId === "register_target_rank") {
        data.targetRank = Number(interaction.values[0]);
        client.registerCache.set(interaction.user.id, data);

        return interaction.reply({
            content: `🎯 目標ランクを **${getRankText(data.targetRank)}** に設定しました。`,
            ephemeral: true
        });
    }

    if (interaction.customId === "register_current_rank") {
        data.currentRank = Number(interaction.values[0]);
        client.registerCache.set(interaction.user.id, data);

        return interaction.reply({
            content: `📈 現在ランクを **${getRankText(data.currentRank)}** に設定しました。`,
            ephemeral: true
        });
    }

    if (interaction.customId === "register_sub_rank") {
        data.pendingSubRank = Number(interaction.values[0]);
        client.registerCache.set(interaction.user.id, data);

        return interaction.reply({
            content: `📦 サブアカのランクを **${getRankText(data.pendingSubRank)}** に設定しました。`,
            ephemeral: true
        });
    }

    if (interaction.customId === "register_sub_amount") {
        data.pendingSubAmount = Number(interaction.values[0]);
        client.registerCache.set(interaction.user.id, data);

        return interaction.reply({
            content: `📦 保持数を **${data.pendingSubAmount}個** に設定しました。`,
            ephemeral: true
        });
    }
}

async function handleRegisterButton(interaction, client) {
    const data = client.registerCache.get(interaction.user.id);

    if (!data) {
        return interaction.reply({
            content: "登録データが見つかりません。もう一度 `/register` を実行してください。",
            ephemeral: true
        });
    }

    if (interaction.customId === "register_next") {
        if (!data.targetRank || !data.currentRank) {
            return interaction.reply({
                content: "⚠️ 目標ランクと現在ランクを両方選択してください。",
                ephemeral: true
            });
        }

        const modal = new ModalBuilder()
            .setCustomId("register_modal")
            .setTitle("プロフィール登録");

        const rrInput = new TextInputBuilder()
            .setCustomId("rr")
            .setLabel("現在RR")
            .setPlaceholder("0～99")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        const commentInput = new TextInputBuilder()
            .setCustomId("comment")
            .setLabel("コメント（任意）")
            .setPlaceholder("例：夜なら対応できます")
            .setRequired(false)
            .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(
            new ActionRowBuilder().addComponents(rrInput),
            new ActionRowBuilder().addComponents(commentInput)
        );

        return interaction.showModal(modal);
    }

    if (interaction.customId === "register_sub_add") {
        const rankMenu = new StringSelectMenuBuilder()
            .setCustomId("register_sub_rank")
            .setPlaceholder("📦 サブアカのランクを選択")
            .addOptions(rankOptions());

        const amountMenu = new StringSelectMenuBuilder()
            .setCustomId("register_sub_amount")
            .setPlaceholder("📦 保持数を選択")
            .addOptions(amountOptions());

        const confirmButton = new ButtonBuilder()
            .setCustomId("register_sub_confirm")
            .setLabel("このサブアカを追加")
            .setEmoji("➕")
            .setStyle(ButtonStyle.Primary);

        return interaction.reply({
            content: "📦 **サブアカウント追加**\n\nランクと保持数を選択してください。",
            components: [
                new ActionRowBuilder().addComponents(rankMenu),
                new ActionRowBuilder().addComponents(amountMenu),
                new ActionRowBuilder().addComponents(confirmButton)
            ],
            ephemeral: true
        });
    }

    if (interaction.customId === "register_sub_confirm") {
        if (!data.pendingSubRank || !data.pendingSubAmount) {
            return interaction.reply({
                content: "⚠️ サブアカのランクと保持数を選択してください。",
                ephemeral: true
            });
        }

        const existing = data.subs.find(sub => sub.rankId === data.pendingSubRank);

        if (existing) {
            existing.amount += data.pendingSubAmount;
        } else {
            data.subs.push({
                rankId: data.pendingSubRank,
                amount: data.pendingSubAmount
            });
        }

        data.pendingSubRank = null;
        data.pendingSubAmount = null;

        client.registerCache.set(interaction.user.id, data);

        return interaction.reply({
            content:
`✅ サブアカウントを追加しました。

📦【現在のサブアカウント】
${buildSubAccountText(data.subs)}

続けて追加する場合は「サブアカ追加」、終わる場合は「登録完了」を押してください。`,
            components: buildSubRegisterComponents(),
            ephemeral: true
        });
    }

    if (interaction.customId === "register_finish") {
        const rr = Number(data.rr);
        const progress = calculateProgress(data.currentRank, rr, data.targetRank);
        const now = new Date().toLocaleString("ja-JP");

        const userData = {
            userId: interaction.user.id,
            username: interaction.user.username,
            targetRank: data.targetRank,
            currentRank: data.currentRank,
            rr,
            previousRank: data.currentRank,
            previousRR: rr,
            lastDiffRR: 0,
            progress: progress.percent,
            comment: data.comment || "",
            messageId: null,
            updatedAt: now
        };

        saveUser(userData);
        clearSubs(interaction.user.id);

        for (const sub of data.subs) {
            addSub(interaction.user.id, sub.rankId, sub.amount);
        }

        await updatePublish(interaction.guild);

        client.registerCache.delete(interaction.user.id);

        const savedSubs = getSubs(interaction.user.id);
        const embed = buildProfileEmbed(userData, savedSubs, interaction.user);

        return interaction.reply({
            content: "✅ **プロフィール登録が完了しました！**",
            embeds: [embed],
            ephemeral: true
        });
    }
}

async function handleRegisterModal(interaction, client) {
    const data = client.registerCache.get(interaction.user.id);

    if (!data) {
        return interaction.reply({
            content: "登録データが見つかりません。もう一度 `/register` を実行してください。",
            ephemeral: true
        });
    }

    const rr = Number(interaction.fields.getTextInputValue("rr"));

    if (Number.isNaN(rr) || rr < 0 || rr > 99) {
        return interaction.reply({
            content: "⚠️ RRは0〜99の数字で入力してください。",
            ephemeral: true
        });
    }

    data.rr = rr;
    data.comment = interaction.fields.getTextInputValue("comment") || "";

    client.registerCache.set(interaction.user.id, data);

    return interaction.reply({
        content:
`✅ 基本情報を保存しました。

📦 次にサブアカウントを登録できます。
必要ない場合は「登録完了」を押してください。

📦【現在のサブアカウント】
${buildSubAccountText(data.subs)}`,
        components: buildSubRegisterComponents(),
        ephemeral: true
    });
}

module.exports = {
    handleRegisterSelectMenu,
    handleRegisterButton,
    handleRegisterModal
};