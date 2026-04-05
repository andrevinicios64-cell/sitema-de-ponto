const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db/banco.db');

db.serialize(() => {

  db.run(`
    CREATE TABLE IF NOT EXISTS funcionarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pontos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      funcionario_id INTEGER,
      data TEXT,
      entrada TEXT,
      saida TEXT
    )
  `);

});

module.exports = db;