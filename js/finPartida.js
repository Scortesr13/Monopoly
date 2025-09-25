import { obtenerJugadores, renderJugadores, dibujarTablero } from "./ui.js";
import { obtenerTablero } from "./api.js";
import { colocarFichas } from "./game.js";
import { jugadorActual } from "./turnos.js";
import { jugarTurno, pasarTurno } from "./turnos.js";

document.getElementById('btn-restart').addEventListener('click', function() {
    window.location.href = './index.html';
});