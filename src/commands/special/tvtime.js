const { SlashCommandBuilder, ChannelType } = require('discord.js');
const { tvTimeChannelId } = require('../../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tvtime')
        .setDescription('¡Anuncia que es hora de Comandiu TV!'),
    async execute(interaction) {
        // La verificación de roles ya no se hace aquí, se hace en events/interactionCreate.js
        
        try {
            const announcementChannel = await interaction.client.channels.fetch(tvTimeChannelId);
            
            if (announcementChannel && announcementChannel.type === ChannelType.GuildText) {
                await announcementChannel.send('@everyone Its Comandiu TV Time!');
                await interaction.reply({ content: '¡Anuncio enviado correctamente!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'Error: El canal configurado para los anuncios no es un canal de texto válido.', ephemeral: true });
            }
        } catch (error) {
            console.error('Error en el comando /tvtime:', error);
            await interaction.reply({ content: 'Hubo un error al intentar enviar el anuncio. Verifica que la ID del canal sea correcta.', ephemeral: true });
        }
    },
};