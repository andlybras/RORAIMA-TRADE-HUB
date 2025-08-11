const mockCompanies = [
    { id: 1, nome: "Grãos do Norte", descricao: "Especialistas na produção e exportação de soja e milho de alta qualidade.", logoPlaceholder: "Grãos do Norte", localidade: "Boa Vista, RR" },
    { id: 2, nome: "Madeiras de Roraima", descricao: "Manejo sustentável e fornecimento de madeira certificada para o mercado global.", logoPlaceholder: "Madeiras RR", localidade: "Rorainópolis, RR" },
    { id: 3, nome: "Frutas Tropicais da Amazônia", descricao: "Polpas de frutas exóticas e frescas, como açaí, cupuaçu e buriti.", logoPlaceholder: "Frutas Tropicais", localidade: "Caracaraí, RR" },
    { id: 4, nome: "Couro & Artesanato Roraimense", descricao: "Artigos de couro e artesanato com design único da cultura local.", logoPlaceholder: "Artesanato RR", localidade: "Boa Vista, RR" },
    { id: 5, nome: "Castanhas do Monte Roraima", descricao: "Produção e beneficiamento de castanha-do-pará com foco em qualidade.", logoPlaceholder: "Castanhas", localidade: "Pacaraima, RR" },
    { id: 6, nome: "Pescados do Rio Branco", descricao: "Fornecimento de peixes de água doce para os mercados nacional e internacional.", logoPlaceholder: "Pescados", localidade: "Caracaraí, RR" }
];

function renderCompanyCards() {
    const gridContainer = document.querySelector(".results-grid");
    if (!gridContainer) return;
    gridContainer.innerHTML = "";
    mockCompanies.forEach(company => {
        const cardHTML = `
            <div class="company-card">
                <div class="company-card-logo-placeholder">${company.logoPlaceholder}</div>
                <h3>${company.nome}</h3>
                <p>${company.descricao}</p>
                <a href="empresa.html?id=${company.id}" class="cta-button">Ver Vitrine</a>
            </div>
        `;
        gridContainer.innerHTML += cardHTML;
    });
}

// Função que preenche a página de detalhes da empresa
function renderCompanyDetails() {
    const companyNameElement = document.getElementById("company-name");
    if (!companyNameElement) return;

    const urlParams = new URLSearchParams(window.location.search);
    const companyId = urlParams.get('id');

    const company = mockCompanies.find(c => c.id == companyId);

    if (!company) {
        companyNameElement.textContent = "Empresa não encontrada";
        return;
    }

    companyNameElement.textContent = company.nome;
    document.getElementById("company-location").textContent = company.localidade;
    document.getElementById("company-description").textContent = company.descricao;
    document.getElementById("company-logo").textContent = company.logoPlaceholder;
}

document.addEventListener("DOMContentLoaded", function() {
    const loadComponent = (filePath, elementSelector) => {
        fetch(filePath)
            .then(response => response.text())
            .then(data => {
                document.querySelector(elementSelector).innerHTML = data;
            })
            .then(() => {
                renderCompanyCards();
                renderCompanyDetails();
            });
    };

    loadComponent("header.html", "header");
    loadComponent("footer.html", "footer");
});