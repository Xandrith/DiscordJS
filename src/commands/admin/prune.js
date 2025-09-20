const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('prune')
        .setDescription('Elimina una cantidad de mensajes de un canal.')
        .addIntegerOption(option => 
            option.setName('cantidad')
                .setDescription('Número de mensajes a eliminar (1-99)')
                .setMinValue(1)
                .setMaxValue(99)
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('canal')
                .setDescription('El canal donde se eliminarán los mensajes (opcional)')
                .addChannelTypes(ChannelType.GuildText)
                .setRequired(false))
        .setDMPermission(false),
    async execute(interaction) {
        const amount = interaction.options.getInteger('cantidad');
        const targetChannel = interaction.options.getChannel('canal') || interaction.channel;

        try {
            const botMember = await interaction.guild.members.fetch(interaction.client.user.id);
            const botPermissions = targetChannel.permissionsFor(botMember);

            if (!botPermissions.has(PermissionFlagsBits.ManageMessages)) {
                return interaction.reply({
                    content: `No tengo permisos para eliminar mensajes en el canal ${targetChannel}.`,
                    ephemeral: true,
                });
            }

            const messages = await targetChannel.bulkDelete(amount, true);
            await interaction.reply({ 
                content: `🧹 ¡Se eliminaron ${messages.size} mensajes en el canal ${targetChannel}!`, 
                ephemeral: true 
            });

        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: `Hubo un error al intentar eliminar mensajes en ${targetChannel}.`,
                ephemeral: true
            });
        }
    },
};