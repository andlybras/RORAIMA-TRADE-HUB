const mockCompanies = [
    { id: 1, nome: "Grãos do Norte", descricao: "Especialistas na produção e exportação de soja e milho.", logoPlaceholder: "Grãos do Norte", localidade: "Boa Vista, RR", setor: "Agronegócio" },
    { id: 2, nome: "Madeiras de Roraima", descricao: "Manejo sustentável e fornecimento de madeira certificada.", logoPlaceholder: "Madeiras RR", localidade: "Rorainópolis, RR", setor: "Indústria Madeireira" },
    { id: 3, nome: "Frutas Tropicais da Amazônia", descricao: "Polpas de frutas exóticas e frescas, como açaí e cupuaçu.", logoPlaceholder: "Frutas Tropicais", localidade: "Caracaraí, RR", setor: "Bioeconomia" },
    { id: 4, nome: "Couro & Artesanato Roraimense", descricao: "Artigos de couro e artesanato com design único da cultura local.", logoPlaceholder: "Artesanato RR", localidade: "Boa Vista, RR", setor: "Artesanato" },
    { id: 5, nome: "Castanhas do Monte Roraima", descricao: "Produção e beneficiamento de castanha-do-pará.", logoPlaceholder: "Castanhas", localidade: "Pacaraima, RR", setor: "Agronegócio" },
    { id: 6, nome: "Pescados do Rio Branco", descricao: "Fornecimento de peixes de água doce para os mercados.", logoPlaceholder: "Pescados", localidade: "Caracaraí, RR", setor: "Piscicultura" }
];

const mockSectors = [
    "Agronegócio",
    "Artesanato",
    "Bioeconomia",
    "Indústria Madeireira",
    "Piscicultura"
];

function renderCompanyCards() {
    const gridContainer = document.querySelector(".results-grid");
    if (!gridContainer) return;

    // LÊ O FILTRO DA URL
    const urlParams = new URLSearchParams(window.location.search);
    const sectorFilter = urlParams.get('setor');

    let companiesToRender = mockCompanies;

    // SE EXISTIR UM FILTRO DE SETOR, FILTRA A LISTA DE EMPRESAS
    if (sectorFilter) {
        companiesToRender = mockCompanies.filter(company => company.setor === sectorFilter);
    }

    gridContainer.innerHTML = ""; // Limpa a grade

    // VERIFICA SE HÁ RESULTADOS PARA MOSTRAR
    if (companiesToRender.length === 0) {
        gridContainer.innerHTML = "<p>Nenhuma empresa encontrada para este filtro.</p>";
        return;
    }

    // RENDERIZA APENAS AS EMPRESAS FILTRADAS
    companiesToRender.forEach(company => {
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

// Função para cuidar do envio do formulário de registro
function handleRegistration() {
    const form = document.getElementById("registration-form");
    if (!form) return;

    form.addEventListener("submit", function(event) {
        event.preventDefault(); // Sempre impede o envio padrão primeiro

        // Seleciona os campos que vamos validar
        const senhaInput = document.getElementById("senha");
        const confirmaSenhaInput = document.getElementById("confirma-senha");

        // Pega os valores
        const senha = senhaInput.value;
        const confirmaSenha = confirmaSenhaInput.value;

        // Variável de controle
        let isValid = true;

        // --- INÍCIO DAS REGRAS DE VALIDAÇÃO ---

        // Regra 1: Senha tem no mínimo 8 caracteres
        if (senha.length < 8) {
            isValid = false;
            // Mostra a mensagem de erro e adiciona a classe de erro
            showError(senhaInput, "A senha deve ter no mínimo 8 caracteres.");
        } else {
            // Limpa o erro se a regra for atendida
            clearError(senhaInput);
        }

        // Regra 2: As senhas são iguais
        if (senha !== confirmaSenha) {
            isValid = false;
            showError(confirmaSenhaInput, "As senhas não coincidem.");
        } else {
            clearError(confirmaSenhaInput);
        }

        // --- FIM DAS REGRAS DE VALIDAÇÃO ---

        // Se todas as regras passaram (isValid continua true)...
        if (isValid) {
            // ...continua com a lógica de registro que já tínhamos!
            const responsavel = document.getElementById("responsavel").value;
            const email = document.getElementById("email").value;
            const user = { nome: responsavel, email: email };
            localStorage.setItem("registeredUser", JSON.stringify(user));
            alert("Registro realizado com sucesso! Agora você pode fazer o login.");
            window.location.href = "login.html";
        }
    });

    // Funções auxiliares para mostrar/limpar erros
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

// Função para cuidar do envio do formulário de login
function handleLogin() {
    // 1. Encontra o formulário na página de login
    const form = document.getElementById("login-form");

    // 2. Se o formulário não existir, não faz nada
    if (!form) return;

    // 3. Adiciona um "ouvinte" para o evento de 'submit'
    form.addEventListener("submit", function(event) {
        // 4. Impede o recarregamento da página
        event.preventDefault();

        // 5. Pega o e-mail salvo no localStorage
        const storedUserString = localStorage.getItem("registeredUser");

        // 6. Se não houver usuário salvo, mostra erro
        if (!storedUserString) {
            alert("Nenhum usuário registrado. Por favor, registre-se primeiro.");
            return;
        }

        // 7. Converte o texto do usuário de volta para um objeto
        const storedUser = JSON.parse(storedUserString);

        // 8. Pega o e-mail digitado no formulário
        const email = document.getElementById("email").value;

        // 9. Compara o e-mail digitado com o e-mail salvo
        if (email === storedUser.email) {
            // Se forem iguais, o login é um sucesso!
            alert("Login realizado com sucesso!");
            window.location.href = "dashboard.html";
        } else {
            // Se forem diferentes, mostra um erro
            alert("E-mail ou senha incorretos.");
        }
    });
}

// Função para verificar se o usuário está logado e personalizar a página
function handleAuthentication() {
    // 1. Verifica se a página atual é uma página do dashboard
    const isDashboardPage = document.body.classList.contains("dashboard-page");

    // 2. Pega os dados do usuário do localStorage
    const storedUserString = localStorage.getItem("registeredUser");
    const user = JSON.parse(storedUserString);

    if (isDashboardPage) {
        // Se for uma página do dashboard...
        if (!user) {
            // ...e NÃO houver usuário logado, redireciona para o login
            alert("Você precisa estar logado para acessar esta página.");
            window.location.href = "login.html";
        } else {
            // ...e HOUVER um usuário logado, personaliza a saudação
            const welcomeElement = document.getElementById("welcome-message");
            if (welcomeElement) {
                welcomeElement.textContent = `Bem-vindo de volta, ${user.nome}!`;
            }
        }
    }

    // Lógica para o botão de "Sair"
    const logoutButton = document.querySelector(".nav-item.logout");
    if (logoutButton) {
        logoutButton.addEventListener("click", function(event) {
            event.preventDefault(); // Impede que o link navegue
            localStorage.removeItem("registeredUser"); // Remove o usuário do localStorage
            alert("Você saiu da sua conta.");
            window.location.href = "index.html"; // Redireciona para a página inicial
        });
    }
}

// Função para popular os menus de filtro na página de busca
function populateFilters() {
    // 1. Encontra o <select> do setor na página
    const sectorSelect = document.getElementById("setor");

    // 2. Se não encontrar (não estamos na página de busca), não faz nada
    if (!sectorSelect) return;

    // 3. Para cada setor na nossa lista de dados...
    mockSectors.forEach(sector => {
        // 4. ...cria um elemento <option>
        const option = document.createElement("option");
        option.value = sector;
        option.textContent = sector;

        // 5. ...e o adiciona ao <select>
        sectorSelect.appendChild(option);
    });
}

// Função para cuidar do envio do formulário de busca
function handleSearchForm() {
    const form = document.getElementById("search-form");
    if (!form) return;

    form.addEventListener("submit", function(event) {
        event.preventDefault(); // Impede o envio padrão

        // Pega o valor selecionado no filtro de setor
        const sectorValue = document.getElementById("setor").value;

        // Se um valor foi selecionado, redireciona para a página de resultados com o filtro na URL
        if (sectorValue) {
            window.location.href = `resultados.html?setor=${encodeURIComponent(sectorValue)}`;
        } else {
            // Se nada foi selecionado, vai para a página de resultados sem filtro
            window.location.href = "resultados.html";
        }
    });
}

document.addEventListener("DOMContentLoaded", function() {
    // A função continua a mesma, mas agora ela 'retorna' a promessa do fetch
    const loadComponent = (filePath, elementSelector) => {
        return fetch(filePath)
            .then(response => response.text())
            .then(data => {
                document.querySelector(elementSelector).innerHTML = data;
            });
    };

    // Usamos Promise.all para esperar que TODOS os componentes sejam carregados
    Promise.all([
        loadComponent("header.html", "header"),
        loadComponent("footer.html", "footer")
    ]).then(() => {
        // APENAS DEPOIS que o header e o footer estiverem na página,
        // nós executamos as funções que dependem do conteúdo da página.
        handleAuthentication();
        renderCompanyCards();
        renderCompanyDetails();
        handleRegistration(); // Nossa nova função é chamada aqui!
        handleLogin();
        populateFilters();
        handleSearchForm();
    });
});