const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Expulsa a un miembro del servidor.')
        .addUserOption(option => option.setName('usuario').setDescription('El miembro a expulsar').setRequired(true))
        .addStringOption(option => option.setName('razon').setDescription('La razón de la expulsión'))
        .setDMPermission(false),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razon') || 'No se especificó una razón.';
        const member = await interaction.guild.members.fetch(user.id);

        if (!member.kickable) {
            return interaction.reply({ content: 'No puedo expulsar a este usuario.', ephemeral: true });
        }

        await member.kick(reason);
        await interaction.reply(`👢 El usuario **${user.tag}** ha sido expulsado. Razón: ${reason}`);
    },
};