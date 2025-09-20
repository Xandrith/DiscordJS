const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('infosticker')
        .setDescription('Muestra información de un sticker a partir de su ID.')
        .addStringOption(option =>
            option.setName('id')
                .setDescription('La ID del sticker que quieres buscar.')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        const stickerId = interaction.options.getString('id');

        if (!/^\d+$/.test(stickerId)) {
            return interaction.editReply({ content: '❌ Debes proporcionar una ID numérica válida.', ephemeral: true });
        }

        try {
            const sticker = await interaction.client.stickers.fetch(stickerId);

            if (!sticker) {
                throw new Error('Sticker no encontrado');
            }
            
            const uploader = await sticker.fetchUser().catch(() => null);

            const embed = new EmbedBuilder()
                .setColor('#FEE75C')
                .setTitle(`Información del Sticker: ${sticker.name}`)
                .setDescription(sticker.description || 'Sin descripción.')
                .setImage(sticker.url)
                .addFields(
                    { name: 'Nombre', value: `\`${sticker.name}\``, inline: true },
                    { name: 'ID', value: `\`${sticker.id}\``, inline: true },
                    { name: 'Servidor de Origen', value: `\`${sticker.guild.name}\``, inline: true },
                    { name: 'Tipo', value: sticker.type === 1 ? 'Estándar' : 'De Gremio', inline: true },
                    { name: 'Formato', value: `\`${sticker.format}\``.toUpperCase().replace('_', ' '), inline: true },
                    { name: 'Disponible', value: sticker.available ? 'Sí' : 'No', inline: true },
                    { name: 'Tags (etiquetas)', value: `\`${sticker.tags || 'Ninguna'}\`` },
                    { name: 'Subido por', value: uploader ? uploader.tag : 'No disponible' }
                );

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error en /infosticker:', error);
            // --- MENSAJE DE ERROR SIMPLIFICADO ---
            await interaction.editReply({ 
                content: '❌ No se pudo encontrar un sticker con esa ID.',
                ephemeral: true 
            });
        }
    },
};