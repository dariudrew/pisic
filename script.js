document.addEventListener("DOMContentLoaded", () => {
  const main = document.querySelector(".main");
  const telaDir = document.querySelector(".tela-dir");

  const toCadastro = document.getElementById("to-cadastro");
  const toLogin = document.getElementById("to-login"); // link dentro do cadastro


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


    // Função que ativa grupo de inputs baseado no tipo selecionado
    function atualizarCamposPorTipo() {
      const tipo = selectTipo.value;


      // Esconde todos os grupos e remove "required"
      document.querySelectorAll(".form-oculto").forEach(grupo => {
        grupo.style.display = "none";
        grupo.querySelectorAll("input").forEach(input => input.required = false);
        grupo.querySelectorAll("input").forEach(input => input.value = "");
      });

      // Mostra e ativa o grupo do tipo selecionado
      const grupoAtivo = document.getElementById(`form-${tipo}`);
      if (grupoAtivo) {
        grupoAtivo.style.display = "block";
        grupoAtivo.querySelectorAll("input").forEach(input => input.required = true);
      }
    }

    toCadastro.addEventListener("click", abrirCadastro);
    toLogin.addEventListener("click", abrirLogin);

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

  // listener para o select tipo: aqui ele mostra o form conforme o tipo selecionado e esconde os outros
    selectTipo.addEventListener("change", atualizarCamposPorTipo);

    // Capturar o formulário de cadastro
  // marca o form para não usar validação nativa
  if (formCadastro) formCadastro.setAttribute("novalidate", "true");

 //guarda o estado inicial de 'required' de cada input (pra recuperar depois)
  const allInputs = formCadastro ? Array.from(formCadastro.querySelectorAll("input, select, textarea")) : [];
  allInputs.forEach(i => i.dataset.initialRequired = i.required ? "1" : "0");

  // helper visibilidade
  function isVisible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }

// função que ativa o grupo correto e desativa o outro
  function setTipoAtivo(tipo) {
    const grupos = { aluno: formAluno, professor: formProfessor };
    Object.keys(grupos).forEach(key => {
      const g = grupos[key];
      if (!g) return;
      const inputs = Array.from(g.querySelectorAll("input, select, textarea"));
      if (key === tipo) {
        g.style.display = "block";
        inputs.forEach(inp => {
          inp.disabled = false;
          inp.required = inp.dataset.initialRequired === "1"; // restaura required só se era required originalmente
        });
      } else {
        g.style.display = "none";
        inputs.forEach(inp => {
          inp.disabled = true;   // importante: disabled remove da validação automática
          inp.required = false;  // garantir que não bloqueie nossa validação manual
        });
      }
    });
  }

// inicializa estado (chame ao carregar)
if (selectTipo) {
  setTipoAtivo(selectTipo.value || "aluno");
  selectTipo.addEventListener("change", () => setTipoAtivo(selectTipo.value));
}

//validação manual e envio
if (formCadastro) {
  formCadastro.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("[Cadastro] submit recebido");

    // pega apenas inputs habilitados (não disabled)
    const enabledInputs = allInputs.filter(i => !i.disabled);

    // validar campos obrigatórios manualmente
    const emptyRequired = enabledInputs.find(i => i.required && String(i.value || "").trim() === "");
    if (emptyRequired) {
      // mensagem amigável: pega placeholder ou name
      const label = emptyRequired.placeholder || emptyRequired.name || "campo obrigatório";
      alert(`Preencha o campo: ${label}`);
      // foca só se visível e focável
      if (isVisible(emptyRequired) && typeof emptyRequired.focus === "function") {
        try { emptyRequired.focus(); } catch (err) { /* não fatal */ }
      }
      return;
    }

    // montar payload dependendo do tipo
    const formData = new FormData(formCadastro);
    const data = Object.fromEntries(formData.entries());
    // certifique-se que seus names estejam diferenciados (ex: nomeA / nomeP) — aqui assumimos nomes já únicos
    const tipo = data.tipo;

    // verificar senhas (nome dos campos pode variar conforme você ajustou)
    const senha = data.senha;
    const confirmarSenha = data.confirmarSenha;
    if (senha !== confirmarSenha) {
      alert("As senhas não conferem!");
      // tenta focar no campo de senha visível
      const senhaInput = enabledInputs.find(i => i.name === "senha" && isVisible(i));
      if (senhaInput) try { senhaInput.focus(); } catch (err) {}
      return;
    }

    // construir payload só com campos relevantes (ajuste nomes se necessário)
    const payload = { tipo};

    if (tipo === "aluno") {
      // ajuste os nomes conforme seu HTML (ex: nome, email, matricula, telefone)
      payload.nome = data.nome; 
      payload.email = data.email;
      payload.matricula = data.matricula || null;
      payload.telefone = data.telefone || null;
      payload.senha = data.senha;

    } else if (tipo === "professor") {
      payload.nome = data.nomep ? data.nomep : data.nomep; // caso tenha sufixo P
      payload.email = data.emailp ? data.emailp : data.emailp;
      payload.cpf = data.cpfp || data.cpfp || null;
      payload.siape = data.siapep || data.siapep || null;
      payload.telefone = data.telefonep || data.telefonep || null;
      payload.senha = data.senhap;
    } else {
      payload.nome = data.nome;
      payload.email = data.email;
    }

    console.log("[Cadastro] payload:", payload); //apagar depois pq aparece console

    // Enviar para o backend
    try {
      const response = await fetch("http://localhost:3000/auth/self-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (response.ok) {
        alert("Cadastro realizado com sucesso!");
        formCadastro.reset();
        // opcional: volta para tela de login
        // abrirLogin();
      } else {
        alert("Erro: " + (result.error || "Erro desconhecido"));
      }
    } catch (err) {
      console.error("[Cadastro] erro de rede:", err);
      alert("Não foi possível conectar ao servidor.");
    }
  });
}
});
