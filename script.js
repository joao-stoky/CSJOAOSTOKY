document.addEventListener("DOMContentLoaded", function () {
    const inputFiltro = document.getElementById("filtro-empresa");
    const sugestoesDiv = document.getElementById("sugestoes");
    const tabela = document.getElementById("tabela-dados");
    const thead = tabela.querySelector("thead");
    const tbody = tabela.querySelector("tbody");

    const colunasParaMostrar = [0, 1, 14, 15, 16, 25, 30, 31, 32, 33, 34]; // Índices das colunas que você quer mostrar
    let dados = [];
    let nomesEmpresas = [];

    fetch("https://docs.google.com/spreadsheets/d/1pYSHTPWFmJRxBCFkqWGeCSrGFFxBvk2KHPv2ZqhDhZI/export?format=csv")
        .then(response => response.text())
        .then(csv => {
            const linhas = csv.trim().split("\n");

            dados = linhas.map(linha => linha.split(",").map(c => c.replace(/"/g, "")));

            // Renderiza cabeçalho
            thead.innerHTML = "";
            const thRow = document.createElement("tr");
            dados[0].forEach((cabecalho, index) => {
                if (colunasParaMostrar.includes(index)) {
                    const th = document.createElement("th");
                    th.textContent = cabecalho;
                    thRow.appendChild(th);
                }
            });
            thead.appendChild(thRow);

            // Cria uma lista única de nomes de empresas
            nomesEmpresas = [...new Set(dados.slice(1).map(linha => linha[1]))];
            renderizarTabela(dados.slice(1));
        })
        .catch(error => {
            console.error("Erro ao carregar o CSV:", error);
        });

    inputFiltro.addEventListener("input", function () {
        const termo = inputFiltro.value.toLowerCase();
        sugestoesDiv.innerHTML = "";

        if (termo.length === 0) {
            renderizarTabela(dados.slice(1));
            return;
        }

        const filtrados = nomesEmpresas.filter(nome =>
            nome.toLowerCase().includes(termo)
        );

        filtrados.forEach(nome => {
            const sugestao = document.createElement("div");
            sugestao.textContent = nome;
            sugestao.classList.add("sugestao-item");

            sugestao.addEventListener("click", () => {
                const url = `pagina2.html?empresa=${encodeURIComponent(nome)}`;
                window.location.href = url;
            });

            sugestoesDiv.appendChild(sugestao);
        });

        filtrarTabela(termo);
    });

    function filtrarTabela(termo) {
        const dadosFiltrados = dados.slice(1).filter(linha =>
            linha[1].toLowerCase().includes(termo.toLowerCase())
        );
        renderizarTabela(dadosFiltrados);
    }

    function renderizarTabela(linhas) {
        tbody.innerHTML = "";
        linhas.forEach(colunas => {
            const tr = document.createElement("tr");
            colunas.forEach((coluna, index) => {
                if (colunasParaMostrar.includes(index)) {
                    const td = document.createElement("td");
                    td.textContent = coluna;

                    // Se for a coluna "HEALTH SCORE STATUS" (índice 29)
                    if (index === 30) {
                        if (coluna.trim().toUpperCase() === "CAIU") {
                            td.style.backgroundColor = "#ff4d4d"; // vermelho
                            td.style.color = "#fff";
                            td.style.fontWeight = "bold";
                        } else if (coluna.trim().toUpperCase() === "SUBIU") {
                            td.style.backgroundColor = "#28a745"; // verde
                            td.style.color = "#fff";
                            td.style.fontWeight = "bold";
                        }
                    }

                    tr.appendChild(td);
                }
            });
            tbody.appendChild(tr);
        });
    }

    // Adiciona o evento de clique para fechar as sugestões ao clicar fora
    document.addEventListener("click", function (event) {
        if (!sugestoesDiv.contains(event.target) && event.target !== inputFiltro) {
            sugestoesDiv.innerHTML = "";
        }
    });
});
