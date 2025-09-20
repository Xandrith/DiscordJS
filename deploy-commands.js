require('dotenv').config(); // <-- AÑADE ESTA LÍNEA AL PRINCIPIO

const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
const foldersPath = path.join(__dirname, 'src', 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
    const commandsPath = path.join(foldersPath, folder);
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
        } else {
            console.log(`[ADVERTENCIA] Al comando en ${filePath} le falta una propiedad "data" o "execute".`);
        }
    }
}

const rest = new REST().setToken(token);

(async () => {
    try {
        console.log(`Iniciando actualización de ${commands.length} comandos de aplicación (/).`);
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );
        console.log(`Se recargaron exitosamente ${data.length} comandos de aplicación (/).`);
    } catch (error) {
        console.error(error);
    }
})();