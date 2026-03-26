document.addEventListener("DOMContentLoaded", () => {
    const lang = new URLSearchParams(window.location.search).get("lang") || "es";

    // Cambiar textos
    if (lang === "en") {
        document.querySelectorAll("[data-en]").forEach(el => {
            el.textContent = el.dataset.en;
        });
    }

    // Botones
    const btnEs = document.getElementById("btn-es");
    const btnEn = document.getElementById("btn-en");

    if (lang === "en") {
        btnEn.classList.add("btn-dark");
        btnEn.classList.remove("btn-outline-dark");

        btnEs.classList.add("btn-outline-dark");
        btnEs.classList.remove("btn-dark");
    } else {
        btnEs.classList.add("btn-dark");
        btnEs.classList.remove("btn-outline-dark");

        btnEn.classList.add("btn-outline-dark");
        btnEn.classList.remove("btn-dark");
    }
});