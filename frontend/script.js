console.log("VERSÃO DEFINITIVA DO SCRIPT CARREGADA - " + new Date());

const mockCompanies = [
    { id: 1, nome: "Grãos do Norte", descricao: "Especialistas na produção e exportação de soja e milho de alta qualidade.", logoPlaceholder: "Grãos do Norte", localidade: "Boa Vista, RR", setor: "Agronegócio" },
    { id: 2, nome: "Madeiras de Roraima", descricao: "Manejo sustentável e fornecimento de madeira certificada para o mercado global.", logoPlaceholder: "Madeiras RR", localidade: "Rorainópolis, RR", setor: "Indústria Madeireira" },
    { id: 3, nome: "Frutas Tropicais da Amazônia", descricao: "Polpas de frutas exóticas e frescas, como açaí, cupuaçu e buriti.", logoPlaceholder: "Frutas Tropicais", localidade: "Caracaraí, RR", setor: "Bioeconomia" },
    { id: 4, nome: "Couro & Artesanato Roraimense", descricao: "Artigos de couro e artesanato com design único da cultura local.", logoPlaceholder: "Artesanato RR", localidade: "Boa Vista, RR", setor: "Artesanato" },
    { id: 5, nome: "Castanhas do Monte Roraima", descricao: "Produção e beneficiamento de castanha-do-pará com foco em qualidade.", logoPlaceholder: "Castanhas", localidade: "Pacaraima, RR", setor: "Agronegócio" },
    { id: 6, nome: "Pescados do Rio Branco", descricao: "Fornecimento de peixes de água doce para os mercados nacional e internacional.", logoPlaceholder: "Pescados", localidade: "Caracaraí, RR", setor: "Piscicultura" }
];

const mockSectors = ["Agronegócio", "Artesanato", "Bioeconomia", "Indústria Madeireira", "Piscicultura"];

function renderCompanyCards() {
    const gridContainer = document.querySelector(".results-grid");
    if (!gridContainer) return;
    const urlParams = new URLSearchParams(window.location.search);
    const sectorFilter = urlParams.get('setor');
    let companiesToRender = mockCompanies;
    if (sectorFilter) {
        companiesToRender = mockCompanies.filter(company => company.setor === sectorFilter);
    }
    gridContainer.innerHTML = "";
    if (companiesToRender.length === 0) {
        gridContainer.innerHTML = "<p>Nenhuma empresa encontrada para este filtro.</p>";
        return;
    }
    companiesToRender.forEach(company => {
        const cardHTML = `
            <div class="company-card">
                <div class="company-card-logo-placeholder">${company.logoPlaceholder}</div>
                <h3>${company.nome}</h3>
                <p>${company.descricao}</p>
                <a href="/empresa/?id=${company.id}" class="cta-button">Ver Vitrine</a>
            </div>
        `;
        gridContainer.innerHTML += cardHTML;
    });
}

function renderCompanyDetails() {
    const companyNameElement = document.getElementById("company-name");
    // 1. Verifica se estamos na página certa
    if (!companyNameElement) return;

    // 2. Pega o ID da empresa a partir do parâmetro na URL
    const urlParams = new URLSearchParams(window.location.search);
    const companyId = urlParams.get('id');

    // Se não houver ID na URL, mostra uma mensagem e para.
    if (!companyId) {
        companyNameElement.textContent = "ID da empresa não fornecido.";
        return;
    }

    // 3. FAZ O PEDIDO À NOSSA API DE DETALHE
    fetch(`/api/empresas/${companyId}/`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Empresa não encontrada');
            }
            return response.json(); // Pega a resposta e traduz de JSON
        })
        .then(company => { // Agora 'company' é o objeto com os dados reais da empresa
            // 4. Preenche a página com os dados que vieram da API
            // (Os nomes dos campos devem ser iguais aos do nosso Model em models.py)
            companyNameElement.textContent = company.nome_fantasia;
            document.getElementById("company-location").textContent = company.contatos; // Usando contatos como localidade por enquanto
            document.getElementById("company-description").textContent = company.descricao;
            document.getElementById("company-logo").textContent = company.nome_fantasia; // Usando nome fantasia como placeholder
        })
        .catch(error => {
            // Em caso de erro (ex: empresa não encontrada), mostra uma mensagem
            console.error('Erro ao buscar detalhes da empresa:', error);
            companyNameElement.textContent = "Empresa não encontrada";
        });
}

function handleRegistration() {
    const form = document.getElementById("registration-form");
    if (!form) return;

    form.addEventListener("submit", function(event) {
        event.preventDefault(); // Impede o envio padrão

        // Coleta todos os dados do formulário
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Adiciona o username, que pode ser o mesmo que o e-mail
        data.username = data.email;

        // Envia os dados para a API do Django
        fetch('/api/empresas/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            // Se houver erro, rejeita a promessa para cair no .catch()
            throw new Error('Falha no registro.');
        })
        .then(data => {
            // Sucesso!
            alert("Registro realizado com sucesso! Agora você pode fazer o login.");
            window.location.href = "/login/";
        })
        .catch(error => {
            // Erro!
            console.error('Erro:', error);
            alert("Ocorreu um erro no registro. Verifique os dados e tente novamente.");
        });
    });
}

function handleLogin() {
    const form = document.getElementById("login-form");
    if (!form) return;
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        const storedUserString = localStorage.getItem("registeredUser");
        if (!storedUserString) {
            alert("Nenhum usuário registrado. Por favor, registre-se primeiro.");
            return;
        }
        const storedUser = JSON.parse(storedUserString);
        const email = document.getElementById("email").value;
        if (email === storedUser.email) {
            alert("Login realizado com sucesso!");
            window.location.href = "/dashboard/";
        } else {
            alert("E-mail ou senha incorretos.");
        }
    });
}

function handleAuthentication() {
    const isDashboardPage = document.body.classList.contains("dashboard-page");
    const storedUserString = localStorage.getItem("registeredUser");
    if (isDashboardPage) {
        if (!storedUserString) {
            alert("Você precisa estar logado para acessar esta página.");
            window.location.href = "/login/";
            return;
        } else {
            const user = JSON.parse(storedUserString);
            const welcomeElement = document.getElementById("welcome-message");
            if (welcomeElement && user) {
                welcomeElement.textContent = `Bem-vindo de volta, ${user.nome}!`;
            }
        }
    }
    const logoutButton = document.querySelector(".nav-item.logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", function(event) {
            event.preventDefault();
            localStorage.removeItem("registeredUser");
            alert("Você saiu da sua conta.");
            window.location.href = "/";
        });
    }
}

function populateFilters() {
    const sectorSelect = document.getElementById("setor");
    if (!sectorSelect) return;
    mockSectors.forEach(sector => {
        const option = document.createElement("option");
        option.value = sector;
        option.textContent = sector;
        sectorSelect.appendChild(option);
    });
}

function handleSearchForm() {
    const form = document.getElementById("search-form");
    if (!form) return;
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        const sectorValue = document.getElementById("setor").value;
        if (sectorValue) {
            window.location.href = `/resultados/?setor=${encodeURIComponent(sectorValue)}`;
        } else {
            window.location.href = "/resultados/";
        }
    });
}

document.addEventListener("DOMContentLoaded", function() {
    handleAuthentication();
    renderCompanyCards();
    renderCompanyDetails();
    handleRegistration();
    handleLogin();
    populateFilters();
    handleSearchForm();
});