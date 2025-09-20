const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Muestra tu avatar o el de otro miembro.')
        .addUserOption(option => option.setName('usuario').setDescription('El miembro del que quieres el avatar')),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario') || interaction.user;
        const embed = new EmbedBuilder()
            .setColor('#f7ac1a')
            .setTitle(`Avatar de ${user.username}`)
            .setImage(user.displayAvatarURL({ dynamic: true, size: 256 }));
        await interaction.reply({ embeds: [embed] });
    },
};