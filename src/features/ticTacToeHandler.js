const { Collection, EmbedBuilder } = require('discord.js');
const db = require('./database');

const activeGames = new Map();
const EMOJIS = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

function getBoardContent(board, currentPlayerTag) {
    let boardString = '';
    for (let i = 0; i < 9; i++) {
        boardString += board[i];
        if ((i + 1) % 3 === 0) {
            boardString += '\n';
        } else {
            boardString += ' | ';
        }
    }
    return `**Es el turno de: ${currentPlayerTag}**\n\n${boardString}\n\nUsa \`c! <número>\` para hacer tu jugada.`;
}

function checkWin(board, symbol) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Filas
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columnas
        [0, 4, 8], [2, 4, 6]             // Diagonales
    ];
    return winPatterns.some(pattern => pattern.every(index => board[index] === symbol));
}

function endGame(channelId, reason) {
    const game = activeGames.get(channelId);
    if (!game) return;

    clearTimeout(game.timer);
    activeGames.delete(channelId);
    
    const embed = new EmbedBuilder()
        .setTitle(' partida de Gato Terminada')
        .setDescription(reason)
        .setColor('#ffc107')
        .setTimestamp();
    
    game.channel.send({ embeds: [embed] });
}

module.exports = {
    activeGames,
    startGame: async function(interaction) {
        const channelId = interaction.channelId;
        if (activeGames.has(channelId)) {
            return interaction.editReply({ content: 'Ya hay una partida de Gato en curso en este canal.', ephemeral: true });
        }

        const playerSymbol = Math.random() < 0.5 ? '❌' : '⭕';
        const botSymbol = playerSymbol === '❌' ? '⭕' : '❌';
        const startsFirst = Math.random() < 0.5 ? interaction.user : interaction.client.user;

        const game = {
            player: interaction.user,
            bot: interaction.client.user,
            playerSymbol,
            botSymbol,
            currentPlayer: startsFirst,
            board: [...EMOJIS],
            channel: interaction.channel,
            boardMessage: null,
            timer: null,
            locked: false, // Estado de bloqueo para evitar jugadas simultáneas
        };
        activeGames.set(channelId, game);

        const content = getBoardContent(game.board, game.currentPlayer.tag);
        // Editamos la respuesta que fue aplazada en el comando /gato
        game.boardMessage = await interaction.editReply(content);

        if (game.currentPlayer.id === game.bot.id) {
            this.handleBotMove(channelId);
        } else {
            this.startTurnTimer(channelId);
        }
    },

    handlePlayerMove: async function(message) {
        const channelId = message.channelId;
        const game = activeGames.get(channelId);
        if (!game || message.author.id !== game.player.id || game.currentPlayer.id !== game.player.id || game.locked) return;
        
        game.locked = true; // Bloqueamos la partida para procesar la jugada

        const move = parseInt(message.content.split(' ')[1]);
        if (isNaN(move) || move < 1 || move > 9 || !EMOJIS.includes(game.board[move - 1])) {
            game.locked = false; // Desbloqueamos si la jugada es inválida
            return message.reply({ content: 'Jugada inválida. Usa `c! <número>` en una casilla vacía.' }).then(msg => setTimeout(() => msg.delete(), 5000));
        }
        
        await message.delete().catch(() => {});
        clearTimeout(game.timer);
        game.board[move - 1] = game.playerSymbol;
        
        if (checkWin(game.board, game.playerSymbol)) {
            if (game.boardMessage) await game.boardMessage.delete().catch(() => {});
            db.incrementUserWins(game.channel.guild.id, game.player.id);
            return endGame(channelId, `¡Felicidades, ${game.player.tag}, has ganado!`);
        } else if (game.board.every(cell => !EMOJIS.includes(cell))) {
            if (game.boardMessage) await game.boardMessage.delete().catch(() => {});
            return endGame(channelId, '¡Es un empate!');
        }
        
        game.currentPlayer = game.bot;
        const content = getBoardContent(game.board, game.currentPlayer.tag);
        if (game.boardMessage) await game.boardMessage.delete().catch(() => {});
        game.boardMessage = await game.channel.send(content);
        
        this.handleBotMove(channelId);
    },

    handleBotMove: function(channelId) {
        const game = activeGames.get(channelId);
        if (!game) return;

        const availableMoves = game.board.map((cell, index) => EMOJIS.includes(cell) ? index : null).filter(i => i !== null);
        const botMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
        game.board[botMove] = game.botSymbol;

        setTimeout(async () => {
            if (!activeGames.has(channelId)) return;
            
            if (checkWin(game.board, game.botSymbol)) {
                if (game.boardMessage) await game.boardMessage.delete().catch(() => {});
                return endGame(channelId, `¡El bot ha ganado! Mejor suerte la próxima vez.`);
            } else if (game.board.every(cell => !EMOJIS.includes(cell))) {
                if (game.boardMessage) await game.boardMessage.delete().catch(() => {});
                return endGame(channelId, '¡Es un empate!');
            }

            game.currentPlayer = game.player;
            const content = getBoardContent(game.board, game.currentPlayer.tag);
            if (game.boardMessage) await game.boardMessage.delete().catch(() => {});
            game.boardMessage = await game.channel.send(content);
            
            game.locked = false; // Desbloqueamos, listo para la siguiente jugada del jugador
            this.startTurnTimer(channelId);
        }, 1000);
    },

    startTurnTimer: function(channelId) {
        const game = activeGames.get(channelId);
        if (!game) return;

        game.timer = setTimeout(() => {
            if (game.boardMessage) game.boardMessage.delete().catch(() => {});
            endGame(channelId, `El tiempo se ha agotado para ${game.currentPlayer.tag}.`);
        }, 60000);
    }
};