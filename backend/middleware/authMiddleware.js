const jwt = require("jsonwebtoken");
const SECRET_KEY = "sua_chave_secreta_super_segura"; // 🔹 use uma variável de ambiente depois

// Middleware para verificar se o usuário está logado
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Formato esperado: "Bearer TOKEN"

  if (!token) return res.status(401).json({ error: "Token não fornecido" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Token inválido" });

    req.user = user; // salva o payload (id, email, tipo) dentro do req
    next();
  });
}

// Middleware para verificar se é admin ou admin_master
function isAdmin(req, res, next) {
  if (req.user.tipo === "admin" || req.user.tipo === "admin_master") {
    return next();
  }
  return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
}

// Middleware para verificar se é apenas o admin_master
function isMaster(req, res, next) {
  if (req.user.tipo === "admin_master") {
    return next();
  }
  return res.status(403).json({ error: "Acesso negado. Apenas o administrador master." });
}

module.exports = { authenticateToken, isAdmin, isMaster };
