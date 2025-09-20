const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');
const { botCommandsChannelId, gameChannelId, aiChannelId, musicVoiceChannelId } = require('../../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guia')
        .setDescription('Muestra una guía interactiva de todos los comandos del bot.'),
    async execute(interaction) {
        // --- Creamos todos los embeds de antemano ---

        const introEmbed = new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle('📜 Guía de Comandos de MandiuBot')
            .setDescription('¡Hola! Soy MandiuBot. Usa el menú de abajo para seleccionar una categoría y ver los comandos disponibles.')
            .addFields({
                name: 'Canales Importantes',
                value: `
- **Comandos Generales:** <#${botCommandsChannelId}>
- **Juegos:** <#${gameChannelId}>
- **Inteligencia Artificial:** <#${aiChannelId}>
- **Música (Canal de Voz):** <#${musicVoiceChannelId}>
                `
            });

        const memberEmbed = new EmbedBuilder()
            .setColor('#1ABC9C')
            .setTitle('👤 Comandos para Miembros')
            .setDescription(
                '`/ping`: Muestra mi velocidad de respuesta.\n' +
                '`/serverinfo`: Muestra información de este servidor.\n' +
                '`/userinfo [usuario]`: Muestra información sobre ti o sobre otro miembro.\n' +
                '`/avatar [usuario]`: Muestra tu foto de perfil o la de otro miembro.\n' +
                '`/rank [usuario]`: Muestra tu nivel, XP y rango.\n' +
                '`/color [tono]`: Elige un color personalizado para tu nombre.\n' +
                '`/img [busqueda]`: Busca y muestra una imagen de internet.\n' +
                '`/suggest [idea]`: Envía una sugerencia a los administradores.\n' +
                '`/report [usuario] [razon]`: Reporta a un usuario con los administradores.\n' +
                '`/help`: Muestra una lista resumida de comandos.\n' +
                '`/guia`: Muestra esta guía completa.'
            );
        
        const musicEmbed = new EmbedBuilder()
            .setColor('#E91E63')
            .setTitle('🎵 Comandos de Música')
            .setDescription(
                '`/play [archivo]`: Añade un archivo MP3 a la cola de reproducción.\n' +
                '`/pause`: Pausa la canción actual.\n' +
                '`/resume`: Reanuda la canción actual.\n' +
                '`/skip`: Salta a la siguiente canción.\n' +
                '`/queue`: Muestra la lista de canciones en espera.\n' +
                '`/stop`: Detiene la música y limpia la cola.'
            );

        const gamesEmbed = new EmbedBuilder()
            .setColor('#F1C40F')
            .setTitle('🎮 Comandos de Juegos')
            .setDescription(
                `Disponibles solo en <#${gameChannelId}>.\n\n` +
                '`/gato`: Inicia una partida de Gato (Tic-Tac-Toe) contra mí.\n' +
                '`c! <número>`: (Comando de texto) Haz tu jugada en la partida (ej. `c! 5`).\n' +
                '`c! puestos`: (Comando de texto) Muestra la tabla de clasificación de victorias.'
            );

        // --- Creamos el Menú Desplegable ---
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('guia-select')
            .setPlaceholder('Selecciona una categoría...')
            .addOptions([
                { label: 'Inicio', description: 'Volver a la página principal de la guía.', value: 'inicio', emoji: '🏠' },
                { label: 'Comandos de Miembros', description: 'Ver los comandos disponibles para todos.', value: 'miembros', emoji: '👤' },
                { label: 'Comandos de Música', description: 'Ver los comandos del reproductor de música.', value: 'musica', emoji: '🎵' },
                { label: 'Comandos de Juegos', description: 'Ver los comandos para los minijuegos.', value: 'juegos', emoji: '🎮' },
            ]);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        // --- Enviamos el mensaje inicial ---
        const reply = await interaction.reply({
            embeds: [introEmbed],
            components: [row],
            ephemeral: true
        });

        // --- Creamos un colector para escuchar las interacciones con el menú ---
        const filter = (i) => i.user.id === interaction.user.id; // Solo el usuario original puede interactuar
        const collector = reply.createMessageComponentCollector({
            componentType: ComponentType.StringSelect,
            filter,
            time: 300000 // 5 minutos de inactividad
        });

        collector.on('collect', async (i) => {
            const selectedValue = i.values[0];
            if (selectedValue === 'inicio') {
                await i.update({ embeds: [introEmbed] });
            } else if (selectedValue === 'miembros') {
                await i.update({ embeds: [memberEmbed] });
            } else if (selectedValue === 'musica') {
                await i.update({ embeds: [musicEmbed] });
            } else if (selectedValue === 'juegos') {
                await i.update({ embeds: [gamesEmbed] });
            }
        });

        // Cuando el colector termina (por tiempo), desactivamos el menú
        collector.on('end', async () => {
            const disabledRow = new ActionRowBuilder().addComponents(
                selectMenu.setDisabled(true)
            );
            await interaction.editReply({ components: [disabledRow] });
        });
    },
};