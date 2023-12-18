function obtenerModo() {
    if (localStorage.getItem("theme")) return localStorage.getItem("theme");
    if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
        return "dark";
    } else if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
        return "light";
    }
    return;
}

function fijarModo(modo) {
    document.documentElement.setAttribute("data-theme", modo);
    window.localStorage.setItem("theme", modo);
    document.getElementById("mode-toggle").checked = modo === "dark" ? true : false;
    document.getElementById("mode-toggle-text").innerHTML = modo === "dark" ? "Modo oscuro" : "Modo claro";
}

const theme = obtenerModo();
if (theme === "light") fijarModo("light");
else fijarModo("dark");

function cambioDeModo() {
    let currentMode = document.documentElement.getAttribute("data-theme");
    if (currentMode === "dark") fijarModo("light");
    else fijarModo("dark");
}