// turnos.js
import { moverJugador } from "./game.js";
import { renderJugadores, obtenerJugadores } from "./ui.js";

let jugadores = obtenerJugadores();
let turno = 0;
const totalCasillas = 40;

export function tirarDados() {
  const dado1 = Math.floor(Math.random() * 6) + 1;
  const dado2 = Math.floor(Math.random() * 6) + 1;
  const total = dado1 + dado2;
  alert(`${jugadores[turno].nick} tiró ${dado1} + ${dado2} = ${total}`);

  return total;
}

export function jugarTurno() {
  const jugadorActual = jugadores[turno];

  // Cárcel
  if (jugadorActual.inJail) {
    if (jugadorActual.jailTurns > 0) {
      alert(
        `${jugadorActual.nick} está en la cárcel, turnos restantes: ${jugadorActual.jailTurns}`
      );
      jugadorActual.jailTurns--;
      pasarTurno();
      return;
    } else {
      jugadorActual.inJail = false;
      alert(`${jugadorActual.nick} sale de la cárcel`);
    }
  }

  const pasos = tirarDados();

  // Mover jugador y pasar `pasarTurno` al modal
  moverJugador(jugadorActual, pasos, totalCasillas, jugadores, pasarTurno);
}

// ⚡ Pasar turno
export function pasarTurno() {
  turno = (turno + 1) % jugadores.length;
  renderJugadores();
  alert(`Turno de ${jugadores[turno].nick}`);
}

export function jugadorActual() {
  return jugadores[turno];
}
