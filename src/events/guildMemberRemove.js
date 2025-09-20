const { Events, AuditLogEvent } = require('discord.js');
const Logger = require('../features/logger');

module.exports = {
    name: Events.GuildMemberRemove,
    async execute(member) {
        const fetchedLogs = await member.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.MemberKick,
        });
        const kickLog = fetchedLogs.entries.first();

        if (kickLog && kickLog.target.id === member.id && kickLog.createdAt > Date.now() - 5000) {
            const { executor, target } = kickLog;
            const reason = kickLog.reason || 'No se especificó una razón.';
            Logger.logEvent('👢 Usuario Expulsado', `**${target.tag}** fue expulsado por **${executor.tag}**.\nRazón: \`${reason}\``);
        } else {
            Logger.logEvent('👋 Usuario se ha Ido', `**${member.user.tag}** ha abandonado el servidor.`);
        }
    },
};