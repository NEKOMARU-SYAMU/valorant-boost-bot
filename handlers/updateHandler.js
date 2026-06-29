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

const { RANKS, getRankText } = require("../utils/rankManager");
const { calculateProgress } = require("../utils/progressManager");
const { buildProfileEmbed } = require("../embeds/profileEmbed");
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

function buildUpdateMenu() {
    return [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("update_current")
                .setLabel("現在ランク")
                .setEmoji("📈")
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

    if (interaction.customId === "update_current") {
        const menu = new StringSelectMenuBuilder()
            .setCustomId("update_current_rank")
            .setPlaceholder("📈 新しい現在ランクを選択")
            .addOptions(rankOptions());

        return interaction.reply({
            content: "📈 **現在ランクを選択してください。**",
            components: [new ActionRowBuilder().addComponents(menu)],
            ephemeral: true
        });
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

    saveUndo(interaction.user.id, {
        user,
        subs: getSubs(interaction.user.id)
    });

    const updatedUser = { ...user };

    if (interaction.customId === "update_current_rank") {
        updatedUser.currentRank = Number(interaction.values[0]);
        updatedUser.previousRank = user.currentRank;
        updatedUser.previousRR = user.rr;
        updatedUser.lastDiffRR = 0;
    }

    if (interaction.customId === "update_target_rank") {
        updatedUser.targetRank = Number(interaction.values[0]);
    }

    const progress = calculateProgress(
        updatedUser.currentRank,
        updatedUser.rr,
        updatedUser.targetRank
    );

    updatedUser.username = interaction.user.username;
    updatedUser.progress = progress.percent;
    updatedUser.updatedAt = new Date().toLocaleString("ja-JP");

    saveUser(updatedUser);

    return sendUpdatedProfile(interaction, updatedUser);
}

async function handleUpdateModal(interaction) {
    if (interaction.customId !== "update_comment_modal") return;

    const user = getUser(interaction.user.id);

    if (!user) {
        return interaction.reply({
            content: "プロフィールが登録されていません。先に `/register` を実行してください。",
            ephemeral: true
        });
    }

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

module.exports = {
    buildUpdateMenu,
    handleUpdateButton,
    handleUpdateSelectMenu,
    handleUpdateModal
};