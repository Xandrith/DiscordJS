const { SlashCommandBuilder } = require('discord.js'); // Ya no necesitamos EmbedBuilder
const Cerebras = require('@cerebras/cerebras_cloud_sdk');

const cerebras = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY
});

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gpt')
        .setDescription('Habla con una IA.')
        .addStringOption(option =>
            option.setName('pregunta')
                .setDescription('Lo que quieres preguntar o decir a la IA.')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();

        const question = interaction.options.getString('pregunta');

        try {
            // Llamar a la API de la IA (sin cambios)
            const response = await cerebras.chat.completions.create({
                model: 'qwen-3-235b-a22b-instruct-2507',
                messages: [{ role: 'user', content: question }],
                stream: false,
            });

            const answer = response.choices[0].message.content;

            // --- LÓGICA DE RESPUESTA MODIFICADA ---
            // Construimos un mensaje de texto normal usando el formato de cita de Discord
            const header = `> **${interaction.user.toString()} preguntó:**\n> ${question}\n\n**MandiuBot Responde:**\n`;
            const maxAnswerLength = 2000 - header.length - 10; // Dejamos un pequeño margen
            
            // Nos aseguramos de que la respuesta no exceda el límite de caracteres de Discord
            const finalAnswer = answer.length > maxAnswerLength ? answer.substring(0, maxAnswerLength) + '...' : answer;

            const replyContent = header + finalAnswer;

            // Enviamos la respuesta como texto plano en la propiedad 'content'
            await interaction.editReply({ content: replyContent });

        } catch (error) {
            console.error('Error al llamar a la API de Cerebras:', error);
            await interaction.editReply({ content: '❌ Hubo un error al contactar a la IA. Verifica la consola para más detalles.' });
        }
    },
};