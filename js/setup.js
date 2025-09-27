import { Jugador } from "./jugador.js"; // asegúrate de que el archivo tenga la extensión .js
import { fetchCountries } from "./api.js";

// Fichas disponibles
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

  startScreen.style.display = "none";
  setupScreen.style.display = "block";
  message.textContent = "";
}

function renderPlayerSetup(numPlayers, countries) {
  const container = document.getElementById("setup-screen");
  container.innerHTML = '';

  const title = document.createElement("h2");
  title.textContent = "Configuración de Jugadores";
  container.appendChild(title);

  const form = document.createElement("div");
  form.id = "players-form";
  container.appendChild(form);

  for (let i = 1; i <= numPlayers; i++) {
    const playerBlock = document.createElement("div");
    playerBlock.className = "player-setup";

    const playerTitle = document.createElement("h3");
    playerTitle.textContent = `Jugador ${i}`;
    playerBlock.appendChild(playerTitle);

    // Nickname - SOLO PLACEHOLDER, SIN VALOR PREDETERMINADO
    const nickGroup = document.createElement("div");
    nickGroup.className = "config-group";
    nickGroup.innerHTML = `
  <label>Nombre:</label>
  <input type="text" class="nick-input" data-player="${i}" 
         placeholder="Jugador ${i}" />
`;
    playerBlock.appendChild(nickGroup);

    // Fichas mejoradas
    const tokenGroup = document.createElement("div");
    tokenGroup.className = "config-group";
    tokenGroup.innerHTML = `<label>Elige tu color:</label>`;

    const tokensContainer = document.createElement("div");
    tokensContainer.className = "tokens-container";

    const tokenConfigs = [
      { id: 'red', label: 'Rojo', emoji: '🔴' },
      { id: 'blue', label: 'Azul', emoji: '🔵' },
      { id: 'green', label: 'Verde', emoji: '🟢' },
      { id: 'yellow', label: 'Amarillo', emoji: '🟡' }
    ];

    tokenConfigs.forEach((token, index) => {
      const tokenId = `token-${token.id}-p${i}`;
      const tokenDiv = document.createElement("div");
      tokenDiv.className = "token-item";
      tokenDiv.innerHTML = `
        <input type="radio" id="${tokenId}" name="token-player-${i}" 
               value="${token.id}" class="token-radio" ${i === 1 && index === 0 ? 'checked' : ''}>
        <label for="${tokenId}" class="token-option token-${token.id}" title="${token.label}">
          ${token.emoji}
        </label>
        <span class="token-label">${token.label}</span>
      `;
      tokensContainer.appendChild(tokenDiv);
    });

    tokenGroup.appendChild(tokensContainer);
    playerBlock.appendChild(tokenGroup);

    // País
    const countryGroup = document.createElement("div");
    countryGroup.className = "config-group";
    countryGroup.innerHTML = `<label>País:</label>`;

    const countrySelect = document.createElement("select");
    countrySelect.className = "country-select";
    countrySelect.dataset.player = i;

    countries.forEach((country) => {
      const code = Object.keys(country)[0];
      const name = country[code];
      const option = document.createElement("option");
      option.value = code.toUpperCase();
      option.textContent = name;
      countrySelect.appendChild(option);
    });

    countryGroup.appendChild(countrySelect);
    playerBlock.appendChild(countryGroup);

    form.appendChild(playerBlock);
  }

  const startButton = document.createElement("button");
  startButton.textContent = "🎮 Comenzar Juego";
  startButton.className = "start-game-btn";
  startButton.addEventListener("click", handleStartGame);
  container.appendChild(startButton);

  function handleStartGame() {
    const result = collectAndValidatePlayers(numPlayers);
    if (!result.ok) {
      alert(result.errors.join('\n'));
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
    window.location.href = "board.html";
  }
}

function collectAndValidatePlayers(numPlayers) {
  const errors = [];
  const players = [];
  const chosenTokens = new Set();


  for (let i = 1; i <= numPlayers; i++) {
    const nick = document
      .querySelector(`.nick-input[data-player="${i}"]`)
      .value.trim();
    const tokenRadio = document.querySelector(
      `input[name="token-player-${i}"]:checked`
    );
    const token = tokenRadio ? tokenRadio.value : null;
    const country = document.querySelector(
      `.country-select[data-player="${i}"]`
    ).value;

    // Validaciones
    if (!nick) errors.push(`El jugador ${i} necesita un nick.`);
    if (!token) errors.push(`El jugador ${i} debe seleccionar una ficha.`);
    if (token && chosenTokens.has(token)) {
      errors.push(`La ficha "${token}" ya fue seleccionada.`);
    }
    chosenTokens.add(token);

    // Crear jugador con la clase
    players.push(new Jugador(i, nick, token, country, 1500, 0));
  }

  return { ok: errors.length === 0, players, errors };
}
