console.log("VERSÃO NOVA DO SCRIPT CARREGADA - " + new Date());

const mockSectors = ["Agronegócio", "Artesanato", "Bioeconomia", "Indústria Madeireira", "Piscicultura"];

function renderCompanyCards() {
    const gridContainer = document.querySelector(".results-grid");
    if (!gridContainer) return;

    // 1. VAI ATÉ A NOSSA API BUSCAR OS DADOS REAIS
    fetch('/api/empresas/')
        .then(response => response.json()) // Pega a resposta e a traduz de JSON
        .then(empresas => { // Agora 'empresas' é a lista que veio do nosso back-end

            // O resto da lógica é quase o mesmo de antes, mas usando a lista 'empresas'
            const urlParams = new URLSearchParams(window.location.search);
            const sectorFilter = urlParams.get('setor');

            let companiesToRender = empresas;

            if (sectorFilter) {
                companiesToRender = empresas.filter(company => company.setor === sectorFilter);
            }

            gridContainer.innerHTML = ""; // Limpa a grade

            if (companiesToRender.length === 0) {
                gridContainer.innerHTML = "<p>Nenhuma empresa encontrada para este filtro.</p>";
                return;
            }

            companiesToRender.forEach(company => {
                // O nome dos campos (ex: company.nome_fantasia) deve ser igual ao do nosso Model em models.py
                const cardHTML = `
                    <div class="company-card">
                        <div class="company-card-logo-placeholder">${company.nome_fantasia}</div>
                        <h3>${company.nome_fantasia}</h3>
                        <p>${company.descricao}</p>
                        <a href="/empresa/?id=${company.id}" class="cta-button">Ver Vitrine</a>
                    </div>
                `;
                gridContainer.innerHTML += cardHTML;
            });
        });
}

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

function handleRegistration() {
    const form = document.getElementById("registration-form");
    if (!form) return;
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        const senhaInput = document.getElementById("senha");
        const confirmaSenhaInput = document.getElementById("confirma-senha");
        const senha = senhaInput.value;
        const confirmaSenha = confirmaSenhaInput.value;
        let isValid = true;
        
        if (senha.length < 8) {
            isValid = false;
            showError(senhaInput, "A senha deve ter no mínimo 8 caracteres.");
        } else {
            clearError(senhaInput);
        }
        if (senha !== confirmaSenha) {
            isValid = false;
            showError(confirmaSenhaInput, "As senhas não coincidem.");
        } else {
            clearError(confirmaSenhaInput);
        }

        if (isValid) {
            const responsavel = document.getElementById("responsavel").value;
            const email = document.getElementById("email").value;
            const user = { nome: responsavel, email: email };
            localStorage.setItem("registeredUser", JSON.stringify(user));
            alert("Registro realizado com sucesso! Agora você pode fazer o login.");
            window.location.href = "/login/";
        }
    });

    const showError = (inputElement, message) => {
        inputElement.classList.add("error");
        const errorElement = inputElement.nextElementSibling;
        errorElement.textContent = message;
    };

    const clearError = (inputElement) => {
        inputElement.classList.remove("error");
        const errorElement = inputElement.nextElementSibling;
        errorElement.textContent = "";
    };
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