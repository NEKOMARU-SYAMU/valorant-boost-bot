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
            .setDescription("メンバーのランク・RR・目標進捗を管理するBotです。")
            .addFields(
                {
                    name: "👤 /register",
                    value:
`**\`/register\`**

プロフィールを登録します。

または管理者が設置した
「👤 プロフィールを登録する」
ボタンからも登録できます。

**\`/register user:@ユーザー\`**
管理者が他人のプロフィールを登録します。`,
                    inline: false
                },
                {
                    name: "✏️ /update",
                    value:
`**\`/update\`**

プロフィールを更新します。

**\`/update user:@ユーザー\`**
管理者が他人のプロフィールを更新します。

変更可能
・Riot ID
・目標ランク
・コメント
・サブ垢`,
                    inline: false
                },
                {
                    name: "📈 /rr",
                    value:
`**\`/rr\`**

自分または指定ユーザーのプロフィールを表示します。

表示内容
・現在ランク
・RR
・目標ランク
・進捗
・最新試合
・サブ垢`,
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
                { name: "⚙️ /setup", value: "公開チャンネルを設定します。", inline: false },
                { name: "👤 /setupregister", value: "登録パネルを設置します。", inline: false },
                { name: "🏆 /publish", value: "メンバー一覧を公開・更新します。", inline: false },
                { name: "🔄 /forceupdate", value: "登録者全員を今すぐ手動更新します。", inline: false },
                { name: "⏰ /autoupdate", value: "次回自動更新までの残り時間と更新間隔を表示します。", inline: false },
                { name: "🔔 /setnotify", value: "通知チャンネルを設定します。", inline: false },
                { name: "📊 /dashboard", value: "管理者用ダッシュボードを表示します。", inline: false },
                { name: "📈 /stats", value: "サーバー全体の統計を表示します。", inline: false },
                { name: "🧪 /apitest", value: "Henrik APIの取得テストを行います。", inline: false }
            )
            .setFooter({ text: "Page 2 / 3" });
    }

    return new EmbedBuilder()
        .setColor(0xE63946)
        .setTitle("🤖 VALORANT MANAGER - 自動更新")
        .addFields(
            { name: "⚔️ 試合終了検知", value: "5分ごとに最新試合を確認し、新しい試合がある場合のみランク・RRを更新します。", inline: false },
            { name: "📢 自動通知", value: "試合結果・ランクアップ・ランクダウン・目標達成を自動通知します。", inline: false },
            { name: "📌 Unrated対応", value: "未認定の場合は仮登録され、認定後に自動で正しいランク・RRへ更新されます。", inline: false },
            { name: "⏰ 更新間隔", value: "現在：5分", inline: false }
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