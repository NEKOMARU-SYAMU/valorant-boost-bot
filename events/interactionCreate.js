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