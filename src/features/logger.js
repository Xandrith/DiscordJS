const { EmbedBuilder } = require('discord.js');
const { logChannelId } = require('../../config.json');

let clientInstance;

const COLORS = {
    log: '#2f3136',   // Gris oscuro
    warn: '#faa61a',  // Amarillo
    error: '#f04747', // Rojo
    command: '#5865F2', // Azul Discord
    event: '#2ecc71'    // Verde
};

function sendLog(embed) {
    if (!clientInstance || !logChannelId) return;
    try {
        const channel = clientInstance.channels.cache.get(logChannelId);
        if (channel) {
            channel.send({ embeds: [embed] });
        }
    } catch (error) {
        // Usamos el console original para evitar un bucle infinito si el log falla
        console.originalError('Error al enviar log a Discord:', error);
    }
}

module.exports = {
    init: (client) => {
        clientInstance = client;
        console.log('Módulo de logging inicializado.');
    },

    logConsole: (level, ...args) => {
        const message = args.map(arg => typeof arg === 'string' ? arg : JSON.stringify(arg)).join(' ');
        const embed = new EmbedBuilder()
            .setColor(COLORS[level] || COLORS.log)
            .setTitle(`Log de Consola [${level.toUpperCase()}]`)
            .setDescription(`\`\`\`${message.substring(0, 4000)}\`\`\``)
            .setTimestamp();
        sendLog(embed);
    },

    logCommand: (interaction) => {
        const commandName = interaction.commandName;
        const user = interaction.user;
        const channel = interaction.channel;
        const options = interaction.options.data.map(opt => `${opt.name}: \`${opt.value}\``).join('\n') || 'Ninguna';

        const embed = new EmbedBuilder()
            .setColor(COLORS.command)
            .setTitle('Comando Usado')
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .addFields(
                { name: 'Comando', value: `\`/${commandName}\``, inline: true },
                { name: 'Usuario', value: `${user}`, inline: true },
                { name: 'En Canal', value: `${channel}`, inline: true },
                { name: 'Opciones', value: options }
            )
            .setTimestamp();
        sendLog(embed);
    },

    logEvent: (title, description) => {
        const embed = new EmbedBuilder()
            .setColor(COLORS.event)
            .setTitle(title)
            .setDescription(description)
            .setTimestamp();
        sendLog(embed);
    }
};