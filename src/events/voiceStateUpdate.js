const { Events, VoiceConnectionStatus } = require('discord.js');
const { ttsConnections } = require('../features/ttsHandler');

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        // Buscamos si hay una conexión de TTS activa en este servidor
        const ttsInfo = ttsConnections.get(newState.guild.id);
        if (!ttsInfo) return;

        // Comprobamos si la persona que actualizó su estado es la que llamó al bot
        if (newState.member.id === ttsInfo.summonerId) {
            // Si el usuario se desconectó del canal de voz (channelId es null)
            if (!newState.channelId) {
                console.log(`El usuario ${newState.member.user.tag} se desconectó, el bot de TTS se irá.`);
                if (ttsInfo.connection.state.status !== VoiceConnectionStatus.Destroyed) {
                    ttsInfo.connection.destroy();
                }
                ttsConnections.delete(newState.guild.id);
            }
        }
    },
};