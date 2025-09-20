const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
const { tvTimeChannelId } = require('../../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('anuncio')
        .setDescription('Envía un anuncio a un canal específico mencionando a @everyone.')
        .addStringOption(option => 
            option.setName('titulo')
                .setDescription('El título del anuncio.')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('mensaje')
                .setDescription('El contenido del anuncio. Puedes usar \\n para saltos de línea.')
                .setRequired(true))
        .addAttachmentOption(option => // <-- CAMBIADO DE String A Attachment
            option.setName('imagen')
                .setDescription('Imagen para adjuntar al anuncio (opcional).')
                .setRequired(false))
        .setDMPermission(false),
    async execute(interaction) {
        const title = interaction.options.getString('titulo');
        const message = interaction.options.getString('mensaje').replace(/\\n/g, '\n'); 
        const imageAttachment = interaction.options.getAttachment('imagen'); // <-- Obtenemos el archivo adjunto
        const author = interaction.user;

        const announcementEmbed = new EmbedBuilder()
            .setColor('#ffc107')
            .setTitle(`📢 ${title}`)
            .setDescription(message)
            .setFooter({ text: `Anuncio por ${author.tag}`, iconURL: author.displayAvatarURL({ dynamic: true }) })
            .setTimestamp();
        
        // Verificamos si se adjuntó un archivo y si es una imagen
        if (imageAttachment) {
            // Comprobamos que el archivo sea de tipo imagen
            if (!imageAttachment.contentType.startsWith('image/')) {
                return interaction.reply({ content: '❌ El archivo adjunto debe ser una imagen (ej. PNG, JPG, GIF).', ephemeral: true });
            }
            announcementEmbed.setImage(imageAttachment.url); // Usamos la URL del archivo adjunto
        }

        try {
            const channel = await interaction.client.channels.fetch(tvTimeChannelId);
            
            if (channel && channel.type === ChannelType.GuildText) {
                await channel.send({ 
                    content: '@everyone', 
                    embeds: [announcementEmbed] 
                });
                
                await interaction.reply({ content: '✔️ ¡Anuncio enviado correctamente!', ephemeral: true });
            } else {
                await interaction.reply({ content: `Error: El canal configurado no es un canal de texto válido.`, ephemeral: true });
            }
        } catch (error) {
            console.error('Error en el comando /anuncio:', error);
            await interaction.reply({ content: 'Hubo un error al intentar enviar el anuncio.', ephemeral: true });
        }
    },
};