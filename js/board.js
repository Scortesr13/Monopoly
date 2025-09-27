import { obtenerJugadores, renderJugadores, dibujarTablero } from "./ui.js";
import { obtenerTablero } from "./api.js";
import { colocarFichas } from "./game.js";
import { jugadorActual } from "./turnos.js";

// Función para lanzar dados con animación
function lanzarDadosAnimacion() {
  const dado1 = Math.floor(Math.random() * 6) + 1;
  const dado2 = Math.floor(Math.random() * 6) + 1;
  const total = dado1 + dado2;
  
  console.log("Lanzando dados:", dado1, dado2, total); // Para debug
  
  // Crear contenedor de dados si no existe
  const infoExtra = document.getElementById('info-extra');
  if (!infoExtra) {
    console.error("No se encontró el elemento info-extra");
    return { dado1, dado2, total };
  }
  
  if (!document.getElementById('dados-container')) {
    infoExtra.innerHTML = `
      <div class="dados-container" id="dados-container">
        <div class="dado" id="dado1">?</div>
        <div class="dado" id="dado2">?</div>
      </div>
    `;
  }
  
  // Animación de dados
  const dadoElement1 = document.getElementById('dado1');
  const dadoElement2 = document.getElementById('dado2');
  const resultado = document.getElementById('resultado-dados');
  
  if (!dadoElement1 || !dadoElement2) {
    console.error("No se encontraron los elementos de dados");
    return { dado1, dado2, total };
  }
  
  // Deshabilitar botón durante la animación
  const btnTirar = document.getElementById('btn-tirar-dados');
  if (btnTirar) btnTirar.disabled = true;
  
  // Animación
  dadoElement1.classList.add('lanzando');
  dadoElement2.classList.add('lanzando');
  
  setTimeout(() => {
    dadoElement1.textContent = dado1;
    dadoElement2.textContent = dado2;
    dadoElement1.classList.remove('lanzando');
    dadoElement2.classList.remove('lanzando');
    
    if (resultado) {
      resultado.textContent = `Resultado: ${dado1} + ${dado2} = ${total}`;
      resultado.style.color = '#f0d483';
      resultado.style.fontWeight = 'bold';
    }
    
    // Habilitar botón
    if (btnTirar) btnTirar.disabled = false;
    
    // Aquí puedes agregar la lógica de movimiento después de la animación
    console.log(`Dados: ${dado1} + ${dado2} = ${total}`);
    // moverJugador(total); // Esta función la implementarás después
    
  }, 600);
  
  return { dado1, dado2, total };
}

// Event listener principal
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM cargado - inicializando tablero");
  
  obtenerTablero()
    .then((datos) => {
      const casillas = [
        ...datos.bottom,
        ...datos.left,
        ...datos.top,
        ...datos.right,
      ];

      dibujarTablero(casillas);
      renderJugadores();

      // Jugadores desde localStorage
      const jugadores = obtenerJugadores();
      console.log("Jugadores cargados:", jugadores);

      // Configurar botón de dados
      const btnTirar = document.getElementById('btn-tirar-dados');
      if (btnTirar) {
        btnTirar.addEventListener('click', () => {
          console.log("Botón de dados clickeado");
          lanzarDadosAnimacion();
        });
      } else {
        console.error("No se encontró el botón btn-tirar-dados");
      }

      // Configurar botón de finalizar partida
      const btnFinPartida = document.getElementById('btn-finPartida');
      if (btnFinPartida) {
        btnFinPartida.addEventListener('click', () => {
          if (confirm('¿Estás seguro de que quieres finalizar la partida?')) {
            window.location.href = 'finPartida.html';
          }
        });
      }

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
    if (casilla) {
      const comprarBtn = casilla.querySelector(".comprar-btn");
      if (comprarBtn) comprarBtn.remove();
      casilla.innerHTML += `<br/><span>Dueño: ${jugadorActual.nick}</span>`;
    }

    renderJugadores(); // refrescar panel de jugadores
  } else {
    alert(
      `${jugadorActual.nick} no tiene suficiente dinero para comprar esta propiedad.`
    );
  }
}

// Exportar la función de dados para uso externo
export { lanzarDadosAnimacion as lanzarDados };