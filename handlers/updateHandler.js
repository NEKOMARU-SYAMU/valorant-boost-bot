const {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const {
    getUser,
    getSubs,
    saveUser,
    saveUndo,
    addSub,
    removeSub
} = require("../database/database");

const { RANKS, getRankText, getRankIdByName } = require("../utils/rankManager");
const { calculateProgress } = require("../utils/progressManager");
const { buildProfileEmbed } = require("../embeds/profileEmbed");
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

function buildUpdateMenu() {
    return [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("update_riot")
                .setLabel("Riotアカウント")
                .setEmoji("🎮")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("update_target")
                .setLabel("目標ランク")
                .setEmoji("🎯")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId("update_comment")
                .setLabel("コメント")
                .setEmoji("💬")
                .setStyle(ButtonStyle.Secondary)
        ),
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("update_sub_add")
                .setLabel("サブ垢追加")
                .setEmoji("📦")
                .setStyle(ButtonStyle.Primary),
            new ButtonBuilder()
                .setCustomId("update_sub_remove")
                .setLabel("サブ垢削除")
                .setEmoji("🗑️")
                .setStyle(ButtonStyle.Danger)
        )
    ];
}

async function sendUpdatedProfile(interaction, updatedUser, message = "✅ プロフィールを更新しました。") {
    await updatePublish(interaction.guild);

    const subs = getSubs(interaction.user.id);
    const embed = buildProfileEmbed(updatedUser, subs, interaction.user);

    return interaction.reply({
        content: message,
        embeds: [embed],
        ephemeral: true
    });
}

async function handleUpdateButton(interaction) {
    const user = getUser(interaction.user.id);

    if (!user) {
        return interaction.reply({
            content: "プロフィールが登録されていません。先に `/register` を実行してください。",
            ephemeral: true
        });
    }

    if (interaction.customId === "update_riot") {
        const modal = new ModalBuilder()
            .setCustomId("update_riot_modal")
            .setTitle("Riotアカウント変更");

        const riotNameInput = new TextInputBuilder()
            .setCustomId("riot_name")
            .setLabel("Riot ID")
            .setPlaceholder("例：ねこまる")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        const riotTagInput = new TextInputBuilder()
            .setCustomId("riot_tag")
            .setLabel("Tag")
            .setPlaceholder("例：4545")
            .setRequired(true)
            .setStyle(TextInputStyle.Short);

        modal.addComponents(
            new ActionRowBuilder().addComponents(riotNameInput),
            new ActionRowBuilder().addComponents(riotTagInput)
        );

        return interaction.showModal(modal);
    }

    if (interaction.customId === "update_target") {
        const menu = new StringSelectMenuBuilder()
            .setCustomId("update_target_rank")
            .setPlaceholder("🎯 新しい目標ランクを選択")
            .addOptions(rankOptions());

        return interaction.reply({
            content: "🎯 **目標ランクを選択してください。**",
            components: [new ActionRowBuilder().addComponents(menu)],
            ephemeral: true
        });
    }

    if (interaction.customId === "update_comment") {
        const modal = new ModalBuilder()
            .setCustomId("update_comment_modal")
            .setTitle("コメント変更");

        const input = new TextInputBuilder()
            .setCustomId("comment")
            .setLabel("コメント")
            .setPlaceholder("空欄でコメント削除")
            .setRequired(false)
            .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(new ActionRowBuilder().addComponents(input));

        return interaction.showModal(modal);
    }

    if (interaction.customId === "update_sub_add") {
        const rankMenu = new StringSelectMenuBuilder()
            .setCustomId("update_sub_add_rank")
            .setPlaceholder("📦 追加するサブ垢ランクを選択")
            .addOptions(rankOptions());

        const amountMenu = new StringSelectMenuBuilder()
            .setCustomId("update_sub_add_amount")
            .setPlaceholder("📦 追加する保持数を選択")
            .addOptions(amountOptions());

        interaction.client.updateCache ??= new Map();

        interaction.client.updateCache.set(interaction.user.id, {
            subRank: null,
            subAmount: null
        });

        return interaction.reply({
            content: "📦 **追加するサブ垢のランクと保持数を選択してください。**",
            components: [
                new ActionRowBuilder().addComponents(rankMenu),
                new ActionRowBuilder().addComponents(amountMenu),
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId("update_sub_add_confirm")
                        .setLabel("追加する")
                        .setEmoji("➕")
                        .setStyle(ButtonStyle.Success)
                )
            ],
            ephemeral: true
        });
    }

    if (interaction.customId === "update_sub_remove") {
        const subs = getSubs(interaction.user.id);

        if (!subs.length) {
            return interaction.reply({
                content: "削除できるサブ垢がありません。",
                ephemeral: true
            });
        }

        const menu = new StringSelectMenuBuilder()
            .setCustomId("update_sub_remove_select")
            .setPlaceholder("🗑️ 削除するサブ垢を選択")
            .addOptions(
                subs.slice(0, 25).map(sub => ({
                    label: `${getRankText(sub.rankId)} ×${sub.amount}`,
                    value: String(sub.id)
                }))
            );

        return interaction.reply({
            content: "🗑️ **削除するサブ垢を選択してください。**",
            components: [new ActionRowBuilder().addComponents(menu)],
            ephemeral: true
        });
    }

    if (interaction.customId === "update_sub_add_confirm") {
        const cache = interaction.client.updateCache?.get(interaction.user.id);

        if (!cache?.subRank || !cache?.subAmount) {
            return interaction.reply({
                content: "⚠️ ランクと保持数を両方選択してください。",
                ephemeral: true
            });
        }

        saveUndo(interaction.user.id, {
            user,
            subs: getSubs(interaction.user.id)
        });

        addSub(interaction.user.id, cache.subRank, cache.subAmount);

        interaction.client.updateCache.delete(interaction.user.id);

        const updatedUser = {
            ...user,
            username: interaction.user.username,
            updatedAt: new Date().toLocaleString("ja-JP")
        };

        saveUser(updatedUser);

        return sendUpdatedProfile(
            interaction,
            updatedUser,
            `✅ サブ垢を追加しました。\n${getRankText(cache.subRank)} ×${cache.subAmount}`
        );
    }
}

async function handleUpdateSelectMenu(interaction) {
    const user = getUser(interaction.user.id);

    if (!user) {
        return interaction.reply({
            content: "プロフィールが登録されていません。先に `/register` を実行してください。",
            ephemeral: true
        });
    }

    if (interaction.customId === "update_sub_add_rank") {
        interaction.client.updateCache ??= new Map();

        const cache = interaction.client.updateCache.get(interaction.user.id) || {};
        cache.subRank = Number(interaction.values[0]);

        interaction.client.updateCache.set(interaction.user.id, cache);

        return interaction.reply({
            content: `📦 追加ランク：**${getRankText(cache.subRank)}**`,
            ephemeral: true
        });
    }

    if (interaction.customId === "update_sub_add_amount") {
        interaction.client.updateCache ??= new Map();

        const cache = interaction.client.updateCache.get(interaction.user.id) || {};
        cache.subAmount = Number(interaction.values[0]);

        interaction.client.updateCache.set(interaction.user.id, cache);

        return interaction.reply({
            content: `📦 追加数：**${cache.subAmount}個**`,
            ephemeral: true
        });
    }

    if (interaction.customId === "update_sub_remove_select") {
        saveUndo(interaction.user.id, {
            user,
            subs: getSubs(interaction.user.id)
        });

        removeSub(Number(interaction.values[0]));

        const updatedUser = {
            ...user,
            username: interaction.user.username,
            updatedAt: new Date().toLocaleString("ja-JP")
        };

        saveUser(updatedUser);

        return sendUpdatedProfile(interaction, updatedUser, "🗑️ サブ垢を削除しました。");
    }

    if (interaction.customId === "update_target_rank") {
        saveUndo(interaction.user.id, {
            user,
            subs: getSubs(interaction.user.id)
        });

        const updatedUser = {
            ...user,
            username: interaction.user.username,
            targetRank: Number(interaction.values[0]),
            updatedAt: new Date().toLocaleString("ja-JP")
        };

        const progress = calculateProgress(
            updatedUser.currentRank,
            updatedUser.rr,
            updatedUser.targetRank
        );

        updatedUser.progress = progress.percent;

        saveUser(updatedUser);

        return sendUpdatedProfile(interaction, updatedUser);
    }
}

async function handleUpdateModal(interaction) {
    const user = getUser(interaction.user.id);

    if (!user) {
        return interaction.reply({
            content: "プロフィールが登録されていません。先に `/register` を実行してください。",
            ephemeral: true
        });
    }

    if (interaction.customId === "update_comment_modal") {
        saveUndo(interaction.user.id, {
            user,
            subs: getSubs(interaction.user.id)
        });

        const comment = interaction.fields.getTextInputValue("comment") || "";

        const updatedUser = {
            ...user,
            username: interaction.user.username,
            comment,
            updatedAt: new Date().toLocaleString("ja-JP")
        };

        saveUser(updatedUser);

        return sendUpdatedProfile(interaction, updatedUser, "✅ コメントを更新しました。");
    }

    if (interaction.customId === "update_riot_modal") {
        await interaction.deferReply({ ephemeral: true });

        const riotName = interaction.fields.getTextInputValue("riot_name").trim();
        const riotTag = interaction.fields.getTextInputValue("riot_tag").trim();
        const region = "ap";

        try {
            const mmr = await getCurrentMMR(region, riotName, riotTag);
            const latestMatch = await getLatestMatch(region, riotName, riotTag);

            let rankId = getRankIdByName(mmr.rankName);
            let rr = Number(mmr.rr || 0);
            let unrated = false;

            if (!rankId) {
                rankId = 1;
                rr = 0;
                unrated = true;
            }

            saveUndo(interaction.user.id, {
                user,
                subs: getSubs(interaction.user.id)
            });

            const now = new Date().toLocaleString("ja-JP");
            const progress = calculateProgress(rankId, rr, user.targetRank);

            const updatedUser = {
                ...user,
                username: interaction.user.username,
                riotName,
                riotTag,
                region,
                currentRank: rankId,
                rr,
                isUnrated: unrated ? 1 : 0,
                previousRank: user.currentRank,
                previousRR: user.rr,
                lastDiffRR: 0,
                progress: progress.percent,
                lastMatchId: latestMatch?.matchId || null,
                lastMatchMap: latestMatch?.map || null,
                lastMatchScore: latestMatch?.score || null,
                lastMatchResult: null,
                lastMatchRR: 0,
                lastApiUpdate: now,
                apiError: null,
                updatedAt: now
            };

            saveUser(updatedUser);
            await updatePublish(interaction.guild);

            const subs = getSubs(interaction.user.id);
            const embed = buildProfileEmbed(updatedUser, subs, interaction.user);

            return interaction.editReply({
                content:
`✅ Riotアカウントを変更しました。

🎮 Riot ID：**${riotName}#${riotTag}**
📈 現在ランク：**${getRankText(rankId)}**
⭐ 現在RR：**${rr}RR**

${unrated ? "⚠️ このアカウントは現在コンペティティブ未認定（Unrated）のため、仮に「アイアン1・0RR」として登録しています。\n認定戦終了後は自動で実際のランク・RRへ更新されます。" : ""}`,
                embeds: [embed]
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
}

module.exports = {
    buildUpdateMenu,
    handleUpdateButton,
    handleUpdateSelectMenu,
    handleUpdateModal
};