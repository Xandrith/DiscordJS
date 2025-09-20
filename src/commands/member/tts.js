const { SlashCommandBuilder } = require('discord.js');
const ttsHandler = require('../../features/ttsHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tts')
        .setDescription('Convierte tu texto en voz y lo reproduce en tu canal de voz.')
        .addStringOption(option =>
            option.setName('texto')
                .setDescription('El texto que quieres que diga el bot (máx 200 caracteres).')
                .setRequired(true)
                .setMaxLength(200))
        .addStringOption(option =>
            option.setName('idioma')
                .setDescription('Opcional: Elige un idioma (ej. es, en, ja, fr). Por defecto es español.')
                .setRequired(false)),
    async execute(interaction) {
        const text = interaction.options.getString('texto');
        const lang = interaction.options.getString('idioma');
        await ttsHandler.speak(interaction, text, lang);
    },
};