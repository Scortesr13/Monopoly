import { Jugador } from "./jugador.js"; 
import { fetchCountries } from "./api.js";

const TOKENS = [
  { id: "red", label: "🔴 Rojo" },
  { id: "blue", label: "🔵 Azul" },
  { id: "green", label: "🟢 Verde" },
  { id: "yellow", label: "🟡 Amarillo" },
];

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".player-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const n = parseInt(btn.dataset.players, 10);
      await handlePlayersChosen(n);
    });
  });
});

async function handlePlayersChosen(numPlayers) {
  const startScreen = document.getElementById("start-screen");
  const setupScreen = document.getElementById("setup-screen");
  const message = document.getElementById("message");

  message.textContent = `Cargando configuración para ${numPlayers} jugador(es)...`;
  const countries = await fetchCountries();
  renderPlayerSetup(numPlayers, countries);

  startScreen.classList.add("hidden");
  setupScreen.classList.remove("hidden");
  message.textContent = "";
}

function renderPlayerSetup(numPlayers, countries) {
  const container = document.getElementById("setup-screen");
  container.innerHTML = "";

  const title = document.createElement("h2");
  title.textContent = "Configura los jugadores";
  title.className = "setup-title";
  container.appendChild(title);

  const form = document.createElement("div");
  form.id = "players-form";
  container.appendChild(form);

  for (let i = 1; i <= numPlayers; i++) {
    const block = document.createElement("div");
    block.className = "player-setup-block";
    block.dataset.player = i;

    const h = document.createElement("h3");
    h.textContent = `Jugador ${i}`;
    block.appendChild(h);

    // Nickname
    const nickLabel = document.createElement("label");
    nickLabel.innerHTML = `Nick: <input type="text" class="nick-input" data-player="${i}" placeholder="Nombre del jugador ${i}" />`;
    block.appendChild(nickLabel);

    // Fichas (radio buttons)
    const tokenDiv = document.createElement("div");
    tokenDiv.className = "token-container";
    tokenDiv.innerHTML = `<p><strong>Ficha (color único):</strong></p>`;
    TOKENS.forEach((tok) => {
      const id = `token-${tok.id}-p${i}`;
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = `token-player-${i}`;
      radio.value = tok.id;
      radio.id = id;
      radio.className = "token-radio";

      const label = document.createElement("label");
      label.htmlFor = id;
      label.className = "token-label";
      label.textContent = tok.label;

      tokenDiv.appendChild(radio);
      tokenDiv.appendChild(label);
    });
    block.appendChild(tokenDiv);

    // País
    const countryLabel = document.createElement("label");
    countryLabel.className = "country-label";
    const select = document.createElement("select");
    select.className = "country-select";
    select.dataset.player = i;

    if (!countries || countries.length === 0) {
      const opt = document.createElement("option");
      opt.value = "CO";
      opt.textContent = "Colombia (fallback)";
      select.appendChild(opt);
    } else {
      countries.forEach((c) => {
        const code = Object.keys(c)[0];
        const name = c[code];
        const opt = document.createElement("option");
        opt.value = code.toUpperCase();
        opt.textContent = name;
        select.appendChild(opt);
      });
    }

    countryLabel.innerHTML = `<p><strong>País:</strong></p>`;
    countryLabel.appendChild(select);
    block.appendChild(countryLabel);

    form.appendChild(block);
  }

  // Botón comenzar partida
  const startBtn = document.createElement("button");
  startBtn.textContent = "Comenzar partida";
  startBtn.className = "player-btn start-game-btn";
  startBtn.addEventListener("click", () => {
    const result = collectAndValidatePlayers(numPlayers);
    if (!result.ok) {
      alert(result.errors[0]);
      return;
    }

    const jugadoresPlanos = result.players.map(j => ({
      id: j.id,
      nick: j.nick,
      color: j.color,
      bandera: j.bandera,
      money: j.money,
      position: j.position || 0,
      properties: j.properties || [],
      inJail: j.inJail || false,
      jailTurns: j.jailTurns || 0,
      hipoteca: j.hipoteca || false,
      prestamos: j.prestamos || 0
    }));

    localStorage.setItem("monopoly_players", JSON.stringify(jugadoresPlanos));
    alert("Jugadores configurados correctamente. ¡Listo para iniciar la partida!");
    window.location.href = "board.html";
  });

  container.appendChild(startBtn);
}

function collectAndValidatePlayers(numPlayers) {
  const errors = [];
  const players = [];
  const chosenTokens = new Set();

  for (let i = 1; i <= numPlayers; i++) {
    const nick = document.querySelector(`.nick-input[data-player="${i}"]`).value.trim();
    const tokenRadio = document.querySelector(`input[name="token-player-${i}"]:checked`);
    const token = tokenRadio ? tokenRadio.value : null;
    const country = document.querySelector(`.country-select[data-player="${i}"]`).value;

    if (!nick) errors.push(`El jugador ${i} necesita un nick.`);
    if (!token) errors.push(`El jugador ${i} debe seleccionar una ficha.`);
    if (token && chosenTokens.has(token)) errors.push(`La ficha "${token}" ya fue seleccionada.`);
    chosenTokens.add(token);

    players.push(new Jugador(i, nick, token, country, 1500,0));
  }

  return { ok: errors.length === 0, players, errors };
}
