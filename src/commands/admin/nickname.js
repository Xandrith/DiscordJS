const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nickname')
        .setDescription('Gestiona el apodo de un miembro del servidor.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('Establece un nuevo apodo para un usuario.')
                .addUserOption(option => 
                    option.setName('usuario')
                        .setDescription('El usuario al que se le cambiará el apodo.')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('apodo')
                        .setDescription('El nuevo apodo para el usuario (máx 32 caracteres).')
                        .setRequired(true)
                        .setMaxLength(32)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('Restablece el apodo de un usuario a su nombre original.')
                .addUserOption(option =>
                    option.setName('usuario')
                        .setDescription('El usuario al que se le restablecerá el apodo.')
                        .setRequired(true))),
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser('usuario');
        const member = await interaction.guild.members.fetch(user.id).catch(() => null);

        if (!member) {
            return interaction.reply({ content: 'No se pudo encontrar a ese usuario en el servidor.', ephemeral: true });
        }

        // --- Comprobación de Jerarquía ---
        if (!member.manageable) {
            const embed = new EmbedBuilder()
                .setColor('#e74c3c')
                .setTitle('Acción Denegada')
                .setDescription(`No puedo modificar el apodo de **${user.tag}**. Esto suele ocurrir si el usuario tiene un rol igual o superior al mío, o si es el dueño del servidor.`);
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }
        
        try {
            if (subcommand === 'set') {
                const nickname = interaction.options.getString('apodo');
                const oldNickname = member.displayName;
                
                await member.setNickname(nickname);

                const embed = new EmbedBuilder()
                    .setColor('#2ecc71')
                    .setTitle('Apodo Cambiado')
                    .setDescription(`Se ha cambiado el apodo de ${user}.`)
                    .addFields(
                        { name: 'Apodo Anterior', value: `\`${oldNickname}\``, inline: true },
                        { name: 'Nuevo Apodo', value: `\`${nickname}\``, inline: true }
                    )
                    .setTimestamp();
                
                await interaction.reply({ embeds: [embed] });

            } else if (subcommand === 'reset') {
                const oldNickname = member.displayName;

                await member.setNickname(null); // Poner 'null' restablece el apodo

                const embed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setTitle('Apodo Restablecido')
                    .setDescription(`Se ha restablecido el apodo de ${user} a su nombre de usuario original.`)
                    .addFields({ name: 'Apodo Anterior', value: `\`${oldNickname}\``, inline: true })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error en el comando /nickname:', error);
            await interaction.reply({ content: 'Hubo un error al intentar modificar el apodo de este usuario.', ephemeral: true });
        }
    },
};