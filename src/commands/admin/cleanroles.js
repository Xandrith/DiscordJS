const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cleanroles')
        .setDescription('Elimina los roles de color que no están siendo utilizados por ningún miembro.')
        .setDMPermission(false),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        try {
            const allRoles = await interaction.guild.roles.fetch();
            const unusedColorRoles = allRoles.filter(role => 
                role.name.startsWith('Color - ') && role.members.size === 0
            );

            if (unusedColorRoles.size === 0) {
                return interaction.editReply('✅ No se encontraron roles de color sin usar para limpiar.');
            }

            let deletedCount = 0;
            for (const role of unusedColorRoles.values()) {
                await role.delete('Limpieza de roles de color no utilizados.');
                deletedCount++;
            }

            await interaction.editReply(`🧹 Limpieza completada. Se eliminaron **${deletedCount}** roles de color no utilizados.`);

        } catch (error) {
            console.error('Error al limpiar los roles:', error);
            await interaction.editReply('Hubo un error al intentar limpiar los roles.');
        }
    },
};