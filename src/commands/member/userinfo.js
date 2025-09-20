const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription('Muestra información sobre ti o sobre otro miembro.')
        .addUserOption(option => option.setName('usuario').setDescription('El miembro del que quieres info')),
    async execute(interaction) {
        const user = interaction.options.getUser('usuario') || interaction.user;
        const member = await interaction.guild.members.fetch(user.id);
        const embed = new EmbedBuilder()
            .setColor('#a84300')
            .setTitle(`Información de ${user.username}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: '👤 Tag', value: user.tag, inline: true },
                { name: '🆔 ID', value: user.id, inline: true },
                { name: '🤖 ¿Es un bot?', value: user.bot ? 'Sí' : 'No', inline: true },
                { name: '📅 Cuenta creada', value: `<t:${parseInt(user.createdTimestamp / 1000)}:R>`, inline: true },
                { name: '👋 Se unió al servidor', value: `<t:${parseInt(member.joinedTimestamp / 1000)}:R>`, inline: true },
                { name: '👑 Roles', value: member.roles.cache.map(r => r).join(' ') || 'Ninguno' },
            )
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    },
};