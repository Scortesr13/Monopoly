// turnos.js
import { moverJugador } from "./game.js";
import { renderJugadores, obtenerJugadores } from "./ui.js";

let jugadores = obtenerJugadores();
let turno = 0;
const totalCasillas = 40;
mostrarTurno(jugadores[turno]);

export function tirarDados() {
  const dado1 = Math.floor(Math.random() * 6) + 1;
  const dado2 = Math.floor(Math.random() * 6) + 1;
  const total = parseInt(prompt("Ingresa el total de los dados:")) || 0;

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
       localStorage.setItem("monopoly_players", JSON.stringify(jugadores));
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
  mostrarTurno(jugadores[turno]);
  alert(`Turno de ${jugadores[turno].nick}`);
}

export function jugadorActual() {
  return jugadores[turno];
}
// 🎯 Botones principales
const btnHipotecar = document.getElementById("btnHipotecar");
const btnDeshipotecar = document.getElementById("btnDeshipotecar");

// ✅ Evento para hipotecar
btnHipotecar.addEventListener("click", () => {
  mostrarVentanaHipoteca("hipotecar");
});

// ✅ Evento para deshipotecar
btnDeshipotecar.addEventListener("click", () => {
  mostrarVentanaHipoteca("deshipotecar");
});


// 🪟 Función que crea la ventana
function mostrarVentanaHipoteca(accion) {
  const jugador = jugadores[turno]; // jugador actual
  let propiedadesDisponibles = [];

  if (accion === "hipotecar") {
    propiedadesDisponibles = jugador.properties.filter(p => !p.hipotecada);
  } else {
    propiedadesDisponibles = jugador.properties.filter(p => p.hipotecada);
  }

  if (propiedadesDisponibles.length === 0) {
    alert(`No tienes propiedades para ${accion}.`);
    return;
  }

  // 🔄 Renderizar ventana
 const contenedor = document.createElement("div");
  contenedor.classList.add("ventana-acciones");

  // Generar HTML de la ventana
  contenedor.innerHTML = `
    <div class=" modal1">
      <h3>${accion === "hipotecar" ? "Hipotecar propiedades" : "Liberar hipotecas"}</h3>
      <ul class="lista-propiedades">
        ${propiedadesDisponibles
          .map(
            (p) => `
          <li>
            ${p.nombre || "Sin nombre"} - 💵 $${p.precio || 0} - color-${p.color}
            <button class="btnAccion" data-id="${p.id}" data-accion="${accion}">
              ${accion === "hipotecar" ? "💣" : "💲"}
            </button>
          </li>`
          )
          .join("")}
      </ul>
      <button id="cerrarVentana">❌ Cerrar</button>
    </div>
  `;

  document.body.appendChild(contenedor);

  // 📌 Eventos de los botones dinámicos
  contenedor.querySelectorAll(".btnAccion").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const idProp = e.target.dataset.id;
      const accionProp = e.target.dataset.accion;
      manejarHipoteca(jugador, idProp, accionProp);
      contenedor.remove(); // cerrar ventana después de la acción
    });
  });

  // ❌ cerrar ventana
  document.getElementById("cerrarVentana").addEventListener("click", () => {
    contenedor.remove();
  });
}


// ⚙️ Lógica hipotecar/deshipotecar
function manejarHipoteca(jugador, idProp, accion) {
  const propiedad = jugador.properties.find((p) => p.id === idProp);
  const casilla = document.getElementById(idProp);

  const precio = parseInt(casilla.dataset.precio) || 200;
  const mortgageValue = Math.floor(precio / 2);

  if (accion === "hipotecar" && !propiedad.hipotecada) {
    propiedad.hipotecada = true;
    casilla.dataset.banco = mortgageValue; // 💰 se registra en dataset
    jugador.money += mortgageValue;
    jugador.prestamos += mortgageValue;
    alert(`${jugador.nick} hipotecó ${idProp} por $${mortgageValue}`);
    localStorage.setItem("monopoly_players", JSON.stringify(jugadores));
  }

  if (accion === "deshipotecar" && propiedad.hipotecada) {
    const deuda = mortgageValue + Math.floor(mortgageValue * 0.1);
    if (jugador.money >= deuda) {
      propiedad.hipotecada = false;
      casilla.dataset.banco = 0; // 🔄 limpiar deuda
      jugador.money -= deuda;
      jugador.prestamos -= mortgageValue;
      localStorage.setItem("monopoly_players", JSON.stringify(jugadores));
      alert(`${jugador.nick} liberó la hipoteca de ${idProp} pagando $${deuda}`);
    } else {
      alert("No tienes suficiente dinero para liberar esta hipoteca.");
    }
  }

  renderJugadores();
}
function mostrarTurno(jugador) {
  const turnoDiv = document.getElementById("turno-actual");
  if (!turnoDiv) return;

  turnoDiv.textContent = `🎲 Turno de: ${jugador.nick}`;
  turnoDiv.style.background = jugador.color || "#ccc";
}



