const { SlashCommandBuilder } = require("discord.js");
const { getUser } = require("../../database/database");
const { buildUpdateMenu } = require("../../handlers/updateHandler");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("update")
        .setDescription("プロフィール情報を更新します"),

    async execute(interaction) {
        const user = getUser(interaction.user.id);

        if (!user) {
            return interaction.reply({
                content: "プロフィールが登録されていません。先に `/register` を実行してください。",
                ephemeral: true
            });
        }

        await interaction.reply({
            content: "✏️ **更新する項目を選択してください。**",
            components: buildUpdateMenu(),
            ephemeral: true
        });
    }
};