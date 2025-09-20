const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Lanza una moneda al aire.'),
    async execute(interaction) {
        const result = Math.random() < 0.5 ? 'Cara' : 'Cruz';
        await interaction.reply(`🪙 La moneda ha caído en... **${result}**!`);
    },
};