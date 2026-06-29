const {
    SlashCommandBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const { RANKS } = require("../../utils/rankManager");
const { getUser } = require("../../database/database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("register")
        .setDescription("プロフィールを登録します"),

    async execute(interaction) {
        const existingUser = getUser(interaction.user.id);

        if (existingUser) {
            return interaction.reply({
                content:
`⚠️ すでにプロフィールが登録されています。

内容を変更したい場合は、今後追加する \`/update\` を使ってください。
RRだけ変更する場合は \`/rr\` を使ってください。`,
                ephemeral: true
            });
        }

        const rankOptions = RANKS.map(rank => ({
            label: rank.name,
            value: String(rank.id),
            emoji: rank.emoji
        }));

        interaction.client.registerCache.set(interaction.user.id, {
            targetRank: null,
            currentRank: null,
            rr: 0,
            comment: "",
            subs: [],
            pendingSubRank: null,
            pendingSubAmount: null
        });

        const targetMenu = new StringSelectMenuBuilder()
            .setCustomId("register_target_rank")
            .setPlaceholder("🎯 目標ランクを選択")
            .addOptions(rankOptions);

        const currentMenu = new StringSelectMenuBuilder()
            .setCustomId("register_current_rank")
            .setPlaceholder("📈 現在ランクを選択")
            .addOptions(rankOptions);

        const nextButton = new ButtonBuilder()
            .setCustomId("register_next")
            .setLabel("次へ")
            .setEmoji("➡️")
            .setStyle(ButtonStyle.Primary);

        await interaction.reply({
            content: "🎮 **プロフィール登録**\n\nまずは目標ランクと現在ランクを選択してください。",
            components: [
                new ActionRowBuilder().addComponents(targetMenu),
                new ActionRowBuilder().addComponents(currentMenu),
                new ActionRowBuilder().addComponents(nextButton)
            ],
            ephemeral: true
        });
    }
};