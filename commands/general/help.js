const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Botの使い方を表示します"),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle("📘 VALORANT BOOST BOT HELP")
            .setDescription("このBotで使えるコマンド一覧です。")
            .addFields(
                {
                    name: "👤【プロフィール】",
                    value:
`</register:0> プロフィール登録
</profile:0> 自分のプロフィール表示
</update:0> プロフィール編集
</delete:0> プロフィール削除
</search:0> 指定ユーザーを検索`,
                    inline: false
                },
                {
                    name: "📈【RR・履歴】",
                    value:
`</rr:0> RRをフォームで更新
</undo:0> 直前の更新を取り消し
</history:0> RR更新履歴を表示
</weekly:0> 今週のRRランキング`,
                    inline: false
                },
                {
                    name: "📊【一覧・統計】",
                    value:
`</stats:0> サーバー統計
</vc:0> VC内メンバー一覧
</leaderboard:0> ランキング表示`,
                    inline: false
                },
                {
                    name: "👑【管理者】",
                    value:
`</setup:0> 公開一覧チャンネル設定
</publish:0> メンバー一覧公開
</setrankup:0> ランクアップ通知チャンネル設定
</dashboard:0> 管理者ダッシュボード`,
                    inline: false
                },
                {
                    name: "⭐【RR入力例】",
                    value:
`/rr を実行後、フォームに入力します。

例：
\`20\`
\`-15\`
\`＋25\`
\`－30\`

※ \`20\` は自動で \`+20\` として処理されます。`,
                    inline: false
                }
            )
            .setFooter({
                text: "VALORANT BOOST BOT"
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
};