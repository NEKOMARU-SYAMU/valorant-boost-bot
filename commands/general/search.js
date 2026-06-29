const { SlashCommandBuilder } = require("discord.js");

const { getUser, getSubs } = require("../../database/database");
const { buildProfileEmbed } = require("../../embeds/profileEmbed");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("search")
        .setDescription("指定したメンバーのプロフィールを表示します")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("プロフィールを表示するユーザー")
                .setRequired(true)
        ),

    async execute(interaction) {
        const target = interaction.options.getUser("user");

        const user = getUser(target.id);

        if (!user) {
            return interaction.reply({
                content: "このユーザーはまだプロフィールを登録していません。",
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