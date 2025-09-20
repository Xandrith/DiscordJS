const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('infoemoji')
        .setDescription('Muestra información detallada sobre un emoji personalizado.')
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('Pega el emoji personalizado del que quieres obtener información.')
                .setRequired(true)),
    async execute(interaction) {
        const emojiString = interaction.options.getString('emoji');

        // 1. Extraemos los datos del emoji usando una expresión regular
        const emojiRegex = /<a?:(\w+):(\d+)>/;
        const match = emojiString.match(emojiRegex);

        if (!match) {
            return interaction.reply({ content: '❌ No has proporcionado un emoji personalizado válido. Asegúrate de que no sea un emoji estándar (ej. 👍).', ephemeral: true });
        }

        const isAnimated = match[0].startsWith('<a:');
        const name = match[1];
        const id = match[2];

        // 2. Construimos la URL correcta para la imagen
        const extension = isAnimated ? 'gif' : 'png';
        const url = `https://cdn.discordapp.com/emojis/${id}.${extension}?quality=lossless`;

        // 3. Calculamos la fecha de creación a partir de la ID (Snowflake)
        const timestamp = (BigInt(id) >> 22n) + 1420070400000n;
        const creationDate = new Date(Number(timestamp));

        // 4. Creamos el mensaje embed con toda la información
        const embed = new EmbedBuilder()
            .setColor(isAnimated ? '#5865F2' : '#2ecc71')
            .setTitle(`Información del Emoji: :${name}:`)
            .setDescription(`Aquí están los detalles del emoji que has proporcionado.`)
            .setImage(url) // Usamos setImage para mostrar la imagen en grande
            .addFields(
                { name: 'Nombre', value: `\`${name}\``, inline: true },
                { name: 'ID', value: `\`${id}\``, inline: true },
                { name: 'Animado', value: isAnimated ? 'Sí' : 'No', inline: true },
                { name: 'Identificador Completo', value: `\`<${isAnimated ? 'a' : ''}:${name}:${id}>\`` },
                { name: 'Fecha de Creación', value: `<t:${Math.floor(creationDate.getTime() / 1000)}:F>` },
                { name: 'Enlace de Descarga', value: `[Click aquí](${url})` }
            );

        await interaction.reply({ embeds: [embed] });
    },
};