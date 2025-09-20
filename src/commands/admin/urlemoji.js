const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('urlemoji')
        .setDescription('Añade un emoji al servidor desde un enlace de imagen (URL).')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('El enlace directo a la imagen del emoji (debe terminar en .png, .jpg, .gif).')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('nombre')
                .setDescription('El nombre para el emoji (2-32 caracteres).')
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(32)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const url = interaction.options.getString('url');
        const name = interaction.options.getString('nombre');

        // --- VALIDACIONES ---
        // 1. Validar el nombre del emoji
        const emojiNameRegex = /^[a-zA-Z0-9_]{2,32}$/;
        if (!emojiNameRegex.test(name)) {
            return interaction.editReply({
                content: '❌ El nombre del emoji es inválido. Solo puede contener letras, números y guión bajo (`_`).',
                ephemeral: true
            });
        }

        // 2. Validar que la URL parezca una imagen
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            return interaction.editReply({ content: '❌ La URL proporcionada no es válida.', ephemeral: true });
        }
        if (!/\.(png|jpg|jpeg|gif)$/i.test(url)) {
            return interaction.editReply({ content: '❌ La URL debe apuntar directamente a una imagen (`.png`, `.jpg`, `.gif`).', ephemeral: true });
        }


        // --- CREACIÓN DEL EMOJI ---
        try {
            const newEmoji = await interaction.guild.emojis.create({
                attachment: url,
                name: name,
                reason: `Emoji añadido por ${interaction.user.tag} desde URL`
            });

            const embed = new EmbedBuilder()
                .setColor('#2ecc71')
                .setTitle('✅ Emoji Creado desde URL')
                .setDescription(`Se ha añadido el emoji ${newEmoji} al servidor con el nombre \`:${newEmoji.name}:\`.`)
                .setThumbnail(newEmoji.url)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error al crear el emoji desde URL:', error);
            let errorMessage = 'Hubo un error desconocido al intentar crear el emoji.';
            if (error.code === 50045) { // Límite de emojis
                errorMessage = '❌ No se pudo crear el emoji porque el servidor ha alcanzado el límite máximo de emojis personalizados.';
            } else if (error.code === 30008 || error.message.includes('Maximum size')) { // Límite de tamaño
                 errorMessage = '❌ La imagen del enlace es demasiado grande (más de 256KB).';
            } else if (error.message.includes('failed to fetch')) {
                 errorMessage = '❌ No se pudo acceder a la imagen desde esa URL. Asegúrate de que el enlace sea directo y público.';
            }
            await interaction.editReply({ content: errorMessage, ephemeral: true });
        }
    },
};