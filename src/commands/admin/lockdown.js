const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lockdown')
        .setDescription('Bloquea el canal actual para que nadie pueda enviar mensajes.')
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: false
        });
        await interaction.reply(`🔒 El canal ha sido **bloqueado**.`);
    },
};