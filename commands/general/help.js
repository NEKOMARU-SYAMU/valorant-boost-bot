const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

function buildHelpEmbed(page) {
    if (page === 1) {
        return new EmbedBuilder()
            .setColor(0xE63946)
            .setTitle("📘 VALORANT MANAGER - 基本コマンド")
            .setDescription("メンバーのランク・RR・サブ垢・目標進捗を管理するBotです。")
            .addFields(
                {
                    name: "👤 /register",
                    value:
"`/register`\n自分のプロフィールを登録します。\n\n`/register user:@ユーザー`\n管理者が他人のプロフィールを登録します。\n\n入力：Riot ID / Tag / 目標ランク / サブ垢",
                    inline: false
                },
                {
                    name: "✏️ /update",
                    value:
"`/update`\n自分のプロフィールを更新します。\n\n`/update user:@ユーザー`\n管理者が他人のプロフィールを更新します。\n\n変更：Riotアカウント / 目標ランク / コメント / サブ垢",
                    inline: false
                },
                {
                    name: "📈 /rr",
                    value:
"`/rr`\n自分のプロフィールを確認します。\n\n`/rr user:@ユーザー`\n指定ユーザーのプロフィールを確認します。",
                    inline: false
                }
            )
            .setFooter({ text: "Page 1 / 3" });
    }

    if (page === 2) {
        return new EmbedBuilder()
            .setColor(0xE63946)
            .setTitle("👑 VALORANT MANAGER - 管理者コマンド")
            .addFields(
                {
                    name: "🏆 /publish",
                    value:
"メンバー一覧を公開・更新します。\n\n表示：順位 / Riot ID / 現在ランク / RR / 目標ランク / 進捗 / 最新試合 / サブ垢",
                    inline: false
                },
                {
                    name: "🔄 /forceupdate",
                    value:
"登録者全員を今すぐ手動更新します。\n試合終了を確認し、ランク・RR・一覧・通知を更新します。",
                    inline: false
                },
                {
                    name: "⏰ /autoupdate",
                    value:
"次回自動更新までの残り時間を表示します。\n\n例：2分34秒",
                    inline: false
                },
                {
                    name: "🔔 /setnotify",
                    value:
"通知チャンネルを種類ごとに設定します。\n\n設定可能：試合結果 / ランクアップ / ランクダウン / 目標達成",
                    inline: false
                },
                {
                    name: "🧪 /apitest",
                    value:
"Henrik APIの取得テストを行います。\nRiot IDからランク・RR・最新試合を確認できます。",
                    inline: false
                }
            )
            .setFooter({ text: "Page 2 / 3" });
    }

    return new EmbedBuilder()
        .setColor(0xE63946)
        .setTitle("🤖 VALORANT MANAGER - 自動更新")
        .addFields(
            {
                name: "⚔️ 試合終了検知",
                value:
"登録後は5分ごとに最新試合を確認します。\n新しい試合を検知した場合のみ、ランク・RRを更新します。",
                inline: false
            },
            {
                name: "📢 自動通知",
                value:
"試合結果、ランクアップ、ランクダウン、目標達成をそれぞれ設定したチャンネルに通知します。",
                inline: false
            },
            {
                name: "📌 Unrated対応",
                value:
"コンペ未認定の場合は、仮にアイアン1・0RRとして登録されます。\n認定後は自動で実際のランク・RRに更新されます。",
                inline: false
            }
        )
        .setFooter({ text: "Page 3 / 3" });
}

function buildButtons(page) {
    return [
        new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`help_prev_${page}`)
                .setLabel("前へ")
                .setEmoji("◀️")
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(page === 1),
            new ButtonBuilder()
                .setCustomId(`help_next_${page}`)
                .setLabel("次へ")
                .setEmoji("▶️")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(page === 3)
        )
    ];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Botの使い方を表示します"),

    async execute(interaction) {
        await interaction.reply({
            embeds: [buildHelpEmbed(1)],
            components: buildButtons(1),
            ephemeral: true
        });
    },

    buildHelpEmbed,
    buildButtons
};