const { SlashCommandBuilder } = require("discord.js");
const { getUser, getSubs } = require("../../database/database");
const { buildProfileEmbed } = require("../../embeds/profileEmbed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("自分のプロフィールを表示します"),

    async execute(interaction) {
        const user = getUser(interaction.user.id);

        if (!user) {
            return interaction.reply({
                content: "プロフィールが登録されていません。先に `/register` を実行してください。",
                ephemeral: true
            });
        }

        const subs = getSubs(interaction.user.id);
        const embed = buildProfileEmbed(user, subs, interaction.user);

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
};