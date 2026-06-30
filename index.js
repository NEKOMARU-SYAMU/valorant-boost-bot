const fs = require("fs");
const path = require("path");

const {
    Client,
    Collection,
    GatewayIntentBits
} = require("discord.js");

const config = require("./config.json");

require("./database/database");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates
    ]
});

// コマンド保存用
client.commands = new Collection();
client.registerCache = new Map();

// コマンド読み込み
const commandFolders = path.join(__dirname, "commands");

if (fs.existsSync(commandFolders)) {
    const folders = fs.readdirSync(commandFolders);

    for (const folder of folders) {
        const folderPath = path.join(commandFolders, folder);

        if (!fs.statSync(folderPath).isDirectory()) continue;

        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith(".js"));

        for (const file of commandFiles) {
            const command = require(path.join(folderPath, file));

            if ("data" in command && "execute" in command) {
                client.commands.set(command.data.name, command);
            }
        }
    }
}

// イベント読み込み
const eventsPath = path.join(__dirname, "events");

if (fs.existsSync(eventsPath)) {

    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

    for (const file of eventFiles) {

        const event = require(path.join(eventsPath, file));

        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }

}

const { startAutoUpdate } = require("./utils/autoUpdateManager");
startAutoUpdate(client);

client.login(config.token);