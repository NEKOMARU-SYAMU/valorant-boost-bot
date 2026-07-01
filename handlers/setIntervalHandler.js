const {
    setUpdateInterval
} = require("../database/database");

async function handleSetInterval(interaction) {

    if (interaction.customId !== "setinterval_select") return;

    const minutes = Number(interaction.values[0]);

    setUpdateInterval(interaction.guild.id, minutes);

    await interaction.update({
        content:
`✅ 自動更新間隔を変更しました。

現在の設定：${minutes}分

※次回の自動更新から反映されます。`,
        components: []
    });

}

module.exports = {
    handleSetInterval
};