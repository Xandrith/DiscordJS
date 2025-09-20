const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.resolve(__dirname, '../../levels.db'), { fileMustExist: false });

// Tabla de usuarios
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, guildId TEXT, userId TEXT, xp INTEGER DEFAULT 0,
        level INTEGER DEFAULT 0, game_wins INTEGER DEFAULT 0, gpt_uses_today INTEGER DEFAULT 0,
        last_gpt_use_date TEXT DEFAULT ''
    )
`);

// Tabla de reacciones
db.exec(`
    CREATE TABLE IF NOT EXISTS user_reactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        guildId TEXT NOT NULL,
        userId TEXT NOT NULL,
        reactionContent TEXT NOT NULL 
    )
`);

// Nueva tabla para ajustes del servidor (como el contador)
db.exec(`
    CREATE TABLE IF NOT EXISTS guild_settings (
        guildId TEXT PRIMARY KEY,
        currentCount INTEGER DEFAULT 0,
        lastCounterId TEXT
    )
`);


// --- LÓGICA DE MIGRACIÓN (PARA ACTUALIZAR BASES DE DATOS ANTIGUAS) ---
try {
    db.prepare('SELECT game_wins FROM users LIMIT 1').get();
} catch (error) {
    console.log('Migrando DB: Añadiendo columna "game_wins"...');
    db.exec('ALTER TABLE users ADD COLUMN game_wins INTEGER DEFAULT 0');
}
try {
    db.prepare('SELECT gpt_uses_today, last_gpt_use_date FROM users LIMIT 1').get();
} catch (error) {
    console.log('Migrando DB: Añadiendo columnas de GPT...');
    db.exec('ALTER TABLE users ADD COLUMN gpt_uses_today INTEGER DEFAULT 0');
    db.exec('ALTER TABLE users ADD COLUMN last_gpt_use_date TEXT DEFAULT ""');
}
try {
    db.prepare('SELECT reactionContent FROM user_reactions LIMIT 1').get();
} catch (error) {
    console.log('Migrando DB: Renombrando columna "imageUrl" a "reactionContent"...');
    try {
        db.exec('ALTER TABLE user_reactions RENAME COLUMN imageUrl TO reactionContent');
    } catch (e) {
        console.error('No se pudo renombrar la columna, puede que ya exista o la tabla sea nueva.');
    }
}


console.log('Base de datos conectada y lista.');

module.exports = {
    // --- Funciones para la tabla 'users' ---
    getUser: (guildId, userId) => {
        return db.prepare('SELECT * FROM users WHERE guildId = ? AND userId = ?').get(guildId, userId);
    },
    createUser: (guildId, userId) => {
        db.prepare('INSERT INTO users (id, guildId, userId) VALUES (?, ?, ?)')
          .run(`${guildId}-${userId}`, guildId, userId);
        return { id: `${guildId}-${userId}`, guildId, userId, xp: 0, level: 0, game_wins: 0, gpt_uses_today: 0, last_gpt_use_date: '' };
    },
    updateUser: (guildId, userId, data) => {
        db.prepare('UPDATE users SET xp = ?, level = ? WHERE guildId = ? AND userId = ?')
          .run(data.xp, data.level, guildId, userId);
    },
    getLeaderboard: (guildId) => {
        return db.prepare('SELECT * FROM users WHERE guildId = ? ORDER BY xp DESC').all(guildId);
    },
    incrementUserWins: (guildId, userId) => {
        let user = db.prepare('SELECT * FROM users WHERE guildId = ? AND userId = ?').get(guildId, userId);
        if (!user) {
            module.exports.createUser(guildId, userId);
        }
        db.prepare('UPDATE users SET game_wins = game_wins + 1 WHERE guildId = ? AND userId = ?')
          .run(guildId, userId);
    },
    getWinsLeaderboard: (guildId) => {
        return db.prepare('SELECT * FROM users WHERE guildId = ? AND game_wins > 0 ORDER BY game_wins DESC LIMIT 10').all(guildId);
    },
    incrementUserGptUses: (guildId, userId) => {
        const today = new Date().toISOString().slice(0, 10);
        db.prepare('UPDATE users SET gpt_uses_today = gpt_uses_today + 1, last_gpt_use_date = ? WHERE guildId = ? AND userId = ?')
          .run(today, guildId, userId);
    },

    // --- Funciones para la tabla 'user_reactions' ---
    addReaction: (guildId, userId, reactionContent) => {
        db.prepare('INSERT INTO user_reactions (guildId, userId, reactionContent) VALUES (?, ?, ?)')
          .run(guildId, userId, reactionContent);
    },
    getReactions: (guildId, userId) => {
        return db.prepare('SELECT * FROM user_reactions WHERE guildId = ? AND userId = ?').all(guildId, userId);
    },
    removeReaction: (id) => {
        db.prepare('DELETE FROM user_reactions WHERE id = ?').run(id);
    },

    // --- NUEVAS FUNCIONES PARA EL CONTADOR ---
    getGuildSettings: (guildId) => {
        let settings = db.prepare('SELECT * FROM guild_settings WHERE guildId = ?').get(guildId);
        if (!settings) {
            db.prepare('INSERT INTO guild_settings (guildId) VALUES (?)').run(guildId);
            settings = { guildId, currentCount: 0, lastCounterId: null };
        }
        return settings;
    },
    updateGuildCount: (guildId, newCount, newUserId) => {
        db.prepare('UPDATE guild_settings SET currentCount = ?, lastCounterId = ? WHERE guildId = ?')
          .run(newCount, newUserId, guildId);
    },
    resetGuildCount: (guildId) => {
        db.prepare('UPDATE guild_settings SET currentCount = 0, lastCounterId = NULL WHERE guildId = ?')
          .run(guildId);
    }
};