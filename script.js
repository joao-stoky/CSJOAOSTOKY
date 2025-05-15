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
                exibirDetalhesEmpresa(nome);
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



function exibirDetalhesEmpresa(nomeEmpresa) {
    document.querySelector(".dashboard").style.display = "none";
    const container = document.getElementById("detalhes-empresa");
    container.style.display = "block";
    container.innerHTML = `<a href="#" id="btn-voltar" style="color:#0072ff; font-weight:bold; text-decoration:none;">← Voltar para o menu</a><h1>${nomeEmpresa}</h1><div id="dashboard"></div>`;

    document.getElementById("btn-voltar").addEventListener("click", () => {
        container.style.display = "none";
        document.querySelector(".dashboard").style.display = "block";
    });

    const csvUrl1 = "https://docs.google.com/spreadsheets/d/1pYSHTPWFmJRxBCFkqWGeCSrGFFxBvk2KHPv2ZqhDhZI/export?format=csv&gid=1336444748";
    const csvUrl2 = "https://docs.google.com/spreadsheets/d/1pYSHTPWFmJRxBCFkqWGeCSrGFFxBvk2KHPv2ZqhDhZI/export?format=csv&gid=1842256029";

    function parseCSV(csv) {
        return csv.trim().split("\n").map(line => line.split(",").map(c => c.replace(/"/g, "").trim()));
    }

    Promise.all([fetch(csvUrl1).then(r => r.text()), fetch(csvUrl2).then(r => r.text())])
        .then(([csv1, csv2]) => {
            const linhas1 = parseCSV(csv1);
            const linhas2 = parseCSV(csv2);

            const cab1 = linhas1[0];
            const dados1 = linhas1.slice(1).find(row => row[1] === nomeEmpresa);

            const cab2 = linhas2[0];
            const dados2 = linhas2.slice(1).find(row => row[1] === nomeEmpresa);

            if (!dados1 && !dados2) {
                document.getElementById("dashboard").innerHTML = "<p style='color:red;'>Empresa não encontrada.</p>";
                return;
            }

            const dashboard = document.getElementById("dashboard");
            function criarBlocos(blocos, cabecalhos, dadosEmpresa) {
                blocos.forEach(bloco => {
                    const container = document.createElement("div");
                    container.className = "bloco";
            
                    if (bloco.titulo.trim() !== "") {
                        const titulo = document.createElement("h3");
                        titulo.textContent = bloco.titulo;
                        container.appendChild(titulo);
                    }
            
                    const grid = document.createElement("div");
                    grid.className = "grid";
            
                    bloco.indices.forEach(i => {
                        if (cabecalhos[i]) {
                            const cabecalho = cabecalhos[i];
                            const valor = dadosEmpresa[i];
            
                            const card = document.createElement("div");
                            card.className = "card";
            
                            const valorUpper = valor ? valor.toString().trim().toUpperCase() : "";
                            const cabecalhoUpper = cabecalho.trim().toUpperCase();
            
                            if (cabecalhoUpper === "HEALTH SCORE STATUS") {
                                if (valorUpper === "SUBIU") card.classList.add("subiu");
                                else if (valorUpper === "CAIU") card.classList.add("caiu");
                            }
            
                            if (i === 19) {
                                if (valorUpper === "DESCENTRALIZADO") card.classList.add("descentralizado");
                                else if (valorUpper === "CENTRALIZADO") card.classList.add("centralizado");
                            }
            
                            if (i === 24) {
                                if (valorUpper === "SIM") card.classList.add("sim");
                                else if (valorUpper === "NÃO") card.classList.add("nao");
                            }
            
                            if ([36, 37, 38, 39].includes(i)) {
                                if (valorUpper === "SIM") card.classList.add("sim2");
                                else if (valorUpper === "NÃO") card.classList.add("nao2");
                            }
            
                            // Se o valor parecer uma URL, transforma em link clicável
                            let valorHTML = valor;
                            if (valor && /^https?:\/\/.+/.test(valor)) {
                                valorHTML = `<a href="${valor}" target="_blank" rel="noopener noreferrer">${valor}</a>`;
                            } else {
                                valorHTML = valor || '';
                            }
            
                            card.innerHTML = `<h2>${cabecalho}</h2><p>${valorHTML}</p>`;
                            grid.appendChild(card);
                        }
                    });
            
                    container.appendChild(grid);
                    dashboard.appendChild(container);
                });
            }
            

            const blocos1 = [
                { titulo: "DADOS", indices: [0, 1, 2, 3, 7, 8, 9, 10] },
                { titulo: "INFORMAÇÕES RELEVANTES", indices: [24, 19] },
                { titulo: "CONTRATO", indices: [11, 12, 13, 18] },
                { titulo: "TRAVEL MANAGER", indices: [14, 15, 16, 17] },
                { titulo: "PRODUTOS ONFLY", indices: [20, 36, 21, 37, 22, 38, 23, 39] },
                { titulo: "HEALTH SCORE", indices: [30, 26, 27, 28] },
                { titulo: "GMV", indices: [6, 31, 32, 33, 34] },
                { titulo: "OPORTUNIDADES", indices: [6, 31, 32, 33, 34] },
            ];
            const blocos2 = [
                { titulo: "Bugs Mapeados", indices: [2, 3, 4, 5, 6] },
            ];

            if (dados1) criarBlocos(blocos1, cab1, dados1);
            if (dados2) criarBlocos(blocos2, cab2, dados2);
        })
        .catch(() => {
            document.getElementById("dashboard").innerHTML = "<p style='color:red;'>Erro ao carregar os dados.</p>";
        });
}
