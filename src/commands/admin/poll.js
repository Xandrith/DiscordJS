const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Crea una encuesta rápida con reacciones Sí/No.')
        .addStringOption(option => option.setName('pregunta').setDescription('La pregunta de la encuesta').setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        const question = interaction.options.getString('pregunta');
        const embed = new EmbedBuilder()
            .setColor('#f1c40f')
            .setTitle('📊 ENCUESTA')
            .setDescription(question)
            .setTimestamp();

        const pollMessage = await interaction.reply({ embeds: [embed], fetchReply: true });
        await pollMessage.react('👍');
        await pollMessage.react('👎');
    },
};