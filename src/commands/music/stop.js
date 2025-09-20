const { SlashCommandBuilder } = require('discord.js');
const { queues } = require('../../features/musicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Detiene la reproducción y limpia la cola.'),
    async execute(interaction) {
        const queue = queues.get(interaction.guildId);
        if (!queue) {
            return interaction.reply({ content: 'No hay nada reproduciéndose.', ephemeral: true });
        }

        queue.songs = [];
        queue.connection.destroy();
        queues.delete(interaction.guildId);
        await interaction.reply('⏹️ La reproducción ha sido detenida y la cola limpiada.');
    },
};