const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const db = new sqlite3.Database("./db/database.sqlite");

// Criar tabela de usuários (se não existir)
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      email TEXT UNIQUE,
      telefone TEXT,
      senha TEXT,
      matricula INTEGER,
      cpf INTEGER,
      siape INTEGER,
      tipo TEXT,          -- Ex: aluno, professor, admin, etc.
      criadoPor INTEGER,  -- ID do usuário que criou este
      criadoEm DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Criar admin master se não existir
  const masterEmail = "master@pisic.com";
  const masterPassword = bcrypt.hashSync("master123", 10); 

  db.get("SELECT * FROM usuarios WHERE email = ?", [masterEmail], (err, row) => {
    if (!row) {
      db.run(
        "INSERT INTO usuarios (nome, email, senha, tipo, criadoPor) VALUES (?, ?, ?, ?, ?)",
        ["Administrador Master", masterEmail, masterPassword, "admin_master", null],
        function (err) {
          if (err) {
            console.error("Erro ao criar admin master:", err);
          } else {
            console.log("Usuário master criado com sucesso (email: master@pisic.com | senha: master123)");
          }
        }
      );
    }
  });
});

module.exports = db;
