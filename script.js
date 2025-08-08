// Espera o documento HTML ser completamente carregado para executar o script
document.addEventListener("DOMContentLoaded", function() {

    // Esta função busca o conteúdo de um arquivo e o coloca em um elemento da página
    const loadComponent = (filePath, elementSelector) => {
        fetch(filePath)
            .then(response => response.text())
            .then(data => {
                document.querySelector(elementSelector).innerHTML = data;
            });
    };

    // Chama a função para carregar o cabeçalho e o rodapé
    loadComponent("header.html", "header");
    loadComponent("footer.html", "footer");

});