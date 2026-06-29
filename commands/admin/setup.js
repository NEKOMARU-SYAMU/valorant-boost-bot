const {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChannelType
} = require("discord.js");

const {
    saveSettings,
    getSettings
} = require("../../database/database");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("setup")
        .setDescription("公開一覧チャンネルを設定します")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option
                .setName("channel")
                .setDescription("プロフィール一覧を公開するチャンネル")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        ),

    async execute(interaction) {
        const channel = interaction.options.getChannel("channel");

        const current = getSettings(interaction.guild.id);

        saveSettings(interaction.guild.id, {
            publishChannel: channel.id,
            publishMessage: current?.publishMessage || null
        });

        await interaction.reply({
            content:
`✅ 公開一覧チャンネルを設定しました。

📢【公開先】
<#${channel.id}>

次に管理者が \`/publish\` を実行すると、このチャンネルにメンバー一覧を公開します。`,
            ephemeral: true
        });
    }
};