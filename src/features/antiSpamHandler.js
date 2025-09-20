const { Collection, EmbedBuilder } = require('discord.js');
const { spamMonitoredRoleId } = require('../../config.json');

const userSpamData = new Collection();
const SPAM_THRESHOLD = 5;
const SPAM_TIMEFRAME = 3000;
const REPEAT_THRESHOLD = 3;
const REPEAT_TIMEFRAME = 10000;

module.exports = {
    handleSpam: async function(message) {
        if (!message.member.roles.cache.has(spamMonitoredRoleId)) {
            return;
        }

        const userId = message.author.id;
        const currentTime = Date.now();

        if (!userSpamData.has(userId)) {
            userSpamData.set(userId, {
                messageTimestamps: [],
                lastMessages: [],
                isPunished: false,
                offenseCount: 0
            });
        }

        const userData = userSpamData.get(userId);
        if (userData.isPunished) return;

        // Lógica de detección (sin cambios)
        userData.messageTimestamps.push(currentTime);
        userData.messageTimestamps = userData.messageTimestamps.filter(t => currentTime - t < SPAM_TIMEFRAME);
        const isFastSpam = userData.messageTimestamps.length > SPAM_THRESHOLD;
        userData.lastMessages.push({ content: message.content, timestamp: currentTime });
        userData.lastMessages = userData.lastMessages.filter(msg => currentTime - msg.timestamp < REPEAT_TIMEFRAME);
        let isRepeatSpam = false;
        if (userData.lastMessages.length >= REPEAT_THRESHOLD) {
            const recent = userData.lastMessages.slice(-REPEAT_THRESHOLD);
            if (recent[0].content && recent.every(msg => msg.content === recent[0].content)) {
                isRepeatSpam = true;
            }
        }

        if (isFastSpam || isRepeatSpam) {
            userData.isPunished = true;
            userData.offenseCount++;

            // --- NUEVA LÓGICA PARA BORRAR MENSAJES ---
            try {
                const fetchedMessages = await message.channel.messages.fetch({ limit: 15 });
                const messagesToDelete = fetchedMessages.filter(m => m.author.id === userId);
                await message.channel.bulkDelete(messagesToDelete, true); // El 'true' ignora mensajes de más de 14 días
            } catch (error) {
                console.error('No se pudieron borrar los mensajes de spam (probablemente faltan permisos):', error.message);
            }
            // --- FIN DE LA LÓGICA DE BORRADO ---

            let timeoutDuration = 0;
            let punishmentDescription = '';
            let finalAction = 'timeout';

            switch (userData.offenseCount) {
                case 1:
                    timeoutDuration = 10 * 1000;
                    punishmentDescription = `Has sido aislado por **10 segundos**.`;
                    break;
                case 2:
                    timeoutDuration = 30 * 1000;
                    punishmentDescription = `Has sido aislado por **30 segundos**.`;
                    break;
                case 3:
                    timeoutDuration = 60 * 1000;
                    punishmentDescription = `Has sido aislado por **1 minuto**. ¡Cuidado!`;
                    break;
                default:
                    finalAction = 'kick';
                    punishmentDescription = `Has sido **expulsado** del servidor por spam repetido.`;
                    break;
            }

            const reason = isRepeatSpam ? "por enviar el mismo mensaje repetidamente" : "por enviar mensajes demasiado rápido";

            try {
                if (finalAction === 'kick') {
                    await message.member.kick(`Expulsado por spam repetido (Ofensa #${userData.offenseCount}).`);
                } else {
                    await message.member.timeout(timeoutDuration, `Detección de spam (Ofensa #${userData.offenseCount}).`);
                }
            } catch (error) {
                console.error(`No se pudo aplicar la sanción a ${message.author.tag}:`, error.message);
                userData.isPunished = false;
                userData.offenseCount--;
                return;
            }

            const warningEmbed = new EmbedBuilder()
                .setColor('#e74c3c')
                .setTitle(' Detección de Spam')
                .setDescription(`${message.author}, tu comportamiento ha sido detectado como spam.`)
                .addFields(
                    { name: 'Razón', value: `Detectado ${reason}.`},
                    { name: 'Sanción Aplicada', value: punishmentDescription }
                )
                .setFooter({ text: 'Tus mensajes de spam han sido eliminados.'})
                .setTimestamp();
            
            await message.channel.send({ embeds: [warningEmbed] });
            
            if (finalAction === 'kick') {
                userSpamData.delete(userId);
            } else {
                setTimeout(() => {
                    const currentUserData = userSpamData.get(userId);
                    if (currentUserData) {
                        currentUserData.isPunished = false;
                        currentUserData.messageTimestamps = [];
                        currentUserData.lastMessages = [];
                    }
                }, timeoutDuration);
        }
 }
}
};