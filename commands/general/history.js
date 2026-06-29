const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

const {
    getUser,
    getRRHistory
} = require("../../database/database");

const { getRankText } = require("../../utils/rankManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("history")
        .setDescription("RR更新履歴を表示します")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("履歴を見るユーザー")
                .setRequired(false)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser("user") || interaction.user;

        const user = getUser(target.id);

        if (!user) {
            return interaction.reply({
                content: "このユーザーはプロフィールを登録していません。",
                ephemeral: true
            });
        }

        const histories = getRRHistory(target.id, 20);

        if (!histories.length) {
            return interaction.reply({
                content: "まだRR履歴がありません。`/rr` を使うと履歴が保存されます。",
                ephemeral: true
            });
        }

        const text = histories.map((history, index) => {
            const diffText =
                history.diffRR > 0
                    ? `🟢 +${history.diffRR}RR`
                    : history.diffRR < 0
                    ? `🔴 ${history.diffRR}RR`
                    : "⚪ ±0RR";

            return `**${index + 1}. ${history.createdAt}**

${diffText}

${getRankText(history.oldRank)} ${history.oldRR}RR
⬇
${getRankText(history.newRank)} ${history.newRR}RR`;
        }).join("\n────────────────────\n").slice(0, 4096);

        const embed = new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle("📜 RR更新履歴")
            .setDescription(text)
            .addFields({
                name: "👤【ユーザー】",
                value: `<@${target.id}>`,
                inline: false
            })
            .setFooter({
                text: "最新20件まで表示"
            })
            .setTimestamp();

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
};