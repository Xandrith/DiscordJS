const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('Lanza un dado.')
        .addIntegerOption(option => option.setName('caras').setDescription('Número de caras del dado (def: 6)')),
    async execute(interaction) {
        const faces = interaction.options.getInteger('caras') || 6;
        const result = Math.floor(Math.random() * faces) + 1;
        await interaction.reply(`🎲 ¡Has lanzado un dado de ${faces} caras y ha salido un **${result}**!`);
    },
};