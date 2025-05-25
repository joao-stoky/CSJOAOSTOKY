document.addEventListener("DOMContentLoaded", function () {
    const inputFiltro = document.getElementById("filtro-empresa");
    const sugestoesDiv = document.getElementById("sugestoes");
    const tabela = document.getElementById("tabela-dados");
    const thead = tabela.querySelector("thead");
    const tbody = tabela.querySelector("tbody");

    // Colunas da planilha principal para mostrar na tabela
    const colunasParaMostrar = [0, 1, 2, 3, 14, 15, 16, 27, 28];
    // Colunas específicas do HealthScore para mostrar
    const colunasHealthScore = [7]; // ajustar conforme necessário
    // Colunas específicas do GMV para mostrar (índice 8)
    const colunasGMV = [3, 4, 5, 8];

    let dados = [];
    let healthScoreMap = {}; // chave: nome da empresa, valor: dados HealthScore
    let gmvMap = {}; // chave: nome da empresa, valor: dados GMV
    let nomesEmpresas = [];

    // URLs CSV - ajuste os GIDs se precisar
    const urlPrincipal = "https://docs.google.com/spreadsheets/d/1pYSHTPWFmJRxBCFkqWGeCSrGFFxBvk2KHPv2ZqhDhZI/export?format=csv";
    const urlHealthScore = "https://docs.google.com/spreadsheets/d/1pYSHTPWFmJRxBCFkqWGeCSrGFFxBvk2KHPv2ZqhDhZI/export?format=csv&gid=1835294483";
    const urlGMV = "https://docs.google.com/spreadsheets/d/1pYSHTPWFmJRxBCFkqWGeCSrGFFxBvk2KHPv2ZqhDhZI/export?format=csv&gid=453852044";

    Promise.all([
        fetch(urlPrincipal).then(res => res.text()),
        fetch(urlHealthScore).then(res => res.text()),
        fetch(urlGMV).then(res => res.text())
    ])
        .then(([csvPrincipal, csvHealth, csvGMV]) => {
            // Processar HEALTH SCORE
            const linhasHealth = csvHealth.trim().split("\n").map(l => l.split(",").map(c => c.replace(/"/g, "")));
            for (let i = 1; i < linhasHealth.length; i++) {
                const nomeEmpresa = linhasHealth[i][1];
                healthScoreMap[nomeEmpresa] = linhasHealth[i];
            }

            // Processar GMV
            const linhasGMV = csvGMV.trim().split("\n").map(l => l.split(",").map(c => c.replace(/"/g, "")));
            for (let i = 1; i < linhasGMV.length; i++) {
                const nomeEmpresa = linhasGMV[i][1];
                gmvMap[nomeEmpresa] = linhasGMV[i];
            }

            // Processar planilha principal
            const linhas = csvPrincipal.trim().split("\n");
            dados = linhas.map(linha => linha.split(",").map(c => c.replace(/"/g, "")));

            // Montar cabeçalho
            thead.innerHTML = "";
            const thRow = document.createElement("tr");

            // Cabeçalhos planilha principal
            dados[0].forEach((cabecalho, index) => {
                if (colunasParaMostrar.includes(index)) {
                    const th = document.createElement("th");
                    th.textContent = cabecalho;
                    thRow.appendChild(th);
                }
            });

            // Cabeçalhos HealthScore
            const colunasHealthCabecalho = linhasHealth[0];
            colunasHealthScore.forEach(index => {
                const th = document.createElement("th");
                th.textContent = colunasHealthCabecalho[index];
                thRow.appendChild(th);
            });

            // Cabeçalhos GMV
            const colunasGMVCabecalho = linhasGMV[0];
            colunasGMV.forEach(index => {
                const th = document.createElement("th");
                th.textContent = colunasGMVCabecalho[index];
                thRow.appendChild(th);
            });

            thead.appendChild(thRow);

            nomesEmpresas = [...new Set(dados.slice(1).map(linha => linha[1]))];
            renderizarTabela(dados.slice(1));
        })
        .catch(error => {
            console.error("Erro ao carregar CSVs:", error);
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

            // Tornar a linha clicável
            tr.style.cursor = "pointer";
            const nomeEmpresa = colunas[1];
            tr.addEventListener("click", () => {
                const url = `pagina2.html?empresa=${encodeURIComponent(nomeEmpresa)}`;
                window.location.href = url;
            });

            // Colunas planilha principal
            colunas.forEach((coluna, index) => {
                if (colunasParaMostrar.includes(index)) {
                    const td = document.createElement("td");
                    td.textContent = coluna;
                    tr.appendChild(td);
                }
            });

            // HealthScore + GMV (se houver)
            const dadosHS = healthScoreMap[nomeEmpresa];
            if (dadosHS) {
                colunasHealthScore.forEach(index => {
                    const td = document.createElement("td");
                    const valor = (dadosHS[index] || "").trim().toUpperCase();
                    td.textContent = valor;
                    if (valor === "SUBIU") {
                        td.style.backgroundColor = "#c8e6c9";
                        td.style.color = "#2e7d32";
                        td.style.fontWeight = "bold";
                    } else if (valor === "CAIU") {
                        td.style.backgroundColor = "#ffcdd2";
                        td.style.color = "#c62828";
                        td.style.fontWeight = "bold";
                    }
                    tr.appendChild(td);
                });
            }

            const dadosGMV = gmvMap[nomeEmpresa];
            if (dadosGMV) {
                colunasGMV.forEach(index => {
                    const td = document.createElement("td");
                    const valor = dadosGMV[index] || "";
                    td.textContent = valor;

                    if (index === 8) {
                        const valUpper = valor.toString().trim().toUpperCase();
                        if (valUpper === "SIM") {
                            td.style.backgroundColor = "#004d00";
                            td.style.color = "white";
                            td.style.fontWeight = "bold";
                        } else if (valUpper === "QUASE") {
                            td.style.backgroundColor = "#fff176";
                            td.style.color = "#555";
                            td.style.fontWeight = "bold";
                        }
                    }

                    tr.appendChild(td);
                });
            }

            tbody.appendChild(tr);
        });
    }


    document.addEventListener("click", function (event) {
        if (!sugestoesDiv.contains(event.target) && event.target !== inputFiltro) {
            sugestoesDiv.innerHTML = "";
        }
    });


});
