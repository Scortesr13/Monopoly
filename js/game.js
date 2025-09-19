import { obtenerJugadores, renderJugadores } from "./ui.js";
import { jugarTurno } from "./turnos.js";

document
  .getElementById("btn-tirar-dados")
  .addEventListener("click", jugarTurno);

export function colocarFichas(jugadores) {
  // Primero limpiamos fichas que no correspondan a jugadores actuales
  document.querySelectorAll(".ficha").forEach((f) => {
    const idJugador = f.id.replace("ficha-", "");
    if (!jugadores.some((j) => j.id == idJugador)) {
      f.remove();
    }
  });

  jugadores.forEach((jugador) => {
    const casilla = document.getElementById(`casilla-${jugador.position}`);
    if (!casilla) return;

    const contenedor = casilla.querySelector(".contenedor-fichas");
    if (!contenedor) return;

    // ⚡ Verificamos si ya existe la ficha de este jugador en esta casilla
    if (contenedor.querySelector(`#ficha-${jugador.id}`)) return;

    const ficha = document.createElement("div");
    ficha.classList.add("ficha");
    ficha.style.background = jugador.color;
    ficha.id = `ficha-${jugador.id}`;
    ficha.title = jugador.nick;

    contenedor.appendChild(ficha);
  });
}

export function moverJugador(jugador, pasos, totalCasillas) {
  const casillaAnterior = document.getElementById(
    `casilla-${jugador.position}`
  );

  // actualizar posición con wrap-around
  jugador.position = (jugador.position + pasos) % totalCasillas;

  colocarFichas(obtenerJugadores()); // re-renderizar fichas en nuevas posiciones

  const casillaActual = document.getElementById(`casilla-${jugador.position}`);
  accionCasilla(jugador, casillaActual); // dispara la acción de la casilla
}
export function accionCasilla(jugador, casilla) {
  if (!casilla) return;

  const tipo = casilla.dataset.tipo; // "propiedad", "impuesto", "sorpresa", "comunidad", "carcel", etc.

  switch (tipo) {
    case "propiedad":
      if (!casilla.dataset.dueno) {
        // propiedad libre → preguntar si compra
        mostrarVentanaAccion(jugador, casilla, ["Comprar", "Cancelar"]);
      } else if (casilla.dataset.dueno !== jugador.id) {
        // propiedad de otro jugador → pagar renta
        mostrarVentanaAccion(jugador, casilla, ["Pagar Renta"]);
      } else {
        // propiedad propia → opción de construir casa/hotel
        mostrarVentanaAccion(jugador, casilla, ["Construir Casa/Hotel"]);
      }
      break;

    case "impuesto":
      mostrarVentanaAccion(jugador, casilla, ["Pagar Impuesto"]);
      break;

    case "sorpresa":
    case "comunidad":
      mostrarVentanaAccion(jugador, casilla, ["Sacar Carta"]);
      break;

    case "carcel":
      mostrarVentanaAccion(jugador, casilla, ["Ir a la Cárcel"]);
      break;

    case "salida":
      // nada que hacer, solo mostrar mensaje
      alert(`${jugador.nick} pasó por Salida`);
      break;

    default:
      console.log("Tipo de casilla desconocido:", tipo);
  }
}
export function mostrarVentanaAccion(
  jugador,
  casilla,
  opciones,
  jugadores,
  pasarTurno
) {
  const modalExistente = document.getElementById("modal-accion");
  if (modalExistente) modalExistente.remove();

  const modal = document.createElement("div");
  modal.id = "modal-accion";
  modal.classList.add("modal");
  modal.innerHTML = `<h3>${jugador.nick} cayó en ${casilla.dataset.nombre}</h3>`;

  opciones.forEach((opcion) => {
    const btn = document.createElement("button");
    btn.textContent = opcion;
    btn.addEventListener("click", () => {
      manejarAccion(jugador, casilla, opcion, jugadores);
      modal.remove(); // cerrar modal
      pasarTurno(); // ⚡ PASAR TURNO después de la acción
    });
    modal.appendChild(btn);
  });

  const contenedor = document.getElementById("modal-container");
  if (contenedor) {
    contenedor.innerHTML = "";
    contenedor.appendChild(modal);
  } else {
    document.body.appendChild(modal);
  }
}

function manejarAccion(jugador, casilla, opcion, jugadores) {
  const precio = parseInt(casilla.dataset.precio) || 0;
  const rentas = casilla.dataset.renta
    ? JSON.parse(casilla.dataset.renta)
    : [0];
  const duenoId = casilla.dataset.dueno;

  switch (opcion) {
    case "Comprar":
      if (jugador.money >= precio) {
        jugador.money -= precio;
        casilla.dataset.dueno = jugador.id;
        jugador.properties.push(casilla.id);
        renderJugadores();
      } else {
        alert(`${jugador.nick} no tiene suficiente dinero para comprar.`);
      }
      break;

    case "Pagar Renta":
      if (!duenoId) return;
      const dueno = jugadores.find((j) => j.id == duenoId);
      const nivel = parseInt(casilla.dataset.casas) || 0;
      const renta = rentas[nivel] || 0;
      if (jugador.money >= renta) {
        jugador.money -= renta;
        if (dueno) dueno.money += renta;
      } else {
        alert(`${jugador.nick} no tiene suficiente dinero para pagar renta.`);
      }
      renderJugadores();
      break;

    case "Construir Casa/Hotel":
      if (!jugador.properties.includes(casilla.id)) return;
      let casas = parseInt(casilla.dataset.casas) || 0;
      let hotel = casilla.dataset.hotel === "true";
      if (!hotel) {
        if (casas < 4 && jugador.money >= 100) {
          jugador.money -= 100;
          casas++;
          casilla.dataset.casas = casas;
        } else if (casas === 4 && jugador.money >= 250) {
          jugador.money -= 250;
          casilla.dataset.hotel = "true";
          casilla.dataset.casas = 0;
        }
      }
      renderJugadores();
      colocarFichas(jugadores);
      break;

    case "Pagar Impuesto":
      const impuesto = parseInt(casilla.dataset.impuesto) || 0;
      jugador.money -= impuesto;
      renderJugadores();
      break;

    case "Sacar Carta":
      const cambio = Math.floor(Math.random() * 201) - 100;
      jugador.money += cambio;
      renderJugadores();
      break;

    case "Ir a la Cárcel":
      jugador.inJail = true;
      jugador.jailTurns = 2;
      jugador.position = 10;
      colocarFichas(jugadores);
      renderJugadores();
      break;

    case "Cancelar":
      break;

    default:
      console.log("Opción desconocida:", opcion);
  }

  localStorage.setItem("monopoly_players", JSON.stringify(jugadores));
}
