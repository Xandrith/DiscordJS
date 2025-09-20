const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('timeout')
        .setDescription('Aísla a un miembro por un tiempo determinado.')
        .addUserOption(option => option.setName('usuario').setDescription('El miembro a aislar').setRequired(true))
        .addIntegerOption(option => option.setName('minutos').setDescription('La cantidad de minutos').setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario');
        const minutes = interaction.options.getInteger('minutos');
        const member = await interaction.guild.members.fetch(user.id);

        if (!member.moderatable) {
            return interaction.reply({ content: 'No puedo aislar a este usuario.', ephemeral: true });
        }
        
        const duration = minutes * 60 * 1000;
        await member.timeout(duration, `Aislado por ${interaction.user.tag}`);
        await interaction.reply(`🤫 El usuario **${user.tag}** ha sido aislado por ${minutes} minuto(s).`);
    },
};