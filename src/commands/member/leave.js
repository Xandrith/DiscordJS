const { SlashCommandBuilder } = require('discord.js');
const ttsHandler = require('../../features/ttsHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Desconecta al bot del canal de voz si está inactivo.'),
    async execute(interaction) {
        const success = ttsHandler.leave(interaction.guildId);
        if (success) {
            await interaction.reply({ content: '👋 ¡Desconectado del canal de voz!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'No estoy en ningún canal de voz.', ephemeral: true });
        }
    },
};