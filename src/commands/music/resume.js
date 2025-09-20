const { SlashCommandBuilder } = require('discord.js');
const { queues } = require('../../features/musicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('resume')
        .setDescription('Reanuda la canción actual.'),
    async execute(interaction) {
        const queue = queues.get(interaction.guildId);
        if (!queue) {
            return interaction.reply({ content: 'No hay nada en pausa.', ephemeral: true });
        }

        const success = queue.player.unpause();
        if (success) {
            await interaction.reply('▶️ La canción se ha reanudado.');
        } else {
            await interaction.reply({ content: 'La canción no está pausada o no se pudo reanudar.', ephemeral: true });
        }
    },
};