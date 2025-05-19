document.addEventListener("DOMContentLoaded", function () {
  const urlTarifasExtras = "https://docs.google.com/spreadsheets/d/1pYSHTPWFmJRxBCFkqWGeCSrGFFxBvk2KHPv2ZqhDhZI/export?format=csv&gid=974706817";

  fetch(urlTarifasExtras)
    .then(res => res.text())
    .then(csv => {
      const linhas = csv.trim().split("\n").map(l => l.split(",").map(c => c.replace(/"/g, "")));
      const cabecalhos = linhas[0];
      const dados = linhas.slice(1);
      renderizarTabela(cabecalhos, dados);
    })
    .catch(err => {
      document.getElementById("dashboard").innerHTML = `<p style="color:red;">Erro ao carregar os dados: ${err}</p>`;
    });

  function renderizarTabela(cabecalhos, dados) {
    const container = document.getElementById("dashboard");
    const tabela = document.createElement("table");
    tabela.classList.add("tabela-tarifas");

    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    cabecalhos.forEach(texto => {
      const th = document.createElement("th");
      th.textContent = texto;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    tabela.appendChild(thead);

    const tbody = document.createElement("tbody");
    dados.forEach(linha => {
      const tr = document.createElement("tr");
      linha.forEach(celula => {
        const td = document.createElement("td");
        td.textContent = celula;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });

    tabela.appendChild(tbody);
    container.appendChild(tabela);
  }

  // Tema escuro
  const btnTema = document.getElementById("btnTema");
  btnTema.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("tema", document.body.classList.contains("dark") ? "dark" : "light");
  });

  if (localStorage.getItem("tema") === "dark") {
    document.body.classList.add("dark");
  }
});
