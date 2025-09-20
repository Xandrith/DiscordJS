const { Collection } = require('discord.js');
const db = require('./database');
const { levelUpChannelId, gameChannelId, aiChannelId, countingChannelId } = require('../../config.json');

const cooldowns = new Collection();

const calculateXPForNextLevel = (level) => 5 * (level ** 2) + 50 * level + 100;

async function handleMessageXP(message) {
    // Si el mensaje está en un canal especial (juegos, IA, conteo), no damos XP.
    if (message.author.bot || !message.guild || message.channelId === gameChannelId || message.channelId === aiChannelId || message.channelId === countingChannelId) return;

    const guildId = message.guild.id;
    const userId = message.author.id;

    if (cooldowns.has(`${guildId}-${userId}`)) return;

    let user = db.getUser(guildId, userId);
    if (!user) {
        user = db.createUser(guildId, userId);
    }

    const xpGained = Math.floor(Math.random() * 11) + 15;
    user.xp += xpGained;

    const xpToNextLevel = calculateXPForNextLevel(user.level);

    if (user.xp >= xpToNextLevel) {
        user.level++;
        
        try {
            const channel = await message.client.channels.fetch(levelUpChannelId);
            if (channel) {
                channel.send(`🎉 ¡Felicidades, ${message.author}! Has subido al **nivel ${user.level}**.`);
            }
        } catch (error) {
            console.error('Error al anunciar la subida de nivel:', error);
        }
    }

    db.updateUser(guildId, userId, user);
    cooldowns.set(`${guildId}-${userId}`, Date.now());
    setTimeout(() => cooldowns.delete(`${guildId}-${userId}`), 60000);
}

module.exports = { handleMessageXP, calculateXPForNextLevel };