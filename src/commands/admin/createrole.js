const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createrole')
        .setDescription('Crea un nuevo rol en el servidor.')
        .addStringOption(option => option.setName('nombre').setDescription('Nombre del nuevo rol').setRequired(true))
        .setDMPermission(false),
    async execute(interaction) {
        const name = interaction.options.getString('nombre');
        await interaction.guild.roles.create({ name: name });
        await interaction.reply(`✨ Se ha creado el rol **${name}**.`);
    },
};