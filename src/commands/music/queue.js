const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { queues } = require('../../features/musicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Muestra la lista de canciones en espera.'),
    async execute(interaction) {
        const queue = queues.get(interaction.guildId);
        if (!queue || queue.songs.length === 0) {
            return interaction.reply({ content: 'La cola está vacía.', ephemeral: true });
        }

        const nowPlaying = queue.songs[0];
        const queueList = queue.songs.slice(1, 11).map((song, index) => `${index + 1}. ${song.title}`).join('\n');

        const embed = new EmbedBuilder()
            .setColor('#a145ff')
            .setTitle('🎵 Cola de Reproducción')
            .setDescription(`**Ahora reproduciendo:**\n[${nowPlaying.title}](${nowPlaying.url})\n\n**Siguientes en la cola:**\n${queueList || 'No hay más canciones en la cola.'}`)
            .setFooter({ text: `Total de canciones en la cola: ${queue.songs.length}` });

        await interaction.reply({ embeds: [embed] });
    },
};