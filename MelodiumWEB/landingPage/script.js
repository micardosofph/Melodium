document.addEventListener("DOMContentLoaded", () => {
    const placeholder = document.getElementById("header-placeholder");
    if (!placeholder) return;

    fetch("header.html", { cache: "no-store" })
        .then((response) => {
            if (!response.ok) throw new Error("Erro ao carregar header.html");
            return response.text();
        })
        .then((html) => {
            placeholder.innerHTML = html;
        })
        .catch((err) => console.error(err));
});

function menuButton() {
    const headerOverlay = document.querySelector(".headerOverlay");
    const openMenuImage = document.querySelector(".openMenuImage");
    const closeMenuImage = document.querySelector(".closeMenuImage");
    const navBar = document.querySelector(".navbar");
    const navBarLinksContainer = document.querySelector(".nav-links-container");
    const navBarActions = document.querySelector(".nav-actions");

    openMenuImage.classList.toggle('active');
    closeMenuImage.classList.toggle('active');
    navBar.classList.toggle('active');

    if (navBarLinksContainer) navBarLinksContainer.classList.toggle('active');
    if (navBarActions) navBarActions.classList.toggle('active');
    if (headerOverlay) headerOverlay.classList.toggle('active');
}

(function attachHeaderOverlayClose() {
    const headerOverlay = document.querySelector(".headerOverlay");
    if (!headerOverlay) return;

    headerOverlay.addEventListener("click", () => {
        const openMenuImage = document.querySelector(".openMenuImage");
        const closeMenuImage = document.querySelector(".closeMenuImage");
        const navBar = document.querySelector(".navbar");
        const navBarLinksContainer = document.querySelector(".nav-links-container");
        const navBarActions = document.querySelector(".nav-actions");

        if (openMenuImage) openMenuImage.classList.add('active');
        if (closeMenuImage) closeMenuImage.classList.remove('active');

        if (navBar) navBar.classList.remove('active');
        if (navBarLinksContainer) navBarLinksContainer.classList.remove('active');
        if (navBarActions) navBarActions.classList.remove('active');
        headerOverlay.classList.remove('active');
    });
})();


