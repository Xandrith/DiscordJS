const { SlashCommandBuilder } = require('discord.js');
const musicPlayer = require('../../features/musicPlayer');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Reproduce un archivo MP3 en el canal de voz.')
        .addAttachmentOption(option => // <-- Cambiado de String a Attachment
            option.setName('archivo')
                .setDescription('El archivo MP3 que quieres reproducir.')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply();
        // Obtenemos el archivo adjunto en lugar de un string
        const attachment = interaction.options.getAttachment('archivo');
        await musicPlayer.play(interaction, attachment);
    },
};