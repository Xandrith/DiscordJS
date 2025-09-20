const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { suggestChannelId } = require('../../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('suggest')
        .setDescription('Envía una sugerencia para el servidor.')
        .addStringOption(option => 
            option.setName('idea')
                .setDescription('Describe tu sugerencia')
                .setRequired(true)),
    async execute(interaction) {
        const suggestion = interaction.options.getString('idea');
        const user = interaction.user;

        const suggestEmbed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('💡 Nueva Sugerencia')
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL({ dynamic: true }) })
            .setDescription(suggestion)
            .setTimestamp();

        try {
            const channel = await interaction.client.channels.fetch(suggestChannelId);
            if (channel) {
                const message = await channel.send({ embeds: [suggestEmbed] });
                await message.react('👍');
                await message.react('👎');
                await interaction.reply({ content: '✔️ ¡Tu sugerencia ha sido enviada!', ephemeral: true });
            } else {
                 await interaction.reply({ content: 'Error: No se pudo encontrar el canal de sugerencias.', ephemeral: true });
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Hubo un error al procesar tu sugerencia.', ephemeral: true });
        }
    },
};