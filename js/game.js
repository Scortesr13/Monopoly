import { obtenerJugadores, renderJugadores } from "./ui.js";
import { jugarTurno,pasarTurno } from "./turnos.js";

// Botón para finalizar la partida y redirigir a finPartida.html
document
  .getElementById('btn-finPartida')
  .addEventListener('click', window.location.href = 'finPartida.html');
  
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

  switch (tipo) {
    case "property":
    case "railroad":    if (casilla.dataset.dueno) {
  if (casilla.dataset.dueno == jugador.id) {
    alert("Ya eres dueño de esta propiedad.");
    pasarTurno();
    break;
  } 

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

  // 🔎 Buscar la propiedad en el dueño
  const propiedadDueno = dueno?.properties.find((p) => p.id === casilla.id);

  // 🚫 Si no existe o está hipotecada, no se cobra
  if (!propiedadDueno || propiedadDueno.hipotecada) {
    alert("La propiedad está hipotecada, no se paga renta.");
    break;
  }

  // 📊 Obtener array de rentas desde la casilla
  const rentas = JSON.parse(casilla.dataset.renta || "[0]");
  console.log("Rentas disponibles:", rentas);

  // Nivel de casas/hotel según el dueño
  const nivel = propiedadDueno.hotel ? 5 : propiedadDueno.casas; // ej: rentas[5] para hotel
  const renta = rentas[nivel] || 0;

  if (jugador.money >= rentas) {
    jugador.money -= rentas;
    dueno.money += rentas;
    alert(`${jugador.nick} pagó $${rentas} a ${dueno.nick}`);
  } else {
    alert(`${jugador.nick} no tiene suficiente dinero para pagar la renta de $${rentas}.`);
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
      if (jugador.properties.length === 0) return;

      const propH = prompt(
        `${jugador.nick}, ¿qué propiedad deseas hipotecar?\n${jugador.properties.map((p) => p.id).join(", ")}`
      );

      const propiedadH = jugador.properties.find((p) => p.id === propH);
      if (propiedadH && !propiedadH.hipotecada) {
        const mortgageValue = Math.floor(precio / 2) || 100;
        jugador.money += mortgageValue;
        jugador.prestamos += mortgageValue;

        propiedadH.hipotecada = true;

        // 🔄 actualizar casilla
        const casillaH = document.getElementById(propiedadH.id);
        if (casillaH) casillaH.dataset.hipoteca = "true";

        alert(`${jugador.nick} hipotecó ${propH} y recibió $${mortgageValue}`);
        renderJugadores();
      }
      break;

    case "Pagar Hipoteca":
      if (jugador.prestamos <= 0) {
        alert(`${jugador.nick} no tiene hipotecas activas.`);
        break;
      }

      const propD = prompt(
        `${jugador.nick}, ¿qué propiedad quieres recuperar?\n${jugador.properties.filter((p) => p.hipotecada).map((p) => p.id).join(", ")}`
      );

      const propiedadD = jugador.properties.find((p) => p.id === propD);
      if (propiedadD && propiedadD.hipotecada) {
        const mortgageValue = Math.floor(precio / 2) || 100;
        const deuda = mortgageValue + Math.floor(mortgageValue * 0.1);

        if (jugador.money >= deuda) {
          jugador.money -= deuda;
          jugador.prestamos -= mortgageValue;
          propiedadD.hipotecada = false;

          // 🔄 actualizar casilla
          const casillaD = document.getElementById(propiedadD.id);
          if (casillaD) casillaD.dataset.hipoteca = "false";

          alert(`${jugador.nick} pagó la hipoteca de ${propD} por $${deuda}`);
          renderJugadores();
        } else {
          alert(`${jugador.nick} no tiene suficiente dinero para pagar la hipoteca.`);
        }
      }
      break;

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
