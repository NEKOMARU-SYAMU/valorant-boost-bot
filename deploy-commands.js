const fs = require("fs");
const path = require("path");

const {
    REST,
    Routes
} = require("discord.js");

const config = require("./config.json");

const commands = [];

const commandsPath = path.join(__dirname, "commands");
const folders = fs.readdirSync(commandsPath);

for (const folder of folders) {
    const folderPath = path.join(commandsPath, folder);

    if (!fs.statSync(folderPath).isDirectory()) continue;

    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));

    for (const file of commandFiles) {
        const filePath = path.join(folderPath, file);
        const command = require(filePath);

        if ("data" in command && "execute" in command) {
            commands.push(command.data.toJSON());
        }
    }
}

const rest = new REST({ version: "10" }).setToken(config.token);

(async () => {
    try {
        console.log("グローバルコマンド登録中...");

        await rest.put(
            Routes.applicationCommands(config.clientId),
            {
                body: commands
            }
        );

        console.log("グローバルコマンド登録完了！");
        console.log(`登録数：${commands.length}`);
    } catch (error) {
        console.error(error);
    }
})();