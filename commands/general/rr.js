const { SlashCommandBuilder } = require("discord.js");

const {
    getUser,
    getSubs
} = require("../../database/database");

const { buildProfileEmbed } = require("../../embeds/profileEmbed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rr")
        .setDescription("現在ランク・RRを確認します")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("確認するユーザー")
                .setRequired(false)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser("user") || interaction.user;

        const user = getUser(target.id);

        if (!user) {
            return interaction.reply({
                content: "プロフィールが登録されていません。",
                ephemeral: true
            });
        }

        const subs = getSubs(target.id);
        const embed = buildProfileEmbed(user, subs, target);

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
};