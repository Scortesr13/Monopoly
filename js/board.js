import { obtenerJugadores, renderJugadores, dibujarTablero } from "./ui.js";
import { obtenerTablero } from "./api.js";
import { colocarFichas } from "./game.js";
import { jugadorActual } from "./turnos.js";

// 🔹 Ya no usamos async en el DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  obtenerTablero()
    .then((datos) => {
      // Siempre será un array gracias a la corrección
      const casillas = [
        ...datos.bottom,
        ...datos.left,
        ...datos.top,
        ...datos.right,
      ];

      dibujarTablero(casillas);

      renderJugadores();

      // Jugadores desde localStorage como instancias de Jugador
      const jugadores = obtenerJugadores();
      console.log("Jugadores cargados:", jugadores);
    })
    .catch((error) => {
      console.error("Error inicializando el tablero:", error);
    });
});

export function manejarCompra(idCasilla, precio) {
  const jugadores = obtenerJugadores();
  const jugadorActual = jugadores[0]; // por ahora usamos el primero

  if (jugadorActual.money >= precio) {
    jugadorActual.comprarPropiedad(idCasilla, precio);
    alert(`${jugadorActual.nick} compró ${idCasilla} por $${precio}.`);

    // Guardar el estado actualizado (pero como objetos planos)
    localStorage.setItem(
      "monopoly_players",
      JSON.stringify(jugadores.map((j) => ({ ...j })))
    );

    // Opcional: marcar visualmente la casilla como comprada
    const casilla = document.getElementById(`casilla-${idCasilla}`);
    casilla.querySelector(".comprar-btn").remove();
    casilla.innerHTML += `<br/><span>Dueño: ${jugadorActual.nick}</span>`;

    renderJugadores(); // refrescar panel de jugadores
  } else {
    alert(
      `${jugadorActual.nick} no tiene suficiente dinero para comprar esta propiedad.`
    );
  }
}
