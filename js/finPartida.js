console.log("finPartida.js cargado");

function obtenerJugadores() {
    const dataRaw = localStorage.getItem("monopoly_players");
    console.log("Datos en localStorage:", dataRaw);
    return dataRaw ? JSON.parse(dataRaw) : [];
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('btn-restart').addEventListener('click', async () => {
        // Eliminar todos los datos del localStorage
        localStorage.clear();
        console.log("✅ LocalStorage limpiado");

        alert('La partida se reiniciará. Serás redirigido a la página principal.');
        window.location.href = 'index.html';
    });

    document.getElementById('btn-cargar-ranking').addEventListener('click', async () => {
        // Oculta la pantalla de fin de partida
        document.getElementById('end-screen').style.display = 'none';
        // Muestra el ranking
        let contenedor = document.getElementById("ranking-lista");
        if (!contenedor) {
            contenedor = document.createElement("div");
            contenedor.id = "ranking-lista";
            contenedor.className = "ranking-lista";
            document.body.appendChild(contenedor);
        }
        contenedor.style.display = "block";

        await enviarRankingFinal();
        mostrarRanking();
    });

    

});

// 1. Función para calcular el patrimonio neto de cada jugador
export function calcularPatrimonio(jugador) {
    let patrimonio = jugador.money;
    if (Array.isArray(jugador.properties)) {
        jugador.properties.forEach((p) => {
            patrimonio += p.precio || 0;
            patrimonio += (p.casas || 0) * 100;
            patrimonio += (p.hotel ? 200 : 0);
            if (p.hipotecada) patrimonio -= p.precio || 0;
        });
    }
    return patrimonio;
}

// 2. Función para enviar el score al backend
export async function enviarScore(jugador, score) {
    console.log(`Enviando score de ${jugador.nick}: ${score}`);
    try {
        await fetch("http://127.0.0.1:5000/score-recorder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                nick_name: jugador.nick,
                score: score,
                country_code: jugador.bandera?.toLowerCase() || "xx"
            })
        });
    } catch (e) {
        console.error("Error enviando score:", e);
    }
}
// 3. Función para mostrar el ranking consultando el backend
export async function mostrarRanking() {
    try {
        const res = await fetch("http://127.0.0.1:5000/ranking");
        const ranking = await res.json();
        const contenedor = document.getElementById("ranking-lista");
        if (!contenedor) return;

        // Título + botón regresar
        contenedor.innerHTML = `
            <div >
                <h2>Ranking</h2>
                <button id="btn-regresar" class="btn-regresar" title="Volver al juego">↩</button>
            </div>
        `;

        ranking.forEach((jugador, idx) => {
            console.log(jugador.nick_name, jugador.score, jugador.country_code);
            contenedor.innerHTML += `
                <div class="ranking-item">
                    <span class="posicion">${idx + 1}.</span>
                    <img src="https://flagsapi.com/${jugador.country_code.toUpperCase()}/shiny/64.png" alt="${jugador.country_code}"/>
                    <span class="nick">${jugador.nick_name}</span>
                    <span class="score">💰 ${jugador.score}</span>
                </div>
            `;
        });

        // 🎯 Evento del botón regresar
        const btnRegresar = document.getElementById("btn-regresar");
        btnRegresar.addEventListener("click", () => {
            window.location.href = 'finPartida.html';
            // aquí vuelves a mostrar la lista de jugadores
            // por ejemplo:
            // renderJugadores();
        });

    } catch (e) {
        console.error("Error obteniendo ranking:", e);
    }
}


// 4. Lógica para usar estas funciones al finalizar la partida
export async function enviarRankingFinal() {

    const jugadores = obtenerJugadores();

    // Solo enviamos al backend si aún no fue enviado
    
        for (const j of jugadores) {
            const patrimonio = calcularPatrimonio(j);
            await enviarScore(j, patrimonio);
        
        localStorage.setItem("ranking_enviado", "true");
        console.log("✅ Scores enviados al backend");
     }


    // Mostrar ganador/empate en consola
    console.log("🏆 Resultado final:");
    console.log(obtenerGanador(jugadores));

    // (opcional) mostrarlo en la interfaz
    let contenedorGanador = document.getElementById("ganador");
    if (!contenedorGanador) {
        contenedorGanador = document.createElement("div");
        contenedorGanador.id = "ganador";
        contenedorGanador.className = "ganador";
        document.body.appendChild(contenedorGanador);
    }
    contenedorGanador.innerText = obtenerGanador(jugadores);
}

// Obtener al ganador (el que tenga más dinero)

function obtenerGanador(jugadores) {
    if (!jugadores.length) return null;

    // Calculamos el patrimonio de cada jugador
    const patrimonios = jugadores.map(j => ({
        nombre: j.nick,
        patrimonio: calcularPatrimonio(j)
    }));

    // Ordenamos de mayor a menor
    patrimonios.sort((a, b) => b.patrimonio - a.patrimonio);

    // El mayor patrimonio
    const maxPatrimonio = patrimonios[0].patrimonio;

    // Filtramos jugadores con ese patrimonio
    const ganadores = patrimonios.filter(j => j.patrimonio === maxPatrimonio);

    if (ganadores.length === 1) {
        return `El ganador es ${ganadores[0].nombre} con un patrimonio de ${maxPatrimonio}`;
    } else {
        const nombres = ganadores.map(g => g.nombre).join(", ");
        return `Empate entre ${nombres} con un patrimonio de ${maxPatrimonio}`;
    }
}
