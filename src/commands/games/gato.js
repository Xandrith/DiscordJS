const { SlashCommandBuilder } = require('discord.js');
const ticTacToeHandler = require('../../features/ticTacToeHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('gato')
        .setDescription('Inicia una partida de Gato (Tic-Tac-Toe) contra el bot.'),
    async execute(interaction) {
        // APLAZAMOS LA RESPUESTA AQUÍ
        await interaction.deferReply();
        // Luego, pasamos el control al manejador del juego
        ticTacToeHandler.startGame(interaction);
    },
};