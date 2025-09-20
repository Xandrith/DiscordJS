const { Events, EmbedBuilder } = require('discord.js');
const { handleMessageXP } = require('../features/xpHandler');
const ticTacToeHandler = require('../features/ticTacToeHandler');
const db = require('../features/database');
const antiSpamHandler = require('../features/antiSpamHandler');
const countingHandler = require('../features/countingHandler');
const { gameChannelId, aiChannelId, countingChannelId } = require('../../config.json');

async function handleMentionReactions(message) {
    if (message.mentions.users.size === 0) return;
    const mentionedUserIds = new Set(message.mentions.users.map(user => user.id));
    for (const userId of mentionedUserIds) {
        const reactions = db.getReactions(message.guild.id, userId);
        if (reactions.length > 0) {
            for (const reaction of reactions) {
                try {
                    await message.react(reaction.reactionContent);
                } catch (error) {
                    if (error.code === 10014) {
                        console.log(`Limpieza automática: Emoji ID ${reaction.reactionContent} no existe. Eliminado de DB.`);
                        db.removeReaction(reaction.id);
                    } else {
                        console.error(`No se pudo reaccionar con el emoji ID ${reaction.reactionContent}:`, error);
                    }
                }
            }
        }
    }
}

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (!message.guild || message.author.bot) return;

        // Notificación en tiempo real para el panel web
        if (message.client.wss) {
            message.client.wss.broadcast({ type: 'newMessage' });
        }

        await handleMentionReactions(message);
        await antiSpamHandler.handleSpam(message);

        if (message.channelId === gameChannelId) {
            const content = message.content.toLowerCase();
            if (content === 'c! puestos') {
                const leaderboard = db.getWinsLeaderboard(message.guild.id);
                const embed = new EmbedBuilder().setTitle('🏆 Tabla de Victorias - Gato 🏆').setColor('#FFD700');
                if (leaderboard.length === 0) {
                    embed.setDescription('Aún nadie ha logrado vencer al bot.');
                } else {
                    const topPlayers = await Promise.all(leaderboard.map(async (user, index) => {
                        try {
                            const member = await message.guild.members.fetch(user.userId);
                            const medals = ['🥇', '🥈', '🥉'];
                            const medal = medals[index] || `**#${index + 1}**`;
                            return `${medal} ${member.displayName} - **${user.game_wins}** Victorias`;
                        } catch { return `**#${index + 1}** Usuario Desconocido - **${user.game_wins}** Victorias`; }
                    }));
                    embed.setDescription(topPlayers.join('\n'));
                }
                await message.channel.send({ embeds: [embed] });

            } else if (content.startsWith('c! ')) {
                ticTacToeHandler.handlePlayerMove(message);
            }
        } 
        else if (message.channelId === aiChannelId) {
            // IA funciona con /gpt
        }
        else if (message.channelId === countingChannelId) {
            await countingHandler.handleCounting(message);
        }
        else {
            await handleMessageXP(message);
        }
    },
};