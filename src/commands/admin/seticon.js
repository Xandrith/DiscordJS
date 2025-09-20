const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../features/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('seticon')
        .setDescription('Asigna un emoji de reacción automática a un usuario.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario al que se le asignará el emoji.')
                .setRequired(true))
        .addStringOption(option => // <-- Cambiado de Attachment a String
            option.setName('emoji')
                .setDescription('El emoji personalizado que se usará como reacción.')
                .setRequired(true)),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario');
        const emojiString = interaction.options.getString('emoji');

        // Extraemos la ID del emoji personalizado
        const customEmoji = emojiString.match(/<a?:\w+:(\d+)>/);
        if (!customEmoji) {
            return interaction.reply({ content: '❌ Debes proporcionar un emoji personalizado de este servidor, no un emoji estándar.', ephemeral: true });
        }
        const emojiId = customEmoji[1];

        try {
            // Verificamos que el bot pueda usar el emoji
            if (!interaction.guild.emojis.cache.get(emojiId)) {
                return interaction.reply({ content: '❌ No puedo usar ese emoji. Asegúrate de que sea un emoji de este servidor.', ephemeral: true });
            }

            db.addReaction(interaction.guildId, targetUser.id, emojiId);

            const embed = new EmbedBuilder()
                .setColor('#2ecc71')
                .setTitle('✅ Emoji de Reacción Asignado')
                .setDescription(`Se ha añadido la reacción ${emojiString} para ${targetUser}.`);

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error en /seticon:', error);
            await interaction.reply({ content: 'Hubo un error al guardar el emoji.', ephemeral: true });
        }
    },
};