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
const { RANKS, getRankText, getRankIdByName } = require("../utils/rankManager");
const { calculateProgress } = require("../utils/progressManager");
const { updatePublish } = require("../utils/publishManager");
const { getCurrentMMR, getLatestMatch } = require("../utils/valorantApi");

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
            content:
`🎯 目標ランクを **${getRankText(data.targetRank)}** に設定しました。

次にサブアカウントを登録できます。
必要ない場合は「登録完了」を押してください。`,
            components: buildSubRegisterComponents(),
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
        if (!data.targetRank) {
            return interaction.reply({
                content: "⚠️ 目標ランクを選択してください。",
                ephemeral: true
            });
        }

        const progress = calculateProgress(data.currentRank, data.rr, data.targetRank);
        const now = new Date().toLocaleString("ja-JP");

        const userData = {
            userId: interaction.user.id,
            username: interaction.user.username,
            targetRank: data.targetRank,
            currentRank: data.currentRank,
            rr: data.rr,
            previousRank: data.currentRank,
            previousRR: data.rr,
            lastDiffRR: 0,
            progress: progress.percent,
            comment: data.comment || "",
            messageId: null,
            updatedAt: now,

            riotName: data.riotName,
            riotTag: data.riotTag,
            region: data.region || "ap",
            lastMatchId: data.lastMatchId || null,
            lastMatchResult: data.lastMatchResult || null,
            lastMatchMap: data.lastMatchMap || null,
            lastMatchScore: data.lastMatchScore || null,
            lastMatchRR: 0,
            lastApiUpdate: now,
            apiError: null
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
    if (interaction.customId !== "register_modal") return;

    await interaction.deferReply({ ephemeral: true });

    const riotName = interaction.fields.getTextInputValue("riot_name").trim();
    const riotTag = interaction.fields.getTextInputValue("riot_tag").trim();
    const comment = interaction.fields.getTextInputValue("comment") || "";
    const region = "ap";

    try {
        const mmr = await getCurrentMMR(region, riotName, riotTag);
        const latestMatch = await getLatestMatch(region, riotName, riotTag);

        const rankId = getRankIdByName(mmr.rankName);

        if (!rankId) {
            return interaction.editReply({
                content:
`⚠️ 現在ランクをBot内のランクに変換できませんでした。

取得ランク：${mmr.rankName}

Unratedの場合は、コンペ認定後にもう一度登録してください。`
            });
        }

        client.registerCache.set(interaction.user.id, {
            riotName,
            riotTag,
            region,
            currentRank: rankId,
            rr: mmr.rr,
            targetRank: null,
            comment,
            subs: [],
            pendingSubRank: null,
            pendingSubAmount: null,
            lastMatchId: latestMatch?.matchId || null,
            lastMatchResult: null,
            lastMatchMap: latestMatch?.map || null,
            lastMatchScore: latestMatch?.score || null
        });

        const targetMenu = new StringSelectMenuBuilder()
            .setCustomId("register_target_rank")
            .setPlaceholder("🎯 目標ランクを選択")
            .addOptions(rankOptions());

        return interaction.editReply({
            content:
`✅ Riotアカウントを確認しました。

🎮 Riot ID：**${riotName}#${riotTag}**
📈 現在ランク：**${getRankText(rankId)}**
⭐ 現在RR：**${mmr.rr}RR**

次に目標ランクを選択してください。`,
            components: [
                new ActionRowBuilder().addComponents(targetMenu)
            ]
        });

    } catch (error) {
        return interaction.editReply({
            content:
`❌ Riotアカウント情報を取得できませんでした。

入力したRiot IDとTagを確認してください。

\`\`\`
${error.message}
\`\`\``
        });
    }
}

module.exports = {
    handleRegisterSelectMenu,
    handleRegisterButton,
    handleRegisterModal
};