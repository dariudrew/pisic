const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../models/userModel");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();
const SECRET_KEY = "sua_chave_secreta_super_segura";

// Rota de auto-cadastro
router.post("/self-register", async (req, res) => {
  try {
    
    const { nome, email, senha, tipo, matricula, telefone, cpf, siape } = req.body;
    
    // Verificar se já existe usuário com esse email
    const existingUser = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM usuarios WHERE email = ?", [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existingUser) {
      return res.status(400).json({ error: "E-mail já cadastrado" });
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Montar query e valores
    let query = "";
    let values = [];

    if (tipo === "aluno") {
      query = `
        INSERT INTO usuarios (nome, email, senha, tipo, matricula, telefone)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      values = [nome, email, hashedPassword, tipo, matricula || null, telefone || null];
    } else if (tipo === "professor") {
      query = `
        INSERT INTO usuarios (nome, email, senha, tipo, cpf, siape, telefone)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      values = [nome, email, hashedPassword, tipo, cpf || null, siape || null, telefone || null];
    }

    // Inserir no banco
    await new Promise((resolve, reject) => {
      db.run(query, values, function (err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });

    res.json({ message: "Usuário cadastrado com sucesso!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro no servidor" });
  }
});


//Cadastro de usuário (apenas admin/master pode cadastrar qualquer tipo)
router.post("/register", authenticateToken, isAdmin, (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  if (!nome || !email || !senha || !tipo) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }

  const hashedPassword = bcrypt.hashSync(senha, 10);

  db.run(
    "INSERT INTO users (nome, email, senha, tipo, criadoPor) VALUES (?, ?, ?, ?, ?)",
    [nome, email, hashedPassword, tipo, req.user.id],
    function (err) {
      if (err) {
        return res.status(400).json({ error: "Erro ao cadastrar usuário: " + err.message });
      }
      res.status(201).json({ message: "Usuário criado com sucesso!", id: this.lastID });
    }
  );
});

//Login (qualquer usuário)
router.post("/login", (req, res) => {
  const { email, senha } = req.body;

  db.get("SELECT * FROM usuarios WHERE email = ?", [email], (err, user) => {
    if (err) return res.status(500).json({ error: "Erro no servidor" });
    if (!user) return res.status(404).json({ error: "Usuário não encontrado" });

    const validPassword = bcrypt.compareSync(senha, user.senha);
    if (!validPassword) return res.status(401).json({ error: "Senha inválida" });

    // Criar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, tipo: user.tipo },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login novo realizado com sucesso", token });
  });
});

module.exports = router;
