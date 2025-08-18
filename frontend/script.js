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


// ---- FUNÇÃO DE REGISTRO TOTALMENTE SUBSTITUÍDA ----
// Esta nova versão controla o envio do formulário e a exibição do modal de sucesso.
// frontend/script.js

// ... (outras funções) ...

// ---- FUNÇÃO DE REGISTRO COM AJUSTE PARA MÚLTIPLA SELEÇÃO ----
function handleRegistration() {
    const form = document.getElementById("registration-form");
    if (!form) return;

    const successModal = document.getElementById("success-modal");
    const modalOkBtn = document.getElementById("modal-ok-btn");

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        
        if (!form.querySelector('#termos').checked) {
            alert('Você deve concordar com a declaração para se registrar.');
            return;
        }

        const csrfToken = form.querySelector('[name=csrfmiddlewaretoken]').value;
        const formData = new FormData(form);

        // --- AJUSTE CRÍTICO AQUI ---
        // 1. Pegamos a lista de todos os CNAEs secundários selecionados.
        const cnaesSecundariosList = formData.getAll('cnaes_secundarios');
        
        // 2. Convertemos o resto do formulário para um objeto.
        const data = Object.fromEntries(formData.entries());
        
        // 3. Substituímos a entrada única de cnaes_secundarios pela nossa lista completa.
        data.cnaes_secundarios = cnaesSecundariosList;
        // --- FIM DO AJUSTE ---

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
            return response.json().then(errData => {
                 const firstErrorKey = Object.keys(errData)[0];
                 const errorMessages = errData[firstErrorKey].join(', ');
                 throw new Error(`Falha no registro: ${firstErrorKey} - ${errorMessages}`);
            });
        })
        .then(data => {
            successModal.style.display = 'flex'; 
        })
        .catch(error => {
            console.error("Erro no Registro:", error);
            alert(error.message || "Ocorreu um erro. Verifique se o e-mail ou CNPJ já não estão cadastrados.");
        });
    });

    modalOkBtn.addEventListener("click", () => {
        window.location.href = "/login/";
    });
}


// ... (o resto do seu arquivo script.js) ...


// ---- NOVA FUNÇÃO PARA CONTROLAR O FORMULÁRIO MULTI-STEP ----
// Esta função é nova e controla a navegação entre os passos do formulário de registro.
function handleMultiStepForm() {
    const form = document.getElementById("registration-form");
    if (!form) return;

    const nextBtn = document.getElementById("next-btn");
    const prevBtn = document.getElementById("prev-btn");
    const submitBtn = document.getElementById("submit-btn");
    const steps = Array.from(document.querySelectorAll(".form-step"));
    let currentStep = 0;

    function updateButtons() {
        prevBtn.style.display = currentStep > 0 ? "inline-block" : "none";
        nextBtn.style.display = currentStep < steps.length - 1 ? "inline-block" : "none";
        submitBtn.style.display = currentStep === steps.length - 1 ? "inline-block" : "none";
    }

    function showStep(stepIndex) {
        steps.forEach((step, index) => {
            step.classList.toggle("active-step", index === stepIndex);
        });
        currentStep = stepIndex;
        updateButtons();
    }

    nextBtn.addEventListener("click", () => {
        const currentStepInputs = steps[currentStep].querySelectorAll('input[required]');
        let allValid = true;
        currentStepInputs.forEach(input => {
            if (!input.value) {
                allValid = false;
                input.style.borderColor = 'red';
            } else {
                input.style.borderColor = '#ccc';
            }
        });

        if (allValid && currentStep < steps.length - 1) {
            showStep(currentStep + 1);
        } else if (!allValid) {
            alert('Por favor, preencha todos os campos obrigatórios.');
        }
    });

    prevBtn.addEventListener("click", () => {
        if (currentStep > 0) {
            showStep(currentStep - 1);
        }
    });

    showStep(0); // Mostra o primeiro passo inicialmente
}

function setupCNAESecundariosAutocomplete() {
    const input = document.getElementById('cnae-secundario-input');
    const suggestionsList = document.getElementById('cnae-secundario-suggestions');
    const pillsContainer = document.getElementById('cnae-secundario-pills');
    const hiddenSelect = document.getElementById('cnaes-secundarios-hidden');
    
    if (!input) return;

    let selectedIds = new Set(); // Usaremos um Set para evitar duplicatas facilmente

    // Função para adicionar um "pill"
    function addPill(cnae) {
        // Prevenção de duplicatas
        if (selectedIds.has(cnae.id.toString())) {
            alert("Este CNAE já foi adicionado.");
            return;
        }

        selectedIds.add(cnae.id.toString());

        // Cria o elemento do "pill"
        const pill = document.createElement('div');
        pill.className = 'cnae-pill';
        pill.dataset.id = cnae.id;
        pill.innerHTML = `
            <span>${cnae.codigo}</span>
            <button type="button" class="remove-pill">&times;</button>
        `;
        pillsContainer.appendChild(pill);

        // Adiciona a opção ao <select> oculto para que seja enviada com o formulário
        const option = document.createElement('option');
        option.value = cnae.id;
        option.selected = true;
        option.textContent = cnae.codigo; // Apenas para debug, não é necessário
        hiddenSelect.appendChild(option);

        // Limpa o campo de busca
        input.value = '';
        suggestionsList.style.display = 'none';
    }

    // Função para remover um "pill"
    pillsContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-pill')) {
            const pill = e.target.closest('.cnae-pill');
            const idToRemove = pill.dataset.id;

            selectedIds.delete(idToRemove); // Remove do nosso controle de duplicatas
            pill.remove(); // Remove da tela

            // Remove do <select> oculto
            const optionToRemove = hiddenSelect.querySelector(`option[value="${idToRemove}"]`);
            if (optionToRemove) {
                optionToRemove.remove();
            }
        }
    });

    // Lógica do Autocomplete (similar ao CNAE Principal)
    input.addEventListener('input', function() {
        const value = this.value;
        if (value.length < 2) { // Só busca a partir de 2 caracteres
            suggestionsList.style.display = 'none';
            return;
        }

        fetch(`/api/empresas/cnaes/?search=${value}`)
            .then(response => response.json())
            .then(cnaes => {
                suggestionsList.innerHTML = '';
                cnaes.forEach(cnae => {
                    const li = document.createElement('li');
                    li.textContent = `${cnae.codigo} - ${cnae.denominacao}`;
                    li.addEventListener('click', () => addPill(cnae));
                    suggestionsList.appendChild(li);
                });
                suggestionsList.style.display = cnaes.length > 0 ? 'block' : 'none';
            });
    });

    // Fecha a lista de sugestões se clicar fora
    document.addEventListener('click', function(e) {
        if (e.target !== input) {
            suggestionsList.style.display = 'none';
        }
    });
}
// ... (outras funções) ...

function setupCNAEPrincipalAutocomplete() {
    const input = document.getElementById('cnae-principal-input');
    const suggestionsList = document.getElementById('cnae-principal-suggestions');
    const hiddenIdInput = document.getElementById('cnae-principal-id');
    let currentFocus = -1;

    input.addEventListener('input', function(e) {
        const value = this.value;
        if (!value) {
            closeSuggestions();
            return false;
        }

        // Faz a busca na API com o termo digitado
        fetch(`/api/empresas/cnaes/?search=${value}`)
            .then(response => response.json())
            .then(cnaes => {
                suggestionsList.innerHTML = '';
                if (cnaes.length > 0) {
                    cnaes.forEach(cnae => {
                        const li = document.createElement('li');
                        li.innerHTML = `<strong>${cnae.codigo}</strong> - ${cnae.denominacao}`;
                        li.addEventListener('click', function() {
                            input.value = `${cnae.codigo} - ${cnae.denominacao}`;
                            hiddenIdInput.value = cnae.id;
                            closeSuggestions();
                        });
                        suggestionsList.appendChild(li);
                    });
                    suggestionsList.style.display = 'block';
                } else {
                    suggestionsList.style.display = 'none';
                }
            })
            .catch(error => console.error('Erro ao buscar CNAEs:', error));
    });

    input.addEventListener('keydown', function(e) {
        let items = suggestionsList.querySelectorAll('li');
        if (e.keyCode === 40) { // Arrow DOWN
            currentFocus++;
            addActiveClass(items);
        } else if (e.keyCode === 38) { // Arrow UP
            currentFocus--;
            addActiveClass(items);
        } else if (e.keyCode === 13) { // ENTER
            e.preventDefault();
            if (currentFocus > -1 && items) {
                items.item(currentFocus).click();
            }
        }
    });

    function addActiveClass(items) {
        if (!items) return false;
        removeActiveClass(items);
        if (currentFocus >= items.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = (items.length - 1);
        items.item(currentFocus).classList.add('selected');
    }

    function removeActiveClass(items) {
        for (let i = 0; i < items.length; i++) {
            items.item(i).classList.remove('selected');
        }
    }

    function closeSuggestions() {
        suggestionsList.style.display = 'none';
        currentFocus = -1;
    }

    // Fecha as sugestões se o usuário clicar fora
    document.addEventListener('click', function(e) {
        if (e.target !== input && e.target !== suggestionsList) {
            closeSuggestions();
        }
    });
}

// Modifique a chamada no DOMContentLoaded para setup o autocomplete do CNAE Principal
document.addEventListener("DOMContentLoaded", function() {
    // ... (outras chamadas) ...
    populateCNAEForms(); // Podemos remover esta chamada agora para o principal
    setupCNAEPrincipalAutocomplete(); // Adiciona a nova função de autocomplete
});

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

// ATENÇÃO: SUBSTITUA SUA FUNÇÃO ANTIGA populateProfileForm POR ESTA

function populateProfileForm() {
    const form = document.getElementById("perfil-form");
    if (!form) return;

    const token = localStorage.getItem('authToken');
    if (!token) return;

    // PARTE 1: BUSCAR E PREENCHER OS DADOS (VERSÃO CORRIGIDA)
    fetch('/api/empresas/my-empresa/', {
        method: 'GET',
        headers: { 'Authorization': `Token ${token}` }
    })
    .then(response => response.ok ? response.json() : Promise.reject('Falha ao carregar dados do perfil'))
    .then(data => {
        // --- PREENCHIMENTO DOS CAMPOS DE TEXTO SIMPLES ---
        form.querySelector('[name="nome_fantasia"]').value = data.nome_fantasia || '';
        form.querySelector('[name="descricao"]').value = data.descricao || '';
        form.querySelector('[name="razao_social"]').value = data.razao_social || '';
        form.querySelector('[name="cnpj"]').value = data.cnpj || '';
        form.querySelector('[name="inscricao_estadual"]').value = data.inscricao_estadual || '';
        form.querySelector('[name="endereco_sede"]').value = data.endereco_sede || '';
        form.querySelector('[name="responsavel_nome"]').value = data.responsavel_nome || '';
        form.querySelector('[name="responsavel_funcao"]').value = data.responsavel_funcao || '';
        form.querySelector('[name="email"]').value = data.email || '';
        form.querySelector('[name="contatos"]').value = data.contatos || '';

        // --- LÓGICA CORRIGIDA PARA EXIBIR OS CNAES ---

        // 1. Preenche o campo de texto do CNAE Principal
        // (lembre-se que no perfil.html o campo se chama 'cnae_principal_display')
        const cnaePrincipalInput = form.querySelector('[name="cnae_principal_display"]');
        if (cnaePrincipalInput) {
            cnaePrincipalInput.value = data.cnae_principal || 'Não informado';
        }

        // 2. Cria os "pills" para os CNAEs Secundários
        const pillsContainer = document.getElementById('cnae-secundario-pills');
        if (pillsContainer) {
            pillsContainer.innerHTML = ''; // Limpa o contêiner primeiro
            if (data.cnaes_secundarios && data.cnaes_secundarios.length > 0) {
                data.cnaes_secundarios.forEach(cnae_str => {
                    const pill = document.createElement('div');
                    pill.className = 'cnae-pill-display'; // Usa a classe de estilo que criamos
                    pill.textContent = cnae_str;
                    pillsContainer.appendChild(pill);
                });
            } else {
                // Se não houver CNAEs secundários, exibe uma mensagem
                pillsContainer.innerHTML = '<p style="font-style: italic; color: #6c757d;">Nenhum CNAE secundário cadastrado.</p>';
            }
        }
    })
    .catch(error => console.error("Erro ao popular o perfil da empresa:", error));

    // PARTE 2: LÓGICA DE SUBMISSÃO (permanece a mesma)
    // Não mexemos aqui para manter o upload do logo seguro.
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const csrfToken = form.querySelector('[name=csrfmiddlewaretoken]').value;
        const formData = new FormData(form);

        fetch('/api/empresas/my-empresa/', {
            method: 'PATCH',
            headers: {
                'Authorization': `Token ${token}`,
                'X-CSRFToken': csrfToken
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.detail || 'Falha ao atualizar o perfil.') });
            }
            return response.json();
        })
        .then(updatedData => {
            alert('Perfil atualizado com sucesso!');
            window.location.reload();
        })
        .catch(error => {
            console.error('Erro ao atualizar perfil:', error);
            alert(`Ocorreu um erro ao atualizar o perfil: ${error.message}`);
        });
    });
}
// ... (todo o resto do seu JS continua igual) ...

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

// ... (outras funções) ...

function setupNCMCascadingDropdowns() {
    const secaoSelect = document.getElementById('ncm-secao');
    const capituloSelect = document.getElementById('ncm-capitulo');
    const posicaoSelect = document.getElementById('ncm-posicao');
    const itemSelect = document.getElementById('ncm-item');

    // Se não estamos na página certa, não faz nada
    if (!secaoSelect) return;

    // Função genérica para limpar e preencher um <select>
    function populateSelect(selectElement, items, defaultOptionText) {
        selectElement.innerHTML = `<option value="" selected disabled>${defaultOptionText}</option>`;
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.id;
            // Usa 'descricao' para Seção e 'codigo' + 'descricao' para os outros
            option.textContent = item.codigo ? `${item.codigo} - ${item.descricao}` : item.descricao;
            selectElement.appendChild(option);
        });
        selectElement.disabled = false;
    }

    // Função para limpar os selects "filhos"
    function resetSelects(...selects) {
        selects.forEach(select => {
            select.innerHTML = `<option value="" selected disabled>Selecione uma opção no campo anterior</option>`;
            select.disabled = true;
        });
    }

    // 1. Carregar Seções quando a página carregar
    fetch('/api/empresas/ncm/secoes/')
        .then(response => response.json())
        .then(data => populateSelect(secaoSelect, data, 'Selecione um setor'));

    // 2. Quando uma Seção for escolhida, carregar os Capítulos
    secaoSelect.addEventListener('change', () => {
        const secaoId = secaoSelect.value;
        resetSelects(capituloSelect, posicaoSelect, itemSelect);
        if (!secaoId) return;

        fetch(`/api/empresas/ncm/capitulos/?secao_id=${secaoId}`)
            .then(response => response.json())
            .then(data => populateSelect(capituloSelect, data, 'Selecione uma área'));
    });

    // 3. Quando um Capítulo for escolhido, carregar as Posições
    capituloSelect.addEventListener('change', () => {
        const capituloId = capituloSelect.value;
        resetSelects(posicaoSelect, itemSelect);
        if (!capituloId) return;

        fetch(`/api/empresas/ncm/posicoes/?capitulo_id=${capituloId}`)
            .then(response => response.json())
            .then(data => populateSelect(posicaoSelect, data, 'Selecione uma categoria'));
    });

    // 4. Quando uma Posição for escolhida, carregar os Itens finais
    posicaoSelect.addEventListener('change', () => {
        const posicaoId = posicaoSelect.value;
        resetSelects(itemSelect);
        if (!posicaoId) return;

        fetch(`/api/empresas/ncm/itens/?posicao_id=${posicaoId}`)
            .then(response => response.json())
            .then(data => populateSelect(itemSelect, data, 'Selecione o produto final'));
    });
}

// ... (outras funções, como setupNCMCascadingDropdowns) ...

// --- FUNÇÃO handleAddProduct ATUALIZADA ---
function handleAddProduct() {
    const form = document.getElementById("add-product-form");
    if (!form) return;

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Impede o recarregamento da página

        const token = localStorage.getItem('authToken');
        const csrfToken = form.querySelector('[name=csrfmiddlewaretoken]').value;
        
        // new FormData(form) já pega todos os campos com o atributo 'name',
        // incluindo o <select name="ncm"> com o ID do item NCM selecionado.
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
                // Se a resposta não for ok, lê o erro do corpo da resposta para dar um feedback melhor
                return response.json().then(err => { throw err; });
            }
            return response.json();
        })
        .then(newProduct => {
            alert(`Produto "${newProduct.nome}" adicionado com sucesso!`);
            form.reset(); // Limpa o formulário

            // Reseta os menus em cascata para o estado inicial
            document.getElementById('ncm-capitulo').disabled = true;
            document.getElementById('ncm-posicao').disabled = true;
            document.getElementById('ncm-item').disabled = true;

            renderMyProducts(); // Atualiza a lista de produtos na tela sem precisar recarregar a página
        })
        .catch(error => {
            console.error('Erro ao adicionar produto:', error);
            // Monta uma mensagem de erro mais útil
            let errorMessage = 'Ocorreu um erro ao adicionar o produto.';
            if (error.ncm) {
                errorMessage = `Erro no campo NCM: ${error.ncm[0]}`;
            } else if (error.nome) {
                errorMessage = `Erro no campo Nome: ${error.nome[0]}`;
            }
            alert(errorMessage);
        });
    });
}

// ... (o resto do seu arquivo script.js) ...

// Função para lidar com a Edição e Exclusão de produtos
function handleProductActions() {
    const productList = document.querySelector(".product-list");
    const modal = document.getElementById("edit-product-modal");
    const editForm = document.getElementById("edit-product-form");
    const closeModalBtn = document.querySelector(".close-modal");

    if (!productList || !modal) return;

    productList.addEventListener('click', function(event) {
        const target = event.target;
        const token = localStorage.getItem('authToken');
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;
        const id = target.dataset.id;

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
                    renderMyProducts();
                })
                .catch(error => alert('Ocorreu um erro ao excluir o produto.'));
            }
        }

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
                modal.style.display = 'flex';
            });
        }
    });

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
            modal.style.display = 'none';
            renderMyProducts();
        })
        .catch(error => alert('Ocorreu um erro ao atualizar o produto.'));
    });

    closeModalBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

// Função para popular elementos comuns do dashboard (logótipo, nome da empresa)
function populateDashboardHeader() {
    const isDashboardPage = document.body.classList.contains("dashboard-page");
    if (!isDashboardPage) return;

    const token = localStorage.getItem('authToken');
    if (!token) return;

    const logoImgElement = document.getElementById("dashboard-logo-img");
    const companyNameElement = document.getElementById("dashboard-company-name");

    fetch('/api/empresas/my-empresa/', {
        method: 'GET',
        headers: { 'Authorization': `Token ${token}` }
    })
    .then(response => response.ok ? response.json() : Promise.reject('Falha ao carregar dados do perfil'))
    .then(data => {
        if (data.logomarca) {
            logoImgElement.src = data.logomarca;
        } else {
            logoImgElement.src = "https://placehold.co/150x150?text=Logo";
        }
        companyNameElement.textContent = data.nome_fantasia;
    })
    .catch(error => {
        console.error("Erro ao popular o cabeçalho do dashboard:", error);
        companyNameElement.textContent = "Erro ao carregar";
    });
}

function handleFaqAccordion() {
    const faqItems = document.querySelectorAll(".faq-item");

    if (!faqItems.length) return;

    faqItems.forEach(item => {
        const questionButton = item.querySelector(".faq-question");
        const answerPanel = item.querySelector(".faq-answer");
        const icon = questionButton.querySelector(".faq-icon");

        questionButton.addEventListener("click", () => {
            const isActive = item.classList.contains("active");

            if (!isActive) {
                item.classList.add("active");
                answerPanel.style.maxHeight = answerPanel.scrollHeight + "px";
                icon.textContent = "-";
            } else {
                item.classList.remove("active");
                answerPanel.style.maxHeight = null;
                icon.textContent = "+";
            }
        });
    });
}

// NO FINAL DO SEU ARQUIVO script.js
// SUBSTITUA O SEU DOMContentLoaded POR ESTE BLOCO COMPLETO

document.addEventListener("DOMContentLoaded", function() {
    // --- FUNÇÕES GERAIS (rodam em várias páginas) ---
    handleAuthentication();
    populateDashboardHeader(); // Para preencher o header do menu lateral

    // --- FUNÇÕES ESPECÍFICAS DA PÁGINA DE REGISTRO ---
    if (document.getElementById('registration-form')) {
        handleRegistration();
        handleMultiStepForm();
        setupCNAEPrincipalAutocomplete();
        setupCNAESecundariosAutocomplete();
    }

    // --- FUNÇÕES ESPECÍFICAS DA PÁGINA DE LOGIN ---
    if (document.getElementById('login-form')) {
        handleLogin();
    }

    // --- FUNÇÕES ESPECÍFICAS DA PÁGINA "MINHA VITRINE" ---
    if (document.body.classList.contains('page-vitrine')) { // Adicionaremos esta classe ao HTML
        renderMyProducts();
        handleAddProduct();
        handleProductActions();
        setupNCMCascadingDropdowns();
    }
    
    // --- FUNÇÕES ESPECÍFICAS DA PÁGINA "DADOS DE REGISTRO" (PERFIL) ---
    if (document.getElementById('perfil-form')) {
        populateProfileForm();
    }

    // Adicione outras funções de páginas específicas aqui, se necessário...
    // Ex: comprar.html, resultados.html, etc.
});