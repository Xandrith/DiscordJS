const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Muestra información sobre el servidor.'),
    async execute(interaction) {
        const server = interaction.guild;
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Información de ${server.name}`)
            .setThumbnail(server.iconURL({ dynamic: true }))
            .addFields(
                { name: '👑 Dueño', value: `<@${server.ownerId}>`, inline: true },
                { name: '👥 Miembros', value: `${server.memberCount}`, inline: true },
                { name: '📅 Creado el', value: `<t:${parseInt(server.createdTimestamp / 1000)}:D>`, inline: true },
            )
            .setTimestamp();
        await interaction.reply({ embeds: [embed] });
    },
};