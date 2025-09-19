document.addEventListener("DOMContentLoaded", () => {
  const main = document.querySelector(".main");
  const telaDir = document.querySelector(".tela-dir");

  const toCadastro = document.getElementById("to-cadastro");
  const toLogin = document.getElementById("to-login"); // link dentro do cadastro
  const topToCadastro = document.getElementById("to-cadastro"); // link no login (mesmo id)

  const formLogin = document.getElementById("form-login");
  const formCadastro = document.getElementById("form-cadastro");
  const formAluno = document.getElementById("form-aluno");
  const formProfessor = document.getElementById("form-professor");

  const selectTipo = document.getElementById("tipo");

  const txtLogin = document.getElementById("txt-login");
  const txtCadastro = document.getElementById("txt-cadastro");

  const linkLogin = document.getElementById("links-login");
  const linkCadastro = document.getElementById("links-cadastro");

  // inicializa estado (opcional)
  if (selectTipo) {
    selectTipo.value = "aluno";
    formAluno && (formAluno.style.display = "block");
    formProfessor && (formProfessor.style.display = "none");
  }
  txtCadastro && (txtCadastro.style.display = "none");

  // helper: abrir cadastro (idempotente)
  function abrirCadastro(e) {
    if (e) e.preventDefault();
    main.classList.add("invertido");
    telaDir.classList.add("cadastro");

    formLogin && formLogin.classList.remove("active");
    formCadastro && formCadastro.classList.add("active");

    txtLogin && (txtLogin.style.display = "none");
    txtCadastro && (txtCadastro.style.display = "block");

    if (linkLogin) linkLogin.style.display = "none";
    if (linkCadastro) linkCadastro.style.display = "flex"; // mostra container do cadastro

    // garantir aluno por padrão
    if (selectTipo) {
      selectTipo.value = "aluno";
      formAluno && (formAluno.style.display = "block");
      formProfessor && (formProfessor.style.display = "none");
    }
  }

  // helper: abrir login (idempotente)
    function abrirLogin(e) {
      if (e) e.preventDefault();
      main.classList.remove("invertido");
      telaDir.classList.remove("cadastro");

      formCadastro && formCadastro.classList.remove("active");
      formLogin && formLogin.classList.add("active");

      txtLogin && (txtLogin.style.display = "block");
      txtCadastro && (txtCadastro.style.display = "none");

      if (linkCadastro) linkCadastro.style.display = "none";
      if (linkLogin) linkLogin.style.display = "flex";
   }

  // eventos (atente para que existam os elementos no DOM)
    const triggerCadastro = document.getElementById("to-cadastro"); // link do login
    const triggerLogin = document.getElementById("to-login"); // link dentro do cadastro

    triggerCadastro && triggerCadastro.addEventListener("click", abrirCadastro);
    triggerLogin && triggerLogin.addEventListener("click", abrirLogin);

  // também se você tiver outro botão/elemento que retorna ao login (ex: #to-login no final do form),
  // garanta que ele também chame abrirLogin:
    const toLoginInside = document.querySelector("#form-cadastro #to-login");
    if (toLoginInside) toLoginInside.addEventListener("click", abrirLogin);

  // listener para o select tipo (continua igual)
    if (selectTipo) {
      selectTipo.addEventListener("change", () => {
        if (formAluno) formAluno.style.display = "none";
        if (formProfessor) formProfessor.style.display = "none";

        if (selectTipo.value === "aluno") {
          formAluno && (formAluno.style.display = "block");
        } else if (selectTipo.value === "professor") {
          formProfessor && (formProfessor.style.display = "block");
        }
      });
    }

    // Capturar o formulário de cadastro
    
    formCadastro.addEventListener("submit", async (e) => {
    e.preventDefault(); // evitar reload da página

    // Pegar dados do formulário
    const formData = new FormData(formCadastro);
    const data = Object.fromEntries(formData.entries());

    // Verificar se senhas conferem
    if (data.senha !== data.confirmarSenha) {
      alert("As senhas não conferem!");
      return;
    }
    let payload = {
      tipo: data.tipo,
      senha: data.senha
    };

    if (data.tipo === "aluno") {
      payload.nome = data.nome;
      payload.email = data.email;
      payload.matricula = data.matricula;
      payload.telefone = data.telefone;
    } else if (data.tipo === "professor") {
      payload.nome = data.nomep;
      payload.email = data.emailp;
      payload.cpf = data.cpfp;
      payload.siape = data.siapep;
      payload.telefone = data.telefonep;
    }


    try {
      // Enviar para o backend
      const response = await fetch("http://localhost:3000/auth/self-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

    const result = await response.json();

    if (response.ok) {
      alert("Cadastro realizado com sucesso!");
      console.log("Novo usuário:", result);
      // aqui você pode redirecionar para login
      window.location.href = "login.html";
    } else {
      alert("Erro: " + result.error);
    }
    }catch (err) {
    console.error("Erro de rede:", err);
    alert("Não foi possível conectar ao servidor.");
    }
});


// === Integração do login com o backend ===
if (formLogin) {
  formLogin.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(formLogin);
    const data = Object.fromEntries(formData.entries());
    const email = data.email?.trim();
    const senha = data.senha;

    if (!email || !senha) {
      alert("Preencha e-mail e senha.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
      });

      const result = await res.json();

      if (!res.ok) {
        // mostra mensagem de erro retornada pelo servidor
        alert(result.error || "Falha no login");
        return;
      }

      // sucesso: salva token e info do usuário (simples)
      if (result.token) {
        localStorage.setItem("token", result.token);
      }
      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user));
      }

      alert("Login realizado com sucesso!");//tirar depois... e colocar uma transição
      // redireciona para a página do menu (ajuste o nome do arquivo se necessário)
      window.location.href = "pages/menu.html";

    } catch (err) {
      console.error("Erro ao conectar ao servidor:", err);
      alert("Não foi possível conectar ao servidor.");
    }
  });
}

});
