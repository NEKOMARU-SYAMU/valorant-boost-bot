const { Events } = require("discord.js");

module.exports = {

    name: Events.ClientReady,
    once: true,

    execute(client) {

        console.log("==========================");
        console.log(`ログイン成功`);
        console.log(`Bot : ${client.user.tag}`);
        console.log("==========================");

    }

};