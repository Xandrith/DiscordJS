const { Events, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { botStatusChannelId } = require('../../config.json');
const Logger = require('../features/logger');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        // 1. Inicializamos el logger para que pueda enviar mensajes
        Logger.init(client);

        // 2. Mensajes estándar de inicio en la consola
        console.log(`¡Listo! Conectado como ${client.user.tag}`);
        client.user.setActivity('comandos con /');

        // 3. Lógica de versión y anuncio de inicio
        const versionFilePath = path.join(__dirname, '../../version.json');

        try {
            // Leer el archivo de versión
            const versionData = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
            let [major, minor, patch] = versionData.version.split('.').map(Number);
            
            // Incrementar la versión (patch)
            patch++;
            const newVersion = `${major}.${minor}.${patch}`;
            versionData.version = newVersion;

            // Guardar la nueva versión en el archivo
            fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2));
            console.log(`Bot actualizado a la versión: ${newVersion}`);

            // 4. Enviar el anuncio al canal de estado
            if (botStatusChannelId) {
                const channel = await client.channels.fetch(botStatusChannelId);
                if (channel) {
                    const startupEmbed = new EmbedBuilder()
                        .setColor('#5865F2')
                        .setTitle('✅ Bot Iniciado y Actualizado')
                        .setDescription(`¡Hola! Estoy en línea y listo para funcionar.`)
                        .addFields({ name: 'Versión Actual', value: `**v${newVersion}**`, inline: true })
                        .setTimestamp();
                    
                    await channel.send({ embeds: [startupEmbed] });
                }
            }

        } catch (error) {
            console.error('Error al procesar el archivo de versión o al enviar el mensaje de inicio:', error);
        }
    },
};