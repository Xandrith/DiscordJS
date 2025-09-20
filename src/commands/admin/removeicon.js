const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const db = require('../../features/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('removeicon')
        .setDescription('Elimina un emoji de reacción automática de un usuario.')
        .addUserOption(option =>
            option.setName('usuario')
                .setDescription('El usuario del que se eliminará el emoji.')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const targetUser = interaction.options.getUser('usuario');
        const reactions = db.getReactions(interaction.guildId, targetUser.id);

        if (reactions.length === 0) {
            return interaction.editReply({ content: `**${targetUser.tag}** no tiene emojis de reacción configurados.` });
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('remove-icon-select')
            .setPlaceholder('Selecciona el emoji a eliminar...')
            .addOptions(reactions.map((reaction, index) => {
                const emoji = interaction.guild.emojis.cache.get(reaction.reactionContent);
                return {
                    label: `Emoji #${index + 1}`,
                    description: emoji ? emoji.name : 'Emoji no encontrado o eliminado del servidor.',
                    value: reaction.id.toString(),
                    emoji: emoji ? { id: emoji.id, name: emoji.name, animated: emoji.animated } : undefined,
                };
            }));

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const reply = await interaction.editReply({
            content: `Selecciona cuál de los ${reactions.length} emojis de reacción de **${targetUser.tag}** quieres eliminar:`,
            components: [row]
        });

        const filter = (i) => i.user.id === interaction.user.id;
        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter,
            time: 60000 // 1 minuto
        });

        collector.on('collect', async (i) => {
            const reactionIdToRemove = i.values[0];
            db.removeReaction(reactionIdToRemove);

            const embed = new EmbedBuilder()
                .setColor('#e74c3c')
                .setTitle('✅ Emoji de Reacción Eliminado')
                .setDescription(`Se ha eliminado el emoji de reacción seleccionado para ${targetUser}.`);
            
            await i.update({ embeds: [embed], content: '', components: [] });
            collector.stop();
        });

        collector.on('end', (collected) => {
            if (collected.size === 0) {
                interaction.editReply({ content: 'La selección ha expirado.', components: [] });
            }
        });
    },
};