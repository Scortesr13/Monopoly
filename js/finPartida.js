import { obtenerJugadores } from "./ui.js";
console.log("finPartida.js cargado"); //  Ni siquiera lo muestra :c

document.addEventListener("DOMContentLoaded", () => {
    
    document.getElementById('btn-restart').addEventListener('click', () => {
        alert('La partida se reiniciará. Serás redirigido a la página principal.');
        window.location.href = 'index.html';
    });

    document.getElementById('btn-cargar-ranking').addEventListener('click', () => {
        const jugadores = obtenerJugadores();
        console.log(jugadores);
    });

});

