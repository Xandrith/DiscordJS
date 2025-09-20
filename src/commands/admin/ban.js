const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Banea a un miembro del servidor.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('El miembro a banear')
                .setRequired(true))
        .addStringOption(option => 
            option.setName('razon')
                .setDescription('La razón del baneo'))
        .setDMPermission(false),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const reason = interaction.options.getString('razon') || 'No se especificó una razón.';
        const member = await interaction.guild.members.fetch(user.id);

        if (!member.bannable) {
            return interaction.reply({ content: 'No puedo banear a este usuario.', ephemeral: true });
        }

        await member.ban({ reason: reason });
        await interaction.reply(`🔨 El usuario **${user.tag}** ha sido baneado. Razón: ${reason}`);
    },
};