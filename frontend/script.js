// A lista de setores ainda é útil para popularmos o filtro de busca
const mockSectors = ["Agronegócio", "Artesanato", "Bioeconomia", "Indústria Madeireira", "Piscicultura"];

// Função para buscar a lista de empresas da API e renderizar os cards
function renderCompanyCards() {
    const gridContainer = document.querySelector(".results-grid");
    if (!gridContainer) return;

    // Busca os dados da nossa API Django
    fetch('/api/empresas/')
        .then(response => response.json())
        .then(empresas => {
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
                const cardHTML = `
                    <div class="company-card">
                        <div class="company-card-logo-placeholder">${company.nome_fantasia}</div>
                        <h3>${company.nome_fantasia}</h3>
                        <p>${company.descricao || 'Descrição não disponível.'}</p>
                        <a href="/empresa/?id=${company.id}" class="cta-button">Ver Vitrine</a>
                    </div>
                `;
                gridContainer.innerHTML += cardHTML;
            });
        });
}

// Função para buscar os dados de uma empresa específica e preencher a página de detalhes
function renderCompanyDetails() {
    const companyNameElement = document.getElementById("company-name");
    if (!companyNameElement) return;

    const urlParams = new URLSearchParams(window.location.search);
    const companyId = urlParams.get('id');

    if (!companyId) {
        companyNameElement.textContent = "ID da empresa não fornecido.";
        return;
    }

    fetch(`/api/empresas/${companyId}/`)
        .then(response => {
            if (!response.ok) throw new Error('Empresa não encontrada');
            return response.json();
        })
        .then(company => {
            companyNameElement.textContent = company.nome_fantasia;
            document.getElementById("company-location").textContent = company.contatos;
            document.getElementById("company-description").textContent = company.descricao;
            document.getElementById("company-logo").textContent = company.nome_fantasia;
        })
        .catch(error => {
            companyNameElement.textContent = "Empresa não encontrada";
        });
}

// Função para lidar com o formulário de registo, enviando para a API
function handleRegistration() {
    const form = document.getElementById("registration-form");
    if (!form) {
        // ---- OUTRA LINHA DE DEBUG ADICIONADA ----
        return;
    }

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        const csrfToken = form.querySelector('[name=csrfmiddlewaretoken]').value;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.username = data.email;

        fetch('/api/empresas/register/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) return response.json();
            throw new Error('Falha no registo.');
        })
        .then(data => {
            alert("Registo realizado com sucesso! Pode agora fazer o login.");
            window.location.href = "/login/";
        })
        .catch(error => {
            alert("Ocorreu um erro no registo. Verifique os dados e tente novamente.");
        });
    });
}

// Função para lidar com o formulário de login, enviando para a API
function handleLogin() {
    const form = document.getElementById("login-form");
    if (!form) return;

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        const csrfToken = form.querySelector('[name=csrfmiddlewaretoken]').value;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        data.username = data.email;

        fetch('/api/empresas/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (response.ok) return response.json();
            throw new Error('Falha no login.');
        })
        .then(data => {
            localStorage.setItem('authToken', data.token);
            const user = { email: data.email, id: data.user_id, nome: data.nome };
            localStorage.setItem("registeredUser", JSON.stringify(user));
            alert("Login realizado com sucesso!");
            window.location.href = "/dashboard/";
        })
        .catch(error => {
            alert("E-mail ou senha incorretos.");
        });
    });
}

// Função para verificar se o utilizador está logado e proteger páginas
function handleAuthentication() {
    const isDashboardPage = document.body.classList.contains("dashboard-page");
    const token = localStorage.getItem("authToken");

    if (isDashboardPage && !token) {
        alert("Você precisa estar logado para acessar esta página.");
        window.location.href = "/login/";
        return;
    }
    
    if (isDashboardPage && token) {
        const userString = localStorage.getItem("registeredUser");
        if (userString) {
            const user = JSON.parse(userString);
            const welcomeElement = document.getElementById("welcome-message");
            if (welcomeElement && user.nome) {
                welcomeElement.textContent = `Bem-vindo de volta, ${user.nome}!`;
            }
        }
    }

    const logoutButton = document.querySelector(".nav-item.logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", function(event) {
            event.preventDefault();
            localStorage.removeItem("registeredUser");
            localStorage.removeItem("authToken");
            alert("Você saiu da sua conta.");
            window.location.href = "/";
        });
    }
}

// Função para popular e ATUALIZAR o formulário de perfil
// Função para popular E ATUALIZAR o formulário de perfil
function populateProfileForm() {
    const form = document.getElementById("perfil-form");
    if (!form) return; // Só executa se estivermos na página de perfil

    const token = localStorage.getItem('authToken');
    if (!token) {
        // Se não houver token, não podemos fazer nada, a função de autenticação já deve ter redirecionado
        return;
    }

    // --- PARTE 1: BUSCAR E PREENCHER OS DADOS ---
    fetch('/api/empresas/my-empresa/', {
        method: 'GET',
        headers: {
            'Authorization': `Token ${token}`
        }
    })
    .then(response => {
        if (!response.ok) {
            console.warn("Utilizador logado não tem um perfil de empresa associado.");
            return Promise.reject('Sem perfil de empresa.');
        }
        return response.json();
    })
    .then(data => {
        // Preenche os campos do formulário com os dados recebidos da API
        form.querySelector('[name="nome_fantasia"]').value = data.nome_fantasia || '';
        form.querySelector('[name="descricao"]').value = data.descricao || '';
        form.querySelector('[name="razao_social"]').value = data.razao_social || '-';
        form.querySelector('[name="cnpj"]').value = data.cnpj || '-';
    })
    .catch(error => console.error("Aviso ao popular perfil:", error));

    // --- PARTE 2: ENVIAR AS ATUALIZAÇÕES AO CLICAR EM "SALVAR" ---
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        // Pega o token CSRF do input escondido que o Django criou
        const csrfToken = form.querySelector('[name=csrfmiddlewaretoken]').value;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        fetch('/api/empresas/my-empresa/', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
                'X-CSRFToken': csrfToken // O código de segurança
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Falha ao atualizar o perfil.');
            }
            return response.json();
        })
        .then(updatedData => {
            alert('Perfil atualizado com sucesso!');
        })
        .catch(error => {
            alert('Ocorreu um erro ao atualizar o perfil.');
        });
    });
}

// Função para popular os filtros de busca
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

// Função para lidar com o envio do formulário de busca
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

// Evento principal que "orquestra" tudo
document.addEventListener("DOMContentLoaded", function() {
    handleAuthentication();
    renderCompanyCards();
    renderCompanyDetails();
    handleRegistration();
    handleLogin();
    populateFilters();
    handleSearchForm();
    populateProfileForm();
});