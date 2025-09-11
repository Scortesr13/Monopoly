



document.addEventListener("DOMContentLoaded", async () => {
  const datos = await obtenerTablero();

  // Siempre será un array gracias a la corrección
  const casillas = [
    ...datos.bottom,
    ...datos.left,
    ...datos.top,
    ...datos.right
  ];

  dibujarTablero(casillas);

  // Jugadores desde localStorage
  const jugadores =
    JSON.parse(localStorage.getItem("monopoly_players")) || [];
  console.log("Jugadores cargados:", jugadores);
});
function manejarCompra(idCasilla, precio) {
  const jugadores = JSON.parse(localStorage.getItem('monopoly_players')) || [];
  const jugadorActual = jugadores[0]; // Por ahora usamos el primero

  if (jugadorActual.money >= precio) {
    jugadorActual.money -= precio;
    alert(`${jugadorActual.nick} compró ${idCasilla} por $${precio}.`);

    // Aquí podrías actualizar el backend o el estado local
    // Por ahora solo actualizamos localStorage
    localStorage.setItem('monopoly_players', JSON.stringify(jugadores));

    // Opcional: marcar visualmente la casilla como comprada
    const casilla = document.getElementById(`casilla-${idCasilla}`);
    casilla.querySelector('.comprar-btn').remove();
    casilla.innerHTML += `<br/><span>Dueño: ${jugadorActual.nick}</span>`;
  } else {
    alert(`${jugadorActual.nick} no tiene suficiente dinero para comprar esta propiedad.`);
  }}