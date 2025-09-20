const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nitroemoji')
        .setDescription('Añade un emoji de otro servidor pegándolo directamente (requiere Nitro).')
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Pega aquí el emoji personalizado que quieres añadir.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('nombre')
                .setDescription('Opcional: Asigna un nuevo nombre al emoji.')
                .setMinLength(2)
                .setMaxLength(32)
                .setRequired(false)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const emojiString = interaction.options.getString('emoji');
        const customName = interaction.options.getString('nombre');

        const emojiRegex = /<a?:(\w+):(\d+)>/;
        const match = emojiString.match(emojiRegex);

        if (!match) {
            return interaction.editReply({ content: '❌ No has proporcionado un emoji personalizado válido.' });
        }

        const isAnimated = emojiString.startsWith('<a:');
        const originalName = match[1];
        const emojiId = match[2];
        const finalName = customName || originalName;

        const nameRegex = /^[a-zA-Z0-9_]{2,32}$/;
        if (!nameRegex.test(finalName)) {
            return interaction.editReply({ content: '❌ El nombre final del emoji es inválido (solo letras, números y guión bajo).'});
        }

        const extension = isAnimated ? 'gif' : 'png';
        const url = `https://cdn.discordapp.com/emojis/${emojiId}.${extension}`;

        try {
            const newEmoji = await interaction.guild.emojis.create({
                attachment: url,
                name: finalName,
                reason: `Emoji añadido por ${interaction.user.tag}`
            });

            const embed = new EmbedBuilder()
                .setColor('#2ecc71')
                .setTitle('✅ Emoji Añadido Exitosamente')
                .setDescription(`Se ha añadido el emoji ${newEmoji} al servidor con el nombre \`:${newEmoji.name}:\`.`)
                .setThumbnail(newEmoji.url);

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error al crear el emoji con /nitroemoji:', error);
            let errorMessage = 'Hubo un error desconocido al intentar crear el emoji.';
            if (error.code === 50045) {
                errorMessage = '❌ No se pudo crear el emoji porque el servidor ha alcanzado el límite máximo.';
            } else if (error.code === 30008) {
                 errorMessage = '❌ La imagen del emoji es demasiado grande (más de 256KB).';
            }
            await interaction.editReply({ content: errorMessage });
        }
    },
};