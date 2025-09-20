const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const google = require('google-it'); // <-- Usamos la librería real

module.exports = {
    data: new SlashCommandBuilder()
        .setName('img')
        .setDescription('Busca una imagen en internet y la muestra en el chat.')
        .addStringOption(option => 
            option.setName('busqueda')
                .setDescription('¿Qué imagen quieres buscar?')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();

        const query = interaction.options.getString('busqueda');

        try {
            // Hacemos la búsqueda especificando que queremos imágenes
            const results = await google({ 
                query: query,
                is_image: true // <-- Especificamos que es una búsqueda de imágenes
            });

            if (!results || results.length === 0) {
                return interaction.editReply(`No se encontraron imágenes para: **${query}**.`);
            }
            
            // Usamos la primera imagen encontrada
            const firstImage = results[0];

            const embed = new EmbedBuilder()
                .setTitle(`🖼️ Imagen de: "${query}"`)
                .setColor('#0099ff')
                .setImage(firstImage.link) // Usamos la URL de la imagen del resultado
                .setFooter({ text: `Solicitado por ${interaction.user.tag}` })
                .setTimestamp();
            
            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error en el comando /img:', error);
            // El error puede ser por búsquedas "sensibles" o sin resultados.
            await interaction.editReply(`Hubo un error al buscar la imagen. Es posible que la búsqueda no haya arrojado resultados válidos.`);
        }
    },
};