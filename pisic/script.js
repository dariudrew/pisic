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
});
