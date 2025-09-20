const { Events } = require('discord.js');
const Logger = require('../features/logger');

module.exports = {
    name: Events.GuildMemberUpdate,
    async execute(oldMember, newMember) {
        // Log de cambio de apodo
        if (oldMember.nickname !== newMember.nickname) {
            Logger.logEvent('✏️ Apodo Cambiado', `El apodo de **${newMember.user.tag}** cambió:\n**Antes:** \`${oldMember.nickname || 'Ninguno'}\`\n**Ahora:** \`${newMember.nickname || 'Ninguno'}\``);
        }

        // Log de roles añadidos/quitados
        const oldRoles = oldMember.roles.cache;
        const newRoles = newMember.roles.cache;
        if (oldRoles.size > newRoles.size) {
            const removedRole = oldRoles.find(role => !newRoles.has(role.id));
            Logger.logEvent('❌ Rol Removido', `Se le quitó el rol \`${removedRole.name}\` a **${newMember.user.tag}**.`);
        }
        if (newRoles.size > oldRoles.size) {
            const addedRole = newRoles.find(role => !oldRoles.has(role.id));
            Logger.logEvent('✅ Rol Añadido', `Se le añadió el rol \`${addedRole.name}\` a **${newMember.user.tag}**.`);
        }
    },
};