const { Events } = require('discord.js');
const Logger = require('../features/logger');
const { 
    botCommandsChannelId, 
    adminRoleId, 
    memberRoleId, 
    specialRoleIds, 
    gameChannelId,
    aiChannelId
} = require('../../config.json');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Este manejador ahora solo se enfoca en la ejecución de comandos de barra
        if (!interaction.isChatInputCommand()) return;

        // 1. Registrar el uso del comando
        Logger.logCommand(interaction);

        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) {
            console.error(`No se encontró ningún comando que coincida con ${interaction.commandName}.`);
            return;
        }

        const commandCategory = command.category;

        // 2. Lógica de Restricción de Canal
        if (commandCategory === 'games') {
            if (interaction.channelId !== gameChannelId) {
                 return interaction.reply({ content: `Este comando solo se puede usar en el canal de juegos: <#${gameChannelId}>.`, ephemeral: true });
            }
        } 
        else if (commandCategory === 'ai') {
            if (interaction.channelId !== aiChannelId) {
                return interaction.reply({ content: `Este comando solo se puede usar en el canal de IA: <#${aiChannelId}>.`, ephemeral: true });
            }
        }
        else { // El resto de comandos (admin, member, music, special)
            if (interaction.channelId !== botCommandsChannelId) {
                return interaction.reply({ content: `Este comando solo se puede usar en el canal de comandos: <#${botCommandsChannelId}>.`, ephemeral: true });
            }
        }

        // 3. Lógica de Permisos por Roles
        const memberRoles = interaction.member.roles.cache;

        if (commandCategory === 'admin') {
            if (!memberRoles.has(adminRoleId)) {
                return interaction.reply({ content: '🚫 No tienes el rol requerido para usar este comando de administrador.', ephemeral: true });
            }
        }
        else if (commandCategory === 'special') {
             const hasRequiredRole = specialRoleIds.some(roleId => memberRoles.has(roleId));
             if (!hasRequiredRole) {
                return interaction.reply({ content: '🚫 No tienes el rol requerido para usar este comando especial.', ephemeral: true });
             }
        }
        else { // Para las categorías 'member', 'music', 'games', 'ai'
             if (!memberRoles.has(memberRoleId)) {
                return interaction.reply({ content: '🚫 No tienes el rol requerido para usar los comandos del bot.', ephemeral: true });
             }
        }

        // 4. Ejecución del Comando
        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(`Error al ejecutar el comando ${interaction.commandName}:`, error);
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: '¡Hubo un error al ejecutar este comando!', ephemeral: true });
            } else {
                await interaction.reply({ content: '¡Hubo un error al ejecutar este comando!', ephemeral: true });
            }
        }
    },
};