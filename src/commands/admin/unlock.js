const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('unlock')
        .setDescription('Desbloquea el canal actual.')
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: true
        });
        await interaction.reply(`🔓 El canal ha sido **desbloqueado**.`);
    },
};