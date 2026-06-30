const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Botの使い方を表示します"),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0xE63946)
            .setTitle("📘 VALORANT MANAGER 使い方")
            .setDescription("VALORANTランク・RR・サブ垢を管理するBotです。")
            .addFields(
                {
                    name: "👤 登録",
                    value:
"`/register`\n自分のプロフィールを登録します。\n\n`/register user:@ユーザー`\n管理者が他人のプロフィールを登録します。",
                    inline: false
                },
                {
                    name: "✏️ 更新",
                    value:
"`/update`\n自分のプロフィールを更新します。\n\n`/update user:@ユーザー`\n管理者が他人のプロフィールを更新します。",
                    inline: false
                },
                {
                    name: "📈 確認",
                    value:
"`/rr`\n自分の現在ランク・RRを確認します。\n\n`/rr user:@ユーザー`\n指定したユーザーの情報を確認します。",
                    inline: false
                },
                {
                    name: "🏆 一覧",
                    value:
"`/publish`\nメンバー一覧を公開・更新します。管理者専用です。",
                    inline: false
                },
                {
                    name: "🔔 通知設定",
                    value:
"`/setnotify`\n試合結果・ランクアップ・ランクダウン・目標達成の通知チャンネルを設定します。管理者専用です。",
                    inline: false
                },
                {
                    name: "🔄 手動更新",
                    value:
"`/forceupdate`\n登録者全員の試合結果・ランク・RRを今すぐ確認します。管理者専用です。",
                    inline: false
                },
                {
                    name: "🧪 APIテスト",
                    value:
"`/apitest`\nRiot IDからHenrik APIの取得テストを行います。管理者専用です。",
                    inline: false
                },
                {
                    name: "🤖 自動更新",
                    value:
"登録後は1時間ごとに試合終了を検知し、ランク・RR・一覧・通知を自動更新します。",
                    inline: false
                }
            )
            .setFooter({
                text: "VALORANT MANAGER"
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
};