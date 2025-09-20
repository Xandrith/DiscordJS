const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('giverole')
        .setDescription('Asigna un rol a un usuario.')
        .addUserOption(option => option.setName('usuario').setDescription('El usuario al que se le dará el rol').setRequired(true))
        .addRoleOption(option => option.setName('rol').setDescription('El rol a asignar').setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const role = interaction.options.getRole('rol');
        const member = await interaction.guild.members.fetch(user.id);
        await member.roles.add(role);
        await interaction.reply(`✅ Se ha asignado el rol **${role.name}** a **${user.tag}**.`);
    },
};