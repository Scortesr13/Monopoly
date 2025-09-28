import { obtenerJugadores, renderJugadores } from "./ui.js";
import { jugarTurno,pasarTurno } from "./turnos.js";

// Botón para finalizar la partida y redirigir a finPartida.html
document.getElementById('btn-finPartida').addEventListener('click', function() {
  window.location.href = 'finPartida.html';
});
  
document
  .getElementById("btn-tirar-dados")
  .addEventListener("click", jugarTurno);
  

export function colocarFichas(jugadores) {
  // ❌ Elimina TODAS las fichas antes de volver a pintarlas
  document.querySelectorAll(".ficha").forEach((f) => f.remove());

  // ✅ Ahora pinta de nuevo cada ficha en la posición actual de su jugador
  jugadores.forEach((jugador) => {
    const casilla = document.getElementById(`casilla-${jugador.position}`);
    if (!casilla) return;

    const contenedor = casilla.querySelector(".contenedor-fichas");
    if (!contenedor) return;

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
  console.log("Tipo de casilla:", tipo);
const railroadsDueno = jugador.properties.filter((p) => p.tipo === "railroad");
  switch (tipo) {
    case "property": if (!casilla.dataset.dueno) {
        mostrarVentanaAccion(jugador, casilla, ["Comprar", "Cancelar"], jugadores, pasarTurno);
      } else if (casilla.dataset.dueno !== jugador.id) {
        mostrarVentanaAccion(jugador, casilla, ["Pagar Renta"], jugadores, pasarTurno);
      } else {
        mostrarVentanaAccion(jugador, casilla, ["Construir Casa/Hotel"], jugadores, pasarTurno);
      }
      break;
    case "railroad":   
      // Si ya es dueño de la propiedad
    if (casilla.dataset.dueno) {  
  if (casilla.dataset.dueno == jugador.id) {if (railroadsDueno.length >= 2) {
        construirEnRailroads(jugador, casilla);
        break;
        
      } else {
    alert("Ya eres dueño de esta propiedad.");
     
    pasarTurno();
    break;
  } }

}
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
  const action = casilla.dataset.action ? JSON.parse(casilla.dataset.action) : null;
  const nombre = casilla.dataset.nombre.toLowerCase();

  if (action && action.goTo === "jail") {
    // 👉 "Ve a la cárcel"
    jugador.position = 10; // posición de la cárcel
    jugador.inJail = true;
    jugador.jailTurns = 2;
    alert(`${jugador.nick} va directo a la Cárcel`);
    colocarFichas(jugadores);
  } else if (nombre.includes("salida")) {
    jugador.money += 200;
    alert(`${jugador.nick} pasó por Salida y recibe $200`);
  } else if (nombre.includes("cárcel")) {
    alert(`${jugador.nick} está solo de visita en la Cárcel`);
  } else if (nombre.includes("parqueo")) {
    alert(`${jugador.nick} está en Parqueo Gratis`);
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
  modal.classList.add("modal1");
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
  const precio = parseInt(casilla.dataset.precio) || 0;
  const rentas = casilla.dataset.renta ? JSON.parse(casilla.dataset.renta) : [0];
  const duenoId = casilla.dataset.dueno;

  switch (opcion) {
   case "Comprar":

  if (jugador.money >= precio) {
    jugador.money -= precio;
    casilla.dataset.dueno = jugador.id;

    // 🔄 Guardar propiedad como objeto completo con datos de la casilla
    jugador.properties.push({
      id: casilla.id,
      tipo: casilla.dataset.tipo || "property",
      nombre: casilla.dataset.nombre || "Propiedad",
      precio: parseInt(casilla.dataset.precio) || 0,
        color: casilla.dataset.color || "none",
      rentas: casilla.dataset.renta ? JSON.parse(casilla.dataset.renta) : [0],
      casas: 0,
      hotel: false,
      hipotecada: false
    });
     localStorage.setItem("monopoly_players", JSON.stringify(jugadores));

    renderJugadores();
  } else {
    alert(`${jugador.nick} no tiene suficiente dinero para comprar.`);
  }
  break;

case "Pagar Renta":
 if (!duenoId) return;
const dueno = jugadores.find((j) => j.id == duenoId);
const propiedadDueno = dueno?.properties.find((p) => p.id == casilla.id);

if (!propiedadDueno || propiedadDueno.hipotecada) {
  alert("La propiedad está hipotecada, no se paga renta.");
  break;
}

const rentData = JSON.parse(casilla.dataset.rent || "{}");
const casa = parseInt(propiedadDueno.casas || "0");

// 👉 si no hay casas → renta = dataset.renta (base)
let renta;
if (casa === 0) {
  renta = parseInt(casilla.dataset.renta || "0");
} else {
  renta = rentData[casa] || 0;
}

if (renta === 0) {
  alert(`No se cobra renta porque no hay casas construidas en ${casilla.dataset.nombre}`);
  break;
}

if (jugador.money >= renta) {
  jugador.money -= renta;
  dueno.money += renta;
  alert(`${jugador.nick} pagó $${renta} a ${dueno.nick}`);
} else {
  alert(`${jugador.nick} no tiene suficiente dinero para pagar la renta de $${renta}`);
}

renderJugadores();
break;


    case "Construir Casa/Hotel":
      const propiedadC = jugador.properties.find((p) => p.id === casilla.id);
      if (!propiedadC) return;

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

      // 🔄 sincronizar con jugador.properties
      propiedadC.casas = parseInt(casilla.dataset.casas);
      propiedadC.hotel = casilla.dataset.hotel === "true";

      renderJugadores();
      colocarFichas(jugadores);
      break;

    case "Pagar Impuesto":
      const impuesto = parseInt(casilla.dataset.impuesto) || 0;
      jugador.money += impuesto;
      renderJugadores();
      break;

    case "Sacar Carta":
      const cambio = Math.floor(Math.random() * 401) - 200;
      jugador.money += cambio;

      if (cambio > 0) {
        alert(`${jugador.nick} sacó una carta y ganó $${cambio}`);
      } else if (cambio < 0) {
        alert(`${jugador.nick} sacó una carta y perdió $${Math.abs(cambio)}`);
      } else {
        alert(`${jugador.nick} sacó una carta pero no ganó ni perdió dinero.`);
      }

      renderJugadores();
      break;

    case "Hipotecar Propiedad":
      
    case "Pagar Hipoteca":
     

    case "Ir a la Cárcel":
      jugador.inJail = true;
      jugador.jailTurns = 2;
      localStorage.setItem("monopoly_players", JSON.stringify(jugadores));
    
      
      renderJugadores();
      break;

    case "Cancelar":
      break;
  }

  localStorage.setItem("monopoly_players", JSON.stringify(jugadores));
}

function construirEnRailroads(jugador, casilla) {
  const modalExistente = document.getElementById("modal-construccion");
  if (modalExistente) modalExistente.remove();

  const modal = document.createElement("div");
  modal.id = "modal-construccion";
  modal.classList.add("modal1");

  modal.innerHTML = `
    <h3>${jugador.nick}, ¿quieres construir en ${casilla.dataset.nombre}?</h3>
    <button id="btnConstruir">Construir</button>
    <button id="btnCancelarConstruir">Cancelar</button>
  `;

  document.body.appendChild(modal);

  // evento construir
 // evento construir
document.getElementById("btnConstruir").addEventListener("click", () => {
  const propiedadR = jugador.properties.find((p) => p.id === casilla.id);
  if (!propiedadR) return;

  if (!propiedadR.casas) propiedadR.casas = 0;

  // 🚫 Máximo 4 casas
  if (propiedadR.casas >= 4) {
    alert(`${propiedadR.nombre} ya tiene el máximo de 4 casas.`);
    pasarTurno();
    modal.remove();
    return;
  }

  const costoConstruccion = 100; // 💰 cada casa vale 100
  if (jugador.money >= costoConstruccion) {
    jugador.money -= costoConstruccion;
    propiedadR.casas++; // contador de casas

    // 🔥 Actualizar también en el tablero (dataset del div)
    const divCasilla = document.querySelector(`[data-nombre="${propiedadR.nombre}"]`);
    if (divCasilla) {
      divCasilla.dataset.casas = propiedadR.casas;
    }

    alert(`${jugador.nick} construyó en ${propiedadR.nombre}. Total casas: ${propiedadR.casas}`);

    renderJugadores();
    pasarTurno();
  } else {
    alert(`${jugador.nick} no tiene suficiente dinero para construir.`);
    pasarTurno();
  }

  modal.remove();
});
}
function construirEnPropiedad(jugador, casilla) {
  const modalExistente = document.getElementById("modal-construccion");
  if (modalExistente) modalExistente.remove();

  const modal = document.createElement("div");
  modal.id = "modal-construccion";
  modal.classList.add("modal1");

  modal.innerHTML = `
    <h3>${jugador.nick}, ¿quieres construir en ${casilla.dataset.nombre}?</h3>
    <button id="btnConstruir">Construir</button>
    <button id="btnCancelarConstruir">Cancelar</button>
  `;

  document.body.appendChild(modal);

  document.getElementById("btnConstruir").addEventListener("click", () => {
    const propiedad = jugador.properties.find((p) => p.id == casilla.id);
    if (!propiedad) return;

    if (!propiedad.casas) propiedad.casas = 0;
    if (!propiedad.hotel) propiedad.hotel = false;

    // 🔎 verificar que el jugador tiene todas las propiedades del mismo color
    const colorGrupo = casilla.dataset.color; // asegúrate de tener esta info en el dataset
    const propiedadesColor = jugador.properties.filter((p) => p.color === colorGrupo);

    const todasDelColor = tablero.filter((c) => c.type === "property" && c.color === colorGrupo);
    if (propiedadesColor.length < todasDelColor.length) {
      alert("Debes tener todas las propiedades del mismo color para construir.");
      modal.remove();
      return;
    }

    // 🏠 Construcción de casas
    if (propiedad.casas < 4 && !propiedad.hotel) {
      const costoConstruccion = 100; // o sacarlo de casilla.price
      if (jugador.money >= costoConstruccion) {
        jugador.money -= costoConstruccion;
        propiedad.casas++;
        casilla.dataset.casas = propiedad.casas;

        alert(`${jugador.nick} construyó una casa en ${propiedad.nombre}. Total casas: ${propiedad.casas}`);
      } else {
        alert("No tienes suficiente dinero para construir una casa.");
      }
    }
    // 🏨 Construcción de hotel
    else if (propiedad.casas === 4 && !propiedad.hotel) {
      const costoHotel = 200;
      if (jugador.money >= costoHotel) {
        jugador.money -= costoHotel;
        propiedad.casas = 0;
        propiedad.hotel = true;
        casilla.dataset.casas = 0;
        casilla.dataset.hotel = true;

        alert(`${jugador.nick} construyó un HOTEL en ${propiedad.nombre}.`);
      } else {
        alert("No tienes suficiente dinero para construir un hotel.");
      }
    } else {
      alert("No puedes construir más aquí.");
    }

    renderJugadores();
    pasarTurno();
    modal.remove();
  });

  document.getElementById("btnCancelarConstruir").addEventListener("click", () => {
    pasarTurno();
    modal.remove();
  });
}
function construirEnPropiedad(jugador, casilla) {
  const modalExistente = document.getElementById("modal-construccion");
  if (modalExistente) modalExistente.remove();

  const modal = document.createElement("div");
  modal.id = "modal-construccion";
  modal.classList.add("modal1");

  modal.innerHTML = `
    <h3>${jugador.nick}, ¿quieres construir en ${casilla.dataset.nombre}?</h3>
    <button id="btnConstruir">Construir</button>
    <button id="btnCancelarConstruir">Cancelar</button>
  `;

  document.body.appendChild(modal);

  document.getElementById("btnConstruir").addEventListener("click", () => {
    const propiedad = jugador.properties.find((p) => p.id == casilla.id);
    if (!propiedad) return;

    if (!propiedad.casas) propiedad.casas = 0;
    if (!propiedad.hotel) propiedad.hotel = false;

    // 🔎 verificar que el jugador tiene todas las propiedades del mismo color
    const colorGrupo = casilla.dataset.color; // asegúrate de tener esta info en el dataset
    const propiedadesColor = jugador.properties.filter((p) => p.color === colorGrupo);

    const todasDelColor = tablero.filter((c) => c.type === "property" && c.color === colorGrupo);
    if (propiedadesColor.length < todasDelColor.length) {
      alert("Debes tener todas las propiedades del mismo color para construir.");
      modal.remove();
      return;
    }

    // 🏠 Construcción de casas
    if (propiedad.casas < 4 && !propiedad.hotel) {
      const costoConstruccion = 100; // o sacarlo de casilla.price
      if (jugador.money >= costoConstruccion) {
        jugador.money -= costoConstruccion;
        propiedad.casas++;
        casilla.dataset.casas = propiedad.casas;

        alert(`${jugador.nick} construyó una casa en ${propiedad.nombre}. Total casas: ${propiedad.casas}`);
      } else {
        alert("No tienes suficiente dinero para construir una casa.");
      }
    }
    // 🏨 Construcción de hotel
    else if (propiedad.casas === 4 && !propiedad.hotel) {
      const costoHotel = 200;
      if (jugador.money >= costoHotel) {
        jugador.money -= costoHotel;
        propiedad.casas = 0;
        propiedad.hotel = true;
        casilla.dataset.casas = 0;
        casilla.dataset.hotel = true;

        alert(`${jugador.nick} construyó un HOTEL en ${propiedad.nombre}.`);
      } else {
        alert("No tienes suficiente dinero para construir un hotel.");
      }
    } else {
      alert("No puedes construir más aquí.");
    }

    renderJugadores();
    pasarTurno();
    modal.remove();
  });

  document.getElementById("btnCancelarConstruir").addEventListener("click", () => {
    pasarTurno();
    modal.remove();
  });
}
function puedeConstruir(jugador, casilla, tablero) {
  const colorGrupo = casilla.dataset.color;
  if (!colorGrupo) return false; // sin color no se puede construir

  // Filtrar propiedades del jugador con ese color
  const propiedadesColor = jugador.properties.filter(p => p.color === colorGrupo);

  // Contar cuántas propiedades del mismo color existen en el tablero
  const propiedadesTotalesColor = tablero.filter(c => c.type === "property" && c.color === colorGrupo);

  // Condicional según la cantidad de propiedades del jugador
  if (propiedadesColor.length < 2) {
    // 🟥 Solo tiene 1 propiedad del color → no puede construir
    return false;
  } else if (propiedadesColor.length === 2) {
    // 🟨 Tiene 2 propiedades → puede construir parcialmente (quizá solo cobrar renta incrementada)
    return true;
  } else if (propiedadesColor.length >= 3) {
    // 🟩 Tiene 3 o más propiedades → puede construir casas normalmente
    return true;
  }

  return false;
}

// Uso dentro de tu acción:
if (puedeConstruir(jugador, casilla, tablero)) {
  construirEnPropiedad(jugador, casilla);
} else {
  alert("No puedes construir porque no tienes suficientes propiedades del mismo color.");
}
