const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../features/database');
const { calculateXPForNextLevel } = require('../../features/xpHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('rank')
        .setDescription('Muestra tu nivel, XP y rango en el servidor.')
        .addUserOption(option => 
            option.setName('usuario')
                .setDescription('Ver el rango de otro miembro')),
    async execute(interaction) {
        const targetUser = interaction.options.getUser('usuario') || interaction.user;
        const guildId = interaction.guild.id;

        const user = db.getUser(guildId, targetUser.id);

        if (!user || user.xp === 0) {
            return interaction.reply({ content: `${targetUser.tag} aún no ha ganado XP. ¡Anímale a participar!`, ephemeral: true });
        }

        const leaderboard = db.getLeaderboard(guildId);
        const rank = leaderboard.findIndex(u => u.userId === targetUser.id) + 1;
        const xpToNext = calculateXPForNextLevel(user.level);

        const rankEmbed = new EmbedBuilder()
            .setColor('#f1c40f')
            .setAuthor({ name: `Estadísticas de ${targetUser.tag}`, iconURL: targetUser.displayAvatarURL() })
            .setThumbnail(targetUser.displayAvatarURL())
            .addFields(
                { name: '⭐ Nivel', value: `**${user.level}**`, inline: true },
                { name: '🏆 Rango', value: `**#${rank}** de ${leaderboard.length}`, inline: true },
                { name: '✨ XP', value: `**${user.xp} / ${xpToNext}**`, inline: false },
            )
            .setTimestamp();

        await interaction.reply({ embeds: [rankEmbed] });
    },
};