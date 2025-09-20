const { Events, AuditLogEvent } = require('discord.js');
const Logger = require('../features/logger');

module.exports = {
    name: Events.GuildBanAdd,
    async execute(ban) {
        const fetchedLogs = await ban.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberBanAdd,
        });
        const banLog = fetchedLogs.entries.first();
        if (!banLog) return Logger.logEvent('Usuario Baneado', `**${ban.user.tag}** fue baneado, pero no se encontró el responsable en el registro de auditoría.`);

        const { executor, target } = banLog;
        const reason = banLog.reason || 'No se especificó una razón.';
        
        Logger.logEvent('🛡️ Usuario Baneado', `**${target.tag}** fue baneado por **${executor.tag}**.\nRazón: \`${reason}\``);
    },
};