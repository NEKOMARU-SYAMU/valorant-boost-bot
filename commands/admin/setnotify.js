const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType
} = require("discord.js");

const {
    getSettings,
    saveSettings
} = require("../../database/database");

const notifyTypes = [
    {
        name: "試合結果",
        value: "matchResultChannel"
    },
    {
        name: "ランクアップ",
        value: "rankUpChannel"
    },
    {
        name: "ランクダウン",
        value: "rankDownChannel"
    },
    {
        name: "目標達成",
        value: "targetAchievedChannel"
    }
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setnotify")
        .setDescription("通知チャンネルを種類ごとに設定します")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option =>
            option
                .setName("type")
                .setDescription("通知の種類")
                .setRequired(true)
                .addChoices(...notifyTypes)
        )
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("通知を送るチャンネル")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        ),

    async execute(interaction) {
        const type = interaction.options.getString("type");
        const channel = interaction.options.getChannel("channel");

        const current = getSettings(interaction.guild.id);

        saveSettings(interaction.guild.id, {
            publishChannel: current?.publishChannel || null,
            publishMessage: current?.publishMessage || null,
            rankUpChannel: current?.rankUpChannel || null,
            matchResultChannel: current?.matchResultChannel || null,
            rankDownChannel: current?.rankDownChannel || null,
            targetAchievedChannel: current?.targetAchievedChannel || null,
            [type]: channel.id
        });

        const label = notifyTypes.find(item => item.value === type)?.name || type;

        await interaction.reply({
            content: `✅ **${label}** の通知チャンネルを設定しました。\n<#${channel.id}>`,
            ephemeral: true
        });
    }
};