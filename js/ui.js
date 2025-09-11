function dibujarTablero(casillas) {
  const tablero = document.getElementById("tablero");
  tablero.innerHTML = "";

  casillas.forEach((casilla, index) => {
    const div = document.createElement("div");
    div.classList.add("casilla");

    // Calcular posición en la grilla (fila y columna)
    const pos = getGridPosition(index);
    div.style.gridRow = pos.row;
    div.style.gridColumn = pos.col;

    // Usar nombre o tipo como fallback
    const nombre = casilla.name || casilla.type || "Sin nombre";
    div.id = `casilla-${casilla.id}`;
    div.textContent = nombre;

    // Si es propiedad con precio → mostrar botón de compra
    if (casilla.type === "property" && casilla.price) {
      const btn = document.createElement("button");
      btn.textContent = `Comprar ($${casilla.price})`;
      btn.classList.add("comprar-btn");
      btn.addEventListener("click", () =>
        manejarCompra(casilla.id, casilla.price)
      );
      div.appendChild(btn);
    }

    tablero.appendChild(div);
  });
}


// Calcula posición en el contorno de una cuadrícula 11x11
function getGridPosition(index) {
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
