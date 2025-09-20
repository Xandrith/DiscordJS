const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Hace que el bot envíe un mensaje en un canal específico.')
        .addStringOption(option => 
            option.setName('mensaje')
                .setDescription('El mensaje que dirá el bot. Usa \\n para saltos de línea.')
                .setRequired(true))
        .addChannelOption(option => // <-- Opción nueva para el canal
            option.setName('canal')
                .setDescription('El canal donde se enviará el mensaje (si no se especifica, será este canal)')
                .addChannelTypes(ChannelType.GuildText) // Solo permite canales de texto
                .setRequired(false)) // Es opcional
        .setDMPermission(false),
    async execute(interaction) {
        const messageContent = interaction.options.getString('mensaje').replace(/\\n/g, '\n');
        // Obtenemos el canal de la opción. Si no existe, usamos el canal actual.
        const targetChannel = interaction.options.getChannel('canal') || interaction.channel;

        try {
            // Verificamos si el bot tiene permisos para enviar mensajes en el canal de destino
            const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
            const botPermissions = targetChannel.permissionsFor(botMember);

            if (!botPermissions.has(PermissionFlagsBits.SendMessages)) {
                return interaction.reply({
                    content: `❌ No tengo permisos para enviar mensajes en el canal ${targetChannel}.`,
                    ephemeral: true,
                });
            }

            // Enviamos el mensaje al canal de destino
            await targetChannel.send(messageContent);

            // Respondemos de forma efímera para confirmar la acción
            await interaction.reply({ 
                content: `✔️ Mensaje enviado correctamente en el canal ${targetChannel}.`, 
                ephemeral: true 
            });

        } catch (error) {
            console.error('Error en el comando /say:', error);
            await interaction.reply({
                content: 'Hubo un error al intentar enviar el mensaje en ese canal.',
                ephemeral: true
            });
        }
    },
};