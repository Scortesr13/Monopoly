// js/api.js
// - Centraliza llamadas al backend.
// - Si el backend no responde, intenta cargar un mock local para no bloquear el flujo.

/* Configuración del backend */

/**
 * fetchCountries
 * - Intenta obtener la lista de países desde el backend.
 * - Si falla (network/CORS/500), intenta cargar 'assets/mock/countries.json' como fallback.
 * - Devuelve un array (puede estar vacío si todo falla).
 */
const API_BASE = "http://127.0.0.1:5000";

export async function fetchCountries() {
  try {
    const res = await fetch(`${API_BASE}/countries`);
    if (!res.ok) throw new Error("Respuesta del backend no OK");

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (errBackend) {
    console.warn(
      "Backend no respondió, probamos con RestCountries:",
      errBackend
    );

    try {
      const res = await fetch("https://restcountries.com/v3.1/all");
      if (!res.ok) throw new Error("Respuesta de RestCountries no OK");

      const data = await res.json();
      return data.map((pais) => ({
        code: pais.cca2,
        name: pais.translations?.spa?.common || pais.name.common,
        flag: pais.flags?.png || pais.flags?.svg,
      }));
    } catch (errRest) {
      console.warn(
        "RestCountries tampoco respondió, probamos mock local:",
        errRest
      );

      try {
        const fallback = await fetch("assets/mock/countries.json");
        if (!fallback.ok) return [];
        const json = await fallback.json();
        return Array.isArray(json) ? json : [];
      } catch (errMock) {
        console.error("Error al cargar mock de countries:", errMock);
        return [];
      }
    }
  }
}
/**
 * fetchBoard
 * - Intenta obtener el tablero desde el backend.
 * - Si falla, intenta cargar 'assets/mock/board.json' como fallback.
 * - Devuelve un objeto con la estructura del tablero.
 */
export function obtenerTablero() {
  return fetch("http://127.0.0.1:5000/board")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Error en la respuesta del servidor");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Tablero cargado:", data);
      // Siempre devolvemos un objeto con bottom, left, top y right
      return data;
    })
    .catch((error) => {
      console.error("Error al obtener el tablero:", error);
      return { bottom: [], left: [], top: [], right: [] }; // fallback vacío
    });
}
