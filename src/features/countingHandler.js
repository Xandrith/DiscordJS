const { EmbedBuilder } = require('discord.js');
const db = require('./database');

async function breakStreak(message, settings, reason) {
    db.resetGuildCount(message.guild.id);

    const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('¡Racha Rota!')
        .setDescription(`${message.author} ha roto la racha. ${reason}`)
        .addFields(
            { name: 'Racha Final', value: `\`${settings.currentCount}\`` },
            { name: 'Próximo Número', value: '`1`' }
        )
        .setTimestamp();
    
    await message.react('❌');
    await message.channel.send({ embeds: [embed] });
}

module.exports = {
    handleCounting: async function(message) {
        const settings = db.getGuildSettings(message.guild.id);
        
        // Comprobamos si el contenido es un número puro
        const userNumber = parseInt(message.content, 10);
        if (isNaN(userNumber) || userNumber.toString() !== message.content.trim()) {
            // Si no es un número, borramos el mensaje y no hacemos nada más
            await message.delete().catch(() => {});
            return;
        }

        // Regla: Un usuario no puede contar dos veces seguidas
        if (message.author.id === settings.lastCounterId) {
            await breakStreak(message, settings, '¡No puedes contar dos veces seguidas!');
            return;
        }

        // Comprobamos si el número es el correcto
        const expectedNumber = settings.currentCount + 1;
        if (userNumber === expectedNumber) {
            // El número es correcto
            db.updateGuildCount(message.guild.id, expectedNumber, message.author.id);
            await message.react('✅');
        } else {
            // El número es incorrecto
            await breakStreak(message, settings, `El número correcto era \`${expectedNumber}\`.`);
        }
    }
};