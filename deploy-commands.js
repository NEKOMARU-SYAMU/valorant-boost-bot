const { REST, Routes } = require("discord.js");
const fs = require("fs");
const path = require("path");
const config = require("./config.json");

const commands = [];

const commandFolders = path.join(__dirname, "commands");
const folders = fs.readdirSync(commandFolders);

for (const folder of folders) {

    const folderPath = path.join(commandFolders, folder);

    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {

        const command = require(path.join(folderPath, file));

        commands.push(command.data.toJSON());

    }

}

const rest = new REST({ version: "10" }).setToken(config.token);

(async () => {

    try {

        console.log("コマンド登録中...");

        await rest.put(
            Routes.applicationGuildCommands(
                config.clientId,
                config.guildId
            ),
            {
                body: commands
            }
        );

        console.log("コマンド登録完了！");

    } catch (error) {

        console.error(error);

    }

})();