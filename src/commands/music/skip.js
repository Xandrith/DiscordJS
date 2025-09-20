const { SlashCommandBuilder } = require('discord.js');
const { queues } = require('../../features/musicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Salta a la siguiente canción en la cola.'),
    async execute(interaction) {
        const queue = queues.get(interaction.guildId);
        if (!queue || queue.songs.length === 0) {
            return interaction.reply({ content: 'No hay canciones en la cola para saltar.', ephemeral: true });
        }
        
        // Al detener el reproductor, el evento 'idle' se dispara y reproduce la siguiente canción
        queue.player.stop();
        await interaction.reply('⏭️ Canción saltada.');
    },
};