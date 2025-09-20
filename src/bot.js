require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits, ChannelType } = require('discord.js');
const { token, guildId } = require('../config.json');
const db = require('./features/database');
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');

// --- INICIALIZACIÓN DEL CLIENTE DE DISCORD ---
const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildEmojisAndStickers
    ] 
});

// --- CARGADORES DE COMANDOS Y EVENTOS ---
client.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            command.category = folder;
            client.commands.set(command.data.name, command);
        } else {
            console.log(`[ADVERTENCIA] Al comando en ${filePath} le falta una propiedad "data" o "execute".`);
        }
    }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    } else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// --- INICIALIZACIÓN DEL SERVIDOR WEB Y WEBSOCKETS ---
const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
client.wss = wss; // Hacemos accesible el wss desde el cliente de Discord

const PORT = 3000;
app.use(express.json());
app.use(express.static(path.join(__dirname, '../dashboard')));

wss.broadcast = function(data) {
    wss.clients.forEach(client => {
        if (client.readyState === 1) { // WebSocket.OPEN
            client.send(JSON.stringify(data));
        }
    });
};

wss.on('connection', ws => {
    console.log('🚀 Un cliente se ha conectado al panel de control.');
});

// --- API: El puente de comunicación entre la web y el bot ---

app.get('/api/stats', async (req, res) => {
    try {
        const guild = await client.guilds.fetch(guildId);
        await guild.members.fetch(); // Asegurarse de que todos los miembros estén en la caché
        const versionData = JSON.parse(fs.readFileSync(path.join(__dirname, '../version.json'), 'utf8'));
        
        const leaderboardData = db.getLeaderboard(guildId).slice(0, 5);
        const leaderboard = await Promise.all(leaderboardData.map(async (user) => {
            const member = await guild.members.fetch(user.userId).catch(() => ({ displayName: 'Usuario Desconocido' }));
            return { name: member.displayName, level: user.level, xp: user.xp };
        }));

        res.json({
            guildName: guild.name,
            totalMembers: guild.memberCount,
            botVersion: versionData.version,
            textChannels: guild.channels.cache.filter(c => c.type === ChannelType.GuildText).map(c => ({ id: c.id, name: c.name })),
            kickableMembers: guild.members.cache.filter(m => m.kickable && !m.user.bot).map(m => ({ id: m.id, name: m.user.tag })),
            leaderboard,
        });
    } catch (error) {
        console.error('Error en /api/stats:', error);
        res.status(500).json({ error: 'Error al obtener los datos' });
    }
});

app.post('/api/send-message', async (req, res) => {
    try {
        const { channelId, message } = req.body;
        if (!channelId || !message) return res.status(400).json({ error: 'Faltan datos.' });
        
        const channel = await client.channels.fetch(channelId);
        if (channel && channel.isTextBased()) {
            await channel.send(message);
            res.status(200).json({ success: true });
        } else {
            res.status(404).json({ error: 'Canal no encontrado.' });
        }
    } catch (error) {
        console.error('Error en /api/send-message:', error);
        res.status(500).json({ error: 'Error al enviar el mensaje' });
    }
});

app.post('/api/kick-user', async (req, res) => {
    try {
        const { userId, reason } = req.body;
        const guild = await client.guilds.fetch(guildId);
        const member = await guild.members.fetch(userId);

        if (member && member.kickable) {
            await member.kick(reason);
            res.status(200).json({ success: true, message: `Usuario ${member.user.tag} expulsado.` });
        } else {
            res.status(400).json({ error: 'No se puede expulsar a este usuario.' });
        }
    } catch (error) {
        console.error('Error en /api/kick-user:', error);
        res.status(500).json({ error: 'Error al intentar expulsar al usuario.' });
    }
});

// --- INICIO DEL BOT Y DEL SERVIDOR WEB ---
client.login(token).then(() => {
    server.listen(PORT, () => {
        console.log(`🚀 Panel de control disponible en http://localhost:${PORT}`);
    });
});