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

// Função para buscar e renderizar a lista de cursos
function renderCursosList() {
    const container = document.getElementById("cursos-list-container");
    if (!container) return;

    fetch('/api/cursos/')
        .then(response => response.json())
        .then(cursos => {
            if (cursos.length === 0) {
                container.innerHTML = "<p>Nenhum curso disponível no momento.</p>";
                return;
            }

            let html = '<div class="course-list">';
            cursos.forEach(curso => {
                html += `
                    <div class="course-card">
                        <h3>${curso.titulo}</h3>
                        <p>${curso.descricao}</p>
                        <a href="/cursos/${curso.id}/" class="cta-button">Ver Curso</a>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        });
}

// Função para buscar e renderizar a lista de produtos na página "Minha Vitrine"
// Função para buscar e renderizar a lista de produtos na página "Minha Vitrine"
// Função para buscar e renderizar a lista de produtos
function renderMyProducts() {
    const productListContainer = document.querySelector(".product-list");
    if (!productListContainer) return;
    const token = localStorage.getItem('authToken');
    if (!token) return;

    fetch('/api/empresas/produtos/', {
        headers: { 'Authorization': `Token ${token}` }
    })
    .then(response => response.json())
    .then(produtos => {
        productListContainer.innerHTML = "";
        if (produtos.length === 0) {
            productListContainer.innerHTML = "<p>Você ainda não tem produtos cadastrados.</p>";
            return;
        }
        produtos.forEach(produto => {
            const productHTML = `
                <div class="product-list-item">
                    <span class="product-name">${produto.nome}</span>
                    <span class="product-status ${produto.ativo ? 'status-active' : 'status-inactive'}">${produto.ativo ? 'Ativo' : 'Inativo'}</span>
                    <div class="product-actions">
                        <button class="action-btn edit-btn" data-id="${produto.id}">Editar</button>
                        <button class="action-btn-delete delete-btn" data-id="${produto.id}">Excluir</button>
                    </div>
                </div>
            `;
            productListContainer.innerHTML += productHTML;
        });
    });
}

// Função para lidar com a adição de um novo produto
// Função para lidar com a adição de um novo produto
function handleAddProduct() {
    const form = document.getElementById("add-product-form");
    if (!form) return;

    form.addEventListener('submit', function(event) {
        event.preventDefault();
        const token = localStorage.getItem('authToken');
        const csrfToken = form.querySelector('[name=csrfmiddlewaretoken]').value;
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        fetch('/api/empresas/produtos/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                // Se a resposta não for ok, lê o erro do corpo da resposta
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(newProduct => {
            alert('Produto adicionado com sucesso!');
            form.reset(); // Limpa o formulário
            renderMyProducts(); // Atualiza a lista de produtos na tela
        })
        .catch(error => {
            console.error('Erro:', error);
            // Exibe uma mensagem de erro mais detalhada, se disponível
            const errorMessage = error.detail || 'Ocorreu um erro ao adicionar o produto.';
            alert(errorMessage);
        });
    });
}

// Função para lidar com a Edição e Exclusão de produtos
function handleProductActions() {
    const productList = document.querySelector(".product-list");
    const modal = document.getElementById("edit-product-modal");
    const editForm = document.getElementById("edit-product-form");
    const closeModalBtn = document.querySelector(".close-modal");

    if (!productList || !modal) return;

    // Ouvinte para os cliques na lista de produtos
    productList.addEventListener('click', function(event) {
        const target = event.target;
        const token = localStorage.getItem('authToken');
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const id = target.dataset.id;

        // --- LÓGICA DE EXCLUSÃO ---
        if (target.classList.contains('delete-btn')) {
            if (confirm(`Tem a certeza de que deseja excluir este produto?`)) {
                fetch(`/api/empresas/produtos/${id}/`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'X-CSRFToken': csrfToken
                    }
                })
                .then(response => {
                    if (!response.ok) throw new Error('Falha ao excluir o produto.');
                    alert('Produto excluído com sucesso!');
                    renderMyProducts(); // Atualiza a lista
                })
                .catch(error => alert('Ocorreu um erro ao excluir o produto.'));
            }
        }

        // --- LÓGICA DE EDIÇÃO (PARTE 1: ABRIR E PREENCHER O MODAL) ---
        if (target.classList.contains('edit-btn')) {
            fetch(`/api/empresas/produtos/${id}/`, {
                headers: { 'Authorization': `Token ${token}` }
            })
            .then(response => response.json())
            .then(data => {
                editForm.querySelector('#edit-product-id').value = data.id;
                editForm.querySelector('#edit-produto-nome').value = data.nome;
                editForm.querySelector('#edit-produto-ncm').value = data.ncm_hs;
                editForm.querySelector('#edit-produto-certificacoes').value = data.certificacoes;
                modal.style.display = 'flex'; // Mostra o modal
            });
        }
    });

    // --- LÓGICA DE EDIÇÃO (PARTE 2: SALVAR AS ALTERAÇÕES) ---
    editForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const token = localStorage.getItem('authToken');
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const id = editForm.querySelector('#edit-product-id').value;
        const formData = new FormData(editForm);
        const data = Object.fromEntries(formData.entries());

        fetch(`/api/empresas/produtos/${id}/`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Token ${token}`,
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(data)
        })
        .then(response => response.ok ? response.json() : Promise.reject('Falha ao atualizar'))
        .then(updatedData => {
            alert('Produto atualizado com sucesso!');
            modal.style.display = 'none'; // Esconde o modal
            renderMyProducts(); // Atualiza a lista
        })
        .catch(error => alert('Ocorreu um erro ao atualizar o produto.'));
    });

    // Lógica para fechar o modal
    closeModalBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
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
    renderMyProducts(); // <-- ADICIONE ESTA LINHA
    handleAddProduct();
    handleProductActions();
});