const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, getVoiceConnection } = require('@discordjs/voice');
const googleTTS = require('google-tts-api');
const { Collection } = require('discord.js');

// Guardará las conexiones activas de TTS para cada servidor
const ttsConnections = new Collection();

module.exports = {
    ttsConnections, // Lo exportamos para que el evento voiceStateUpdate pueda acceder a él

    speak: async function(interaction, text, lang) {
        const voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            return interaction.reply({ content: 'Debes estar en un canal de voz para usar este comando.', ephemeral: true });
        }

        try {
            // Generamos la URL del audio TTS desde Google
            const audioUrl = googleTTS.getAudioUrl(text, {
                lang: lang || 'es-ES', // Español por defecto
                slow: false,
                host: 'https://translate.google.com',
            });

            // Nos unimos al canal de voz
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });

            const player = createAudioPlayer();
            const resource = createAudioResource(audioUrl);

            player.play(resource);
            connection.subscribe(player);

            // Guardamos la información de la conexión
            ttsConnections.set(interaction.guildId, {
                connection,
                player,
                summonerId: interaction.user.id // Guardamos quién llamó al bot
            });
            
            await interaction.reply({ content: `🎤 Diciendo: "${text}"`, ephemeral: true });

            // Cuando el audio termine, preparamos la desconexión
            player.on(AudioPlayerStatus.Idle, () => {
                setTimeout(() => {
                    if (connection.state.status !== 'destroyed') {
                         connection.destroy();
                         ttsConnections.delete(interaction.guildId);
                    }
                }, 5000); // Espera 5 segundos antes de irse
            });

        } catch (error) {
            console.error('Error en la función TTS:', error);
            await interaction.reply({ content: 'Hubo un error al intentar generar la voz.', ephemeral: true });
        }
    },
    
    leave: function(guildId) {
        const connection = getVoiceConnection(guildId);
        if (connection) {
            connection.destroy();
            ttsConnections.delete(guildId);
            return true;
        }
        return false;
    }
};