document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('btn-restart').addEventListener('click', () => {
        alert('La partida se reiniciará. Serás redirigido a la página principal.');
        window.location.href = '../index.html';
    });
});
