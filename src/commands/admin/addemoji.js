const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addemoji')
        .setDescription('Sube una imagen como un nuevo emoji personalizado al servidor.')
        .addAttachmentOption(option =>
            option.setName('imagen')
                .setDescription('El archivo de imagen para el emoji (PNG, JPG o GIF, max 256KB).')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('nombre')
                .setDescription('El nombre para el emoji (2-32 caracteres).')
                .setRequired(true)
                .setMinLength(2)
                .setMaxLength(32)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const image = interaction.options.getAttachment('imagen');
        const name = interaction.options.getString('nombre');

        const emojiNameRegex = /^[a-zA-Z0-9_]{2,32}$/;
        if (!emojiNameRegex.test(name)) {
            return interaction.editReply({
                content: '❌ El nombre del emoji es inválido. Solo puede contener letras, números y guión bajo (`_`).'
            });
        }

        if (!image.contentType?.startsWith('image/')) {
            return interaction.editReply({ content: '❌ El archivo adjunto debe ser una imagen.' });
        }

        if (image.size > 256 * 1024) {
            return interaction.editReply({ content: '❌ La imagen es demasiado grande. El tamaño máximo para un emoji es de 256KB.' });
        }

        try {
            const newEmoji = await interaction.guild.emojis.create({
                attachment: image.url,
                name: name,
                reason: `Emoji añadido por ${interaction.user.tag}`
            });

            const embed = new EmbedBuilder()
                .setColor('#2ecc71')
                .setTitle('✅ Emoji Creado Exitosamente')
                .setDescription(`Se ha añadido el emoji ${newEmoji} al servidor con el nombre \`:${newEmoji.name}:\`.`)
                .setThumbnail(newEmoji.url);

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error al crear el emoji con /addemoji:', error);
            let errorMessage = 'Hubo un error desconocido al intentar crear el emoji.';
            if (error.code === 50045) {
                errorMessage = '❌ No se pudo crear el emoji porque el servidor ha alcanzado el límite máximo.';
            }
            await interaction.editReply({ content: errorMessage });
        }
    },
};