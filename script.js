const mockCompanies = [
    {
        id: 1,
        nome: "Grãos do Norte",
        descricao: "Especialistas na produção e exportação de soja e milho de alta qualidade.",
        logoPlaceholder: "Grãos do Norte"
    },
    {
        id: 2,
        nome: "Madeiras de Roraima",
        descricao: "Manejo sustentável e fornecimento de madeira certificada para o mercado global.",
        logoPlaceholder: "Madeiras RR"
    },
    {
        id: 3,
        nome: "Frutas Tropicais da Amazônia",
        descricao: "Polpas de frutas exóticas e frescas, como açaí, cupuaçu e buriti.",
        logoPlaceholder: "Frutas Tropicais"
    },
    {
        id: 4,
        nome: "Couro & Artesanato Roraimense",
        descricao: "Artigos de couro e artesanato com design único da cultura local.",
        logoPlaceholder: "Artesanato RR"
    },
    {
        id: 5,
        nome: "Castanhas do Monte Roraima",
        descricao: "Produção e beneficiamento de castanha-do-pará com foco em qualidade.",
        logoPlaceholder: "Castanhas"
    },
    {
        id: 6,
        nome: "Pescados do Rio Branco",
        descricao: "Fornecimento de peixes de água doce para os mercados nacional e internacional.",
        logoPlaceholder: "Pescados"
    }
];

// Função para renderizar (desenhar) os cards das empresas
function renderCompanyCards() {
    // 1. Encontra o container da grade de resultados na página
    const gridContainer = document.querySelector(".results-grid");

    // 2. Se não encontrar o container (estamos em outra página), não faz nada
    if (!gridContainer) {
        return;
    }
    
    // 3. Limpa qualquer conteúdo que já exista lá
    gridContainer.innerHTML = "";

    // 4. Para cada empresa na nossa lista de dados...
    mockCompanies.forEach(company => {
        // 5. ...cria o HTML do card usando os dados da empresa
        const cardHTML = `
            <div class="company-card">
                <div class.company-card-logo-placeholder">${company.logoPlaceholder}</div>
                <h3>${company.nome}</h3>
                <p>${company.descricao}</p>
                <a href="empresa.html?id=${company.id}" class="cta-button">Ver Vitrine</a>
            </div>
        `;
        // 6. ...e insere o HTML do novo card dentro do container da grade
        gridContainer.innerHTML += cardHTML;
    });
}


// Espera o documento HTML ser completamente carregado para executar o script
document.addEventListener("DOMContentLoaded", function() {
    const loadComponent = (filePath, elementSelector) => {
        fetch(filePath)
            .then(response => response.text())
            .then(data => {
                document.querySelector(elementSelector).innerHTML = data;
            });
    };

    // Carrega o cabeçalho e o rodapé
    loadComponent("header.html", "header");
    loadComponent("footer.html", "footer");

    // Chama a nova função para criar os cards
    renderCompanyCards();
});