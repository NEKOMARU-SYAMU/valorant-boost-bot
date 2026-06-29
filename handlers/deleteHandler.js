const {
    getUser,
    deleteUser
} = require("../database/database");

const { updatePublish } = require("../utils/publishManager");

async function handleDeleteModal(interaction) {
    const text = interaction.fields.getTextInputValue("confirm_text");

    if (text !== "DELETE") {
        return interaction.reply({
            content: "⚠️ 入力が一致しなかったため、削除をキャンセルしました。",
            ephemeral: true
        });
    }

    const user = getUser(interaction.user.id);

    if (!user) {
        return interaction.reply({
            content: "削除できるプロフィールがありません。",
            ephemeral: true
        });
    }

    deleteUser(interaction.user.id);

    await updatePublish(interaction.guild);

    return interaction.reply({
        content: "🗑️ プロフィールを削除しました。",
        ephemeral: true
    });
}

module.exports = {
    handleDeleteModal
};