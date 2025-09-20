const { SlashCommandBuilder } = require('discord.js');
const { queues } = require('../../features/musicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pause')
        .setDescription('Pausa la canción actual.'),
    async execute(interaction) {
        const queue = queues.get(interaction.guildId);
        if (!queue) {
            return interaction.reply({ content: 'No hay nada reproduciéndose.', ephemeral: true });
        }

        const success = queue.player.pause();
        if (success) {
            await interaction.reply('⏸️ La canción ha sido pausada.');
        } else {
            await interaction.reply({ content: 'La canción ya está pausada o no se pudo pausar.', ephemeral: true });
        }
    },
};