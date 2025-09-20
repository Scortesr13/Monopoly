import { obtenerJugadores, renderJugadores } from "./ui.js";
import { jugarTurno,pasarTurno } from "./turnos.js";

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

export function moverJugador(jugador, pasos, totalCasillas, jugadores) {
  const casillaAnterior = document.getElementById(
    `casilla-${jugador.position}`
  );

  console.log("Moviendo jugador:", jugador, "Pasos:", pasos, "Total Casillas:", totalCasillas);

  // actualizar posición con wrap-around
  jugador.position = (jugador.position + pasos) % totalCasillas;

  // Usar el array que ya tienes en memoria
  colocarFichas(jugadores);

  const casillaActual = document.getElementById(`casilla-${jugador.position}`);
  accionCasilla(jugador, casillaActual, jugadores); // ⚡ ahora sí pasa jugadores
}

export function accionCasilla(jugador, casilla, jugadores) {
  if (!casilla) return;
  console.log(`${jugador.nick} cayó en casilla:`, casilla);

  const tipo = casilla.dataset.tipo;

  switch (tipo) {
    case "property":
    case "railroad":
      if (!casilla.dataset.dueno) {
        mostrarVentanaAccion(jugador, casilla, ["Comprar", "Cancelar"], jugadores, pasarTurno);
      } else if (casilla.dataset.dueno !== jugador.id) {
        mostrarVentanaAccion(jugador, casilla, ["Pagar Renta"], jugadores, pasarTurno);
      } else {
        mostrarVentanaAccion(jugador, casilla, ["Construir Casa/Hotel"], jugadores, pasarTurno);
      }
      break;

    case "tax":
      mostrarVentanaAccion(jugador, casilla, ["Pagar Impuesto"], jugadores, pasarTurno);
      break;

    case "community_chest":
    case "chance":
      mostrarVentanaAccion(jugador, casilla, ["Sacar Carta"], jugadores, pasarTurno);
      break;

    case "special":
      const nombre = casilla.dataset.nombre.toLowerCase();
      if (nombre.includes("salida")) {
        jugador.money += 200;
        alert(`${jugador.nick} pasó por Salida y recibe $200`);
      } else if (nombre.includes("cárcel")) {
        alert(`${jugador.nick} está solo de visita en la Cárcel`);
      } else if (nombre.includes("parqueo")) {
        alert(`${jugador.nick} está en Parqueo Gratis`);
      } else if (nombre.includes("ve a la cárcel")) {
        jugador.position = 10;
        jugador.inJail = true;
        jugador.jailTurns = 2;
        alert(`${jugador.nick} va a la Cárcel`);
        colocarFichas(jugadores);
      }
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
      modal.remove();
      pasarTurno();
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
    console.log("Manejando acción:", opcion, "para jugador:", jugador);
  console.log("Jugadores en manejarAccion:", jugadores);
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
  }

  // Siempre persistir al localStorage
  localStorage.setItem("monopoly_players", JSON.stringify(jugadores));
}
