const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removeemoji')
        .setDescription('Elimina un emoji personalizado del servidor.')
        .addStringOption(option =>
            option.setName('emoji')
                .setDescription('El emoji personalizado que quieres eliminar.')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const emojiString = interaction.options.getString('emoji');

        // 1. Extraemos la ID del emoji del texto proporcionado
        // Un emoji personalizado tiene el formato <:nombre:id> o <a:nombre:id>
        const emojiId = emojiString.match(/<a?:\w+:(\d+)>/)?.[1];

        if (!emojiId) {
            return interaction.editReply({
                content: '❌ No has proporcionado un emoji personalizado válido. Por favor, selecciona uno de los emojis de este servidor.',
                ephemeral: true
            });
        }

        try {
            // 2. Buscamos el emoji en el servidor usando su ID
            const emojiToDelete = await interaction.guild.emojis.fetch(emojiId);
            const emojiName = emojiToDelete.name;
            const emojiUrl = emojiToDelete.url;

            // 3. Eliminamos el emoji
            await emojiToDelete.delete(`Emoji eliminado por ${interaction.user.tag}`);

            const embed = new EmbedBuilder()
                .setColor('#e74c3c') // Rojo para indicar eliminación
                .setTitle('✅ Emoji Eliminado Exitosamente')
                .setDescription(`Se ha eliminado el emoji \`:${emojiName}:\` del servidor.`)
                .setThumbnail(emojiUrl)
                .setTimestamp();

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error al eliminar el emoji:', error);
            let errorMessage = 'Hubo un error desconocido al intentar eliminar el emoji.';
            if (error.code === 10014 || error.message.includes('Unknown Emoji')) {
                errorMessage = '❌ No se pudo encontrar ese emoji. Es posible que no pertenezca a este servidor o ya haya sido eliminado.';
            } else if (error.code === 50013 || error.message.includes('Missing Permissions')) {
                errorMessage = '❌ No tengo los permisos necesarios para eliminar emojis. Asegúrate de que tenga el permiso "Gestionar Emojis y Stickers".';
            }
            await interaction.editReply({ content: errorMessage, ephemeral: true });
        }
    },
};