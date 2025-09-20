const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { reportChannelId } = require('../../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Reporta a un usuario con los administradores.')
        .addUserOption(option => option.setName('usuario').setDescription('El usuario a reportar').setRequired(true))
        .addStringOption(option => option.setName('razon').setDescription('La razón del reporte').setRequired(true)),
    async execute(interaction) {
        const reportedUser = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razon');
        const reporter = interaction.user;

        if (reportedUser.id === reporter.id) {
            return interaction.reply({ content: '❌ No puedes reportarte a ti mismo.', ephemeral: true });
        }

        const reportEmbed = new EmbedBuilder()
            .setColor('#e74c3c')
            .setTitle('🚩 Nuevo Reporte de Usuario')
            .setThumbnail(reportedUser.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '👤 Usuario Reportado', value: `${reportedUser.tag} (${reportedUser.id})`, inline: false },
                { name: '👮 Reportado por', value: `${reporter.tag} (${reporter.id})`, inline: false },
                { name: '📄 Razón', value: reason, inline: false }
            )
            .setTimestamp();

        try {
            const channel = await interaction.client.channels.fetch(reportChannelId);
            if (channel) {
                await channel.send({ embeds: [reportEmbed] });
                await interaction.reply({ content: '✔️ Tu reporte ha sido enviado. ¡Gracias!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Error: No se pudo encontrar el canal de reportes.', ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Hubo un error al procesar tu reporte.', ephemeral: true });
        }
    },
};