const { Events } = require("discord.js");

const {
    handleRegisterSelectMenu,
    handleRegisterButton,
    handleRegisterModal
} = require("../handlers/registerHandler");

const {
    handleUpdateButton,
    handleUpdateSelectMenu,
    handleUpdateModal
} = require("../handlers/updateHandler");

const { handleRRModal } = require("../handlers/rrHandler");
const { handleVCButton } = require("../handlers/vcHandler");
const { handleDeleteModal } = require("../handlers/deleteHandler");
const { handleSetInterval } = require("../handlers/setIntervalHandler");
const { showRegisterModal } = require("../utils/registerModal");

const {
    buildHelpEmbed,
    buildButtons
} = require("../commands/general/help");

module.exports = {
    name: Events.InteractionCreate,

    async execute(interaction, client) {
        try {
            if (interaction.isChatInputCommand()) {
                const command = client.commands.get(interaction.commandName);
                if (!command) return;

                await command.execute(interaction);
                return;
            }

            if (interaction.isStringSelectMenu()) {
                if (interaction.customId === "setinterval_select") {
                    await handleSetInterval(interaction);
                    return;
                }

                if (interaction.customId.startsWith("register_")) {
                    await handleRegisterSelectMenu(interaction, client);
                    return;
                }

                if (interaction.customId.startsWith("update_")) {
                    await handleUpdateSelectMenu(interaction, client);
                    return;
                }

                return;
            }

            if (interaction.isButton()) {
                // 登録パネル
if (interaction.customId === "register_panel") {

    const existingUser = require("../database/database").getUser(interaction.user.id);

    if (existingUser) {
        return interaction.reply({
            content:
`⚠️ すでにプロフィールが登録されています。

内容を変更したい場合は \`/update\` を使ってください。`,
            ephemeral: true
        });
    }

    interaction.client.registerCache.set(interaction.user.id, {
        targetUserId: interaction.user.id,
        targetUsername: interaction.user.username
    });

    await showRegisterModal(interaction);
    return;
}
                if (interaction.customId.startsWith("help_")) {
                    const parts = interaction.customId.split("_");
                    const action = parts[1];
                    const currentPage = Number(parts[2]);

                    let nextPage = currentPage;

                    if (action === "prev") nextPage--;
                    if (action === "next") nextPage++;

                    if (nextPage < 1) nextPage = 1;
                    if (nextPage > 3) nextPage = 3;

                    await interaction.update({
                        embeds: [buildHelpEmbed(nextPage)],
                        components: buildButtons(nextPage)
                    });

                    return;
                }

                if (interaction.customId.startsWith("vc_")) {
                    await handleVCButton(interaction);
                    return;
                }

                if (interaction.customId.startsWith("register_")) {
                    await handleRegisterButton(interaction, client);
                    return;
                }

                if (interaction.customId.startsWith("update_")) {
                    await handleUpdateButton(interaction, client);
                    return;
                }

                return;
            }

            if (interaction.isModalSubmit()) {
                if (interaction.customId === "register_modal") {
                    await handleRegisterModal(interaction, client);
                    return;
                }

                if (interaction.customId === "rr_modal") {
                    await handleRRModal(interaction);
                    return;
                }

                if (interaction.customId === "delete_confirm_modal") {
                    await handleDeleteModal(interaction);
                    return;
                }

                if (interaction.customId.startsWith("update_")) {
                    await handleUpdateModal(interaction, client);
                    return;
                }

                return;
            }

        } catch (error) {
            console.error(error);

            const message = {
                content: "エラーが発生しました。",
                ephemeral: true
            };

            if (interaction.replied || interaction.deferred) {
                await interaction.followUp(message);
            } else {
                await interaction.reply(message);
            }
        }
    }
};