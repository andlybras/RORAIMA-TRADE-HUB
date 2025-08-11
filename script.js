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

// Função para cuidar do envio do formulário de registro
function handleRegistration() {
    // 1. Encontra o formulário na página de registro
    const form = document.getElementById("registration-form");

    // 2. Se o formulário não existir (estamos em outra página), não faz nada
    if (!form) return;

    // 3. Adiciona um "ouvinte" para o evento de 'submit' (envio) do formulário
    form.addEventListener("submit", function(event) {
        // 4. Impede que o formulário recarregue a página (comportamento padrão)
        event.preventDefault();

        // 5. Pega os valores dos campos de nome e e-mail
        const responsavel = document.getElementById("responsavel").value;
        const email = document.getElementById("email").value;

        // 6. Cria um objeto para guardar os dados do usuário
        const user = {
            nome: responsavel,
            email: email
        };

        // 7. Salva os dados do usuário no localStorage (convertendo para texto JSON)
        localStorage.setItem("registeredUser", JSON.stringify(user));

        // 8. Avisa o usuário do sucesso e o redireciona para a página de login
        alert("Registro realizado com sucesso! Agora você pode fazer o login.");
        window.location.href = "login.html";
    });
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
    });
});