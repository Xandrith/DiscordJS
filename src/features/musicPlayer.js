const {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnectionStatus,
    entersState,
} = require('@discordjs/voice');
const { musicVoiceChannelId } = require('../../config.json');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const queues = new Map();
const tempDir = path.join(__dirname, '../../temp_audio');

// Asegurarse de que el directorio temporal exista
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

async function playSong(guildId) {
    const queue = queues.get(guildId);
    if (!queue) return;

    if (queue.songs.length === 0) {
        queue.timeout = setTimeout(() => {
            if (queue.connection.state.status !== VoiceConnectionStatus.Destroyed) {
                queue.connection.destroy();
            }
            queues.delete(guildId);
        }, 300000);
        return;
    } else if (queue.timeout) {
        clearTimeout(queue.timeout);
        queue.timeout = null;
    }

    const song = queue.songs[0];
    const tempFilePath = path.join(tempDir, `${Date.now()}-${song.title}`);
    song.localPath = tempFilePath; // Guardamos la ruta para poder borrarlo después

    try {
        // --- LÓGICA DE DESCARGA ---
        const response = await axios({
            method: 'get',
            url: song.url,
            responseType: 'stream',
        });

        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);

        writer.on('finish', () => {
            // Una vez descargado, creamos el recurso desde el archivo local
            const resource = createAudioResource(tempFilePath);
            queue.player.play(resource);
            queue.textChannel.send(`▶️ Ahora reproduciendo: **${song.title}**`);
        });

        writer.on('error', (err) => {
            console.error('Error al escribir el archivo de audio:', err);
            queue.textChannel.send(`❌ Hubo un error al descargar **${song.title}**. Saltando a la siguiente.`);
            queue.songs.shift();
            playSong(guildId);
        });

    } catch (error) {
        console.error(`Error al intentar descargar o reproducir ${song.title}:`, error);
        queue.textChannel.send(`❌ Hubo un error al procesar **${song.title}**. Saltando a la siguiente.`);
        queue.songs.shift();
        playSong(guildId);
    }
}

// La función 'play' que recibe el comando no cambia mucho
module.exports = {
    queues,
    async play(interaction, attachment) {
        if (attachment.contentType !== 'audio/mpeg') {
            return interaction.editReply({ content: '❌ Por favor, sube un archivo con formato MP3.', ephemeral: true });
        }

        const song = {
            title: attachment.name,
            url: attachment.url,
            localPath: null, // Lo definiremos al descargar
        };

        let queue = queues.get(interaction.guildId);

        if (!queue) {
            const connection = joinVoiceChannel({
                channelId: musicVoiceChannelId,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator,
            });
            const player = createAudioPlayer();
            
            queue = { connection, player, textChannel: interaction.channel, songs: [], timeout: null };
            queues.set(interaction.guildId, queue);

            connection.on(VoiceConnectionStatus.Disconnected, async () => { /* ... */ });

            // Cuando una canción termina (IDLE), borramos el archivo local
            player.on(AudioPlayerStatus.Idle, () => {
                const finishedSong = queue.songs.shift();
                if (finishedSong && finishedSong.localPath && fs.existsSync(finishedSong.localPath)) {
                    fs.unlinkSync(finishedSong.localPath); // Borra el archivo
                }
                playSong(interaction.guildId);
            });

            // Si el reproductor se detiene por un error, también intentamos limpiar
            player.on('error', error => {
                console.error('Error en el AudioPlayer:', error);
                const finishedSong = queue.songs.shift();
                 if (finishedSong && finishedSong.localPath && fs.existsSync(finishedSong.localPath)) {
                    fs.unlinkSync(finishedSong.localPath);
                }
                playSong(interaction.guildId);
            });

            connection.subscribe(player);
        }
        
        queue.songs.push(song);
        await interaction.editReply(`✅ Se añadió a la cola: **${song.title}**`);

        if (queue.player.state.status === AudioPlayerStatus.Idle) {
            playSong(interaction.guildId);
        }
    },
};