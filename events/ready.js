const { Events, ActivityType } = require("discord.js");
const { getAllUsers } = require("../database/database");

module.exports = {

    name: Events.ClientReady,
    once: true,

    execute(client) {

        console.log("==========================");
        console.log("ログイン成功");
        console.log(`Bot : ${client.user.tag}`);
        console.log("==========================");

        const updatePresence = () => {

            const memberCount = getAllUsers().length;

            const presences = [
                {
                    name: "/helpで使い方を確認",
                    type: ActivityType.Watching
                },
                {
                    name: `${memberCount}人を管理中`,
                    type: ActivityType.Watching
                }
            ];

            const random = presences[Math.floor(Math.random() * presences.length)];

            client.user.setPresence({
                activities: [random],
                status: "online"
            });

        };

        // 起動時
        updatePresence();

        // 30秒ごとに更新
        setInterval(updatePresence, 30000);

    }

};