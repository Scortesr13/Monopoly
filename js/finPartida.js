import { obtenerJugadores } from "./ui.js";
import { Jugador } from "./jugador.js";

console.log("finPartida.js cargado");

document.addEventListener("DOMContentLoaded", () => {
    
    document.getElementById('btn-restart').addEventListener('click', () => {
        alert('La partida se reiniciará. Serás redirigido a la página principal.');
        window.location.href = 'index.html';
    });

    document.getElementById('btn-cargar-ranking').addEventListener('click', () => {
        alert('Cargando ranking desde localStorage...');
        const jugadores = obtenerJugadores();
        console.log(jugadores);
    });
});

