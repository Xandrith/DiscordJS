const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const COLORS = [
    { name: 'Rojo', emoji: '🔴', value: '#FF4545' },
    { name: 'Azul', emoji: '🔵', value: '#458AFF' },
    { name: 'Verde', emoji: '🟢', value: '#45FF6A' },
    { name: 'Amarillo', emoji: '🟡', value: '#FFF345' },
    { name: 'Naranja', emoji: '🟠', value: '#FF9F45' },
    { name: 'Morado', emoji: '🟣', value: '#A145FF' },
    { name: 'Rosa', emoji: '🌸', value: '#FF45E1' },
    { name: 'Cian', emoji: '💧', value: '#45EFFF' },
    { name: 'Blanco', emoji: '⚪', value: '#EBEBEB' },
    { name: 'Negro', emoji: '⚫', value: '#2C2F33' },
    { name: 'Menta', emoji: '🌿', value: '#45FFB0' },
    { name: 'Lavanda', emoji: '💜', value: '#C6A9FF' },
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('color')
        .setDescription('Elige un color personalizado para tu nombre de usuario.')
        .addStringOption(option => {
            option.setName('tono')
                .setDescription('Elige el color que deseas aplicar.')
                .setRequired(true);
            COLORS.forEach(color => {
                option.addChoices({ name: `${color.emoji} ${color.name}`, value: color.value });
            });
            return option;
        }),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const hexColor = interaction.options.getString('tono');
        const selectedColor = COLORS.find(c => c.value === hexColor);
        const member = interaction.member;

        if (!selectedColor) {
            return interaction.editReply({ content: 'El color seleccionado no es válido.', ephemeral: true });
        }

        const roleName = `Color - ${selectedColor.emoji} ${selectedColor.name}`;

        try {
            const rolesToRemove = member.roles.cache.filter(role => role.name.startsWith('Color - '));
            if (rolesToRemove.size > 0) {
                await member.roles.remove(rolesToRemove);
            }

            let colorRole = interaction.guild.roles.cache.find(role => role.name === roleName);

            if (!colorRole) {
                colorRole = await interaction.guild.roles.create({
                    name: roleName,
                    color: selectedColor.value,
                    permissions: [],
                    reason: `Rol de color automático para ${interaction.user.tag}`,
                });
            }

            await member.roles.add(colorRole);

            const embed = new EmbedBuilder()
                .setColor(selectedColor.value)
                .setTitle('🎨 ¡Color de nombre actualizado!')
                .setDescription(`Se te ha asignado el color **${selectedColor.emoji} ${selectedColor.name}**.`)
                .setFooter({ text: 'Puede que necesites enviar un mensaje para ver el cambio.' });

            await interaction.editReply({ embeds: [embed], ephemeral: true });

        } catch (error) {
            console.error('Error en el comando /color:', error);
            await interaction.editReply({ content: 'Hubo un error al intentar cambiar tu color.', ephemeral: true });
        }
    },
};