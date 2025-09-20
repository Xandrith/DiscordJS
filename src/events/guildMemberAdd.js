const { Events, EmbedBuilder } = require('discord.js');
const { welcomeChannelId, newMemberRoleId } = require('../../config.json');

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(member) {
        console.log(`Nuevo miembro: ${member.user.tag} se ha unido al servidor.`);

        // Asignar Rol Automático
        if (newMemberRoleId) {
            try {
                const role = await member.guild.roles.fetch(newMemberRoleId);
                if (role) {
                    await member.roles.add(role);
                    console.log(`Rol "${role.name}" asignado a ${member.user.tag}.`);
                }
            } catch (error) {
                console.error(`Error al intentar asignar el rol de bienvenida a ${member.user.tag}:`, error);
            }
        }

        // Enviar Mensaje de Bienvenida
        if (welcomeChannelId) {
            try {
                const channel = await member.guild.channels.fetch(welcomeChannelId);
                if (channel && channel.isTextBased()) {

                    const welcomeEmbed = new EmbedBuilder()
                        .setColor('#2ecc71')
                        .setTitle(`¡Un nuevo miembro ha llegado!`)
                        .setDescription(`¡Hola, ${member}! Te damos la bienvenida a **${member.guild.name}**. ¡Esperamos que disfrutes tu estancia!`)
                        .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
                        .setTimestamp();
                    
                    await channel.send({ content: `👋 ¡Bienvenido, ${member}!`, embeds: [welcomeEmbed] });
                }
            } catch (error) {
                console.error(`Error al intentar enviar el mensaje de bienvenida:`, error);
            }
        }

        // Notificación en tiempo real para el panel web
        if (member.client.wss) {
            member.client.wss.broadcast({ 
                type: 'memberCountUpdate', 
                count: member.guild.memberCount 
            });
        }
    },
};