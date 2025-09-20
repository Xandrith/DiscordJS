const { EmbedBuilder } = require('discord.js'); // Ya no necesitamos Collection
const Cerebras = require('@cerebras/cerebras_cloud_sdk');

const cerebras = new Cerebras({
  apiKey: process.env.CEREBRAS_API_KEY
});

module.exports = {
    handleAiChat: async function(message) {
        // --- LÓGICA DE COOLDOWN ELIMINADA ---

        const thinkingMessage = await message.channel.send('🧠 Pensando...');

        try {
            const response = await cerebras.chat.completions.create({
                model: 'qwen-3-235b-a22b-instruct-2507',
                messages: [{ role: 'user', content: message.content }],
                stream: false,
            });

            const answer = response.choices[0].message.content;
            
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setDescription(answer);

            await message.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Error al llamar a la API de Cerebras:', error);
            await message.reply('❌ Hubo un error al contactar a la IA. Verifica la consola para más detalles.');
        } finally {
            await thinkingMessage.delete().catch(() => {});
        }
    },
};