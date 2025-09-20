const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Muestra una lista de comandos disponibles.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('📜 Lista de Comandos del Bot')
            .setDescription('Aquí tienes todos los comandos que puedes usar:')
            .addFields(
                { name: '🛠️ Comandos de Administración', value: '`/ban`, `/kick`, `/prune`, `/timeout`, `/lockdown`, `/unlock`, `/createrole`, `/giverole`, `/say`, `/poll`, `/anuncio`, `/cleanroles`' },
                { name: '👤 Comandos para Miembros', value: '`/ping`, `/serverinfo`, `/userinfo`, `/avatar`, `/help`, `/roll`, `/coinflip`, `/uptime`, `/suggest`, `/report`, `/rank`, `/color`' },
                { name: '⭐ Comandos Especiales', value: '`/tvtime` (solo roles permitidos)' }
            );
        await interaction.reply({ embeds: [embed] });
    },
};