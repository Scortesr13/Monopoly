import { Jugador } from "./jugador.js";
import { manejarCompra } from "./board.js";
import { colocarFichas } from "./game.js";

export function renderJugadores() {
  const jugadores = obtenerJugadores();

  // 1️⃣ Actualizar el sidebar
  const contenedor = document.getElementById("jugadores-lista");
  contenedor.innerHTML = "";

  jugadores.forEach((j) => {
    const div = document.createElement("div");
    div.classList.add("jugador-card");
    div.style.setProperty("--color-ficha", j.color || "#000");

    div.innerHTML = `
      <div class="jugador-header">
        <span class="iniciales">${j.nick.slice(0, 2).toUpperCase()}</span>
        <span class="bandera">${j.bandera || "🌍"}</span>
      </div>

      <div class="dinero">💵 $${j.money}</div>

      <div class="propiedades">
        <strong>Propiedades:</strong>
        <ul>
          ${
            j.properties.length > 0
              ? j.properties.map((p) => `<li>${p}</li>`).join("")
              : "<li>Ninguna</li>"
          }
        </ul>
      </div>

      <div class="estado">
        <p>🏦 Hipoteca: ${j.hipoteca ? "Sí" : "No"}</p>
        <p>💳 Préstamos: ${j.prestamos || 0}</p>
      </div>
    `;
    contenedor.appendChild(div);
  });

  // 2️⃣ Actualizar fichas en el tablero
  colocarFichas(jugadores);
}
export function guardarJugadores(jugadores) {
  const planos = jugadores.map(j => ({
    id: j.id,
    nick: j.nick,
    color: j.color,
    bandera: j.bandera,
    money: j.money,
    position: j.position,
    properties: j.properties,
    inJail: j.inJail,
    jailTurns: j.jailTurns,
    hipoteca: j.hipoteca,
    prestamos: j.prestamos
  }));

  localStorage.setItem("monopoly_players", JSON.stringify(planos));
}
// 🔹 Recuperar jugadores como instancias de la clase Jugador
export function obtenerJugadores() {
  const dataRaw = localStorage.getItem("monopoly_players");
  if (!dataRaw) return [];

  try {
    const data = JSON.parse(dataRaw);
    return data.map(j => new Jugador(
      j.id,
      j.nick,
      j.color,
      j.bandera,
      j.money,
      j.position
    ));
  } catch (e) {
    console.error("Error al obtener jugadores:", e);
    return [];
  }
}


// 🔹 Renderizar el tablero
export function dibujarTablero(casillas) {
  const tablero = document.getElementById("tablero");
  tablero.innerHTML = "";

  casillas.forEach((casilla, index) => {
    const div = document.createElement("div");
    div.classList.add("casilla");
    div.id = `casilla-${casilla.id}`;

    // ✅ Datasets necesarios
    div.dataset.tipo = casilla.type || "desconocido";
    div.dataset.nombre = casilla.name || casilla.type || "Sin nombre";
    div.dataset.precio = casilla.price || 0;
    div.dataset.casas = casilla.houses || 0;
    div.dataset.hotel = casilla.hotel || false;
    div.dataset.dueno = casilla.owner ? casilla.owner.id : "";
    div.dataset.renta = JSON.stringify(casilla.rent || [0]);
    div.dataset.impuesto = casilla.tax || 0;

    // 👉 Colocar la casilla en la posición correcta
    const pos = getGridPosition(index);
    div.style.gridRow = pos.row;
    div.style.gridColumn = pos.col;

    // Franja de color si es propiedad
    if (casilla.type === "property" && casilla.color) {
      const strip = document.createElement("div");
      strip.classList.add("color-strip");
      strip.style.background = casilla.color;
      div.appendChild(strip);
    }

    // Estado dinámico
    const estado = document.createElement("div");
    estado.classList.add("estado");

    if (!casilla.owner) {
      estado.textContent = "Disponible";
    } else {
      estado.textContent =
        casilla.houses && casilla.houses > 0
          ? `Dueño: ${casilla.owner.nick} - ${casilla.houses} casas`
          : casilla.hotel
          ? `Dueño: ${casilla.owner.nick} - Hotel`
          : `Dueño: ${casilla.owner.nick}`;
      estado.classList.add("dueño");
      estado.style.background = casilla.owner.color || "black";
    }
    div.appendChild(estado);

    // Nombre de la casilla
    const nombre = document.createElement("div");
    nombre.classList.add("nombre-casilla");
    nombre.textContent = casilla.name || casilla.type || "Sin nombre";
    div.appendChild(nombre);

    // Contenedor de fichas
    const contenedorFichas = document.createElement("div");
    contenedorFichas.classList.add("contenedor-fichas");
    div.appendChild(contenedorFichas);

    tablero.appendChild(div);
  });
}

// 🔹 Calcula posición en el contorno de una cuadrícula 11x11
export function getGridPosition(index) {
  if (index < 11) {
    return { row: 11, col: 11 - index }; // abajo
  } else if (index < 20) {
    return { row: 11 - (index - 10), col: 1 }; // izquierda
  } else if (index < 31) {
    return { row: 1, col: index - 20 + 1 }; // arriba
  } else {
    return { row: index - 30 + 1, col: 11 }; // derecha
  }
}

// 🔹 Exportar funciones que usará el tablero
