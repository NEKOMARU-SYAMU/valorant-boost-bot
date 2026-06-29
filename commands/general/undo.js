const { SlashCommandBuilder } = require("discord.js");

const {
    getUndo,
    saveUser,
    clearSubs,
    addSub,
    clearUndo,
    getSubs
} = require("../../database/database");

const { buildProfileEmbed } = require("../../embeds/profileEmbed");
const { updatePublish } = require("../../utils/publishManager");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("undo")
        .setDescription("直前の変更を1回だけ取り消します"),

    async execute(interaction) {
        const undo = getUndo(interaction.user.id);

        if (!undo) {
            return interaction.reply({
                content: "取り消せる操作がありません。",
                ephemeral: true
            });
        }

        saveUser(undo.user);

        clearSubs(interaction.user.id);

        for (const sub of undo.subs || []) {
            addSub(interaction.user.id, sub.rankId, sub.amount);
        }

        clearUndo(interaction.user.id);

        await updatePublish(interaction.guild);

        const subs = getSubs(interaction.user.id);
        const embed = buildProfileEmbed(undo.user, subs, interaction.user);

        await interaction.reply({
            content: "↩️ **直前の変更を取り消しました。**",
            embeds: [embed],
            ephemeral: true
        });
    }
};