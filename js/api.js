// js/api.js
// - Centraliza llamadas al backend.
// - Si el backend no responde, intenta cargar un mock local para no bloquear el flujo.

/* Configuración del backend */
const API_BASE = 'http://127.0.0.1:5000';

/**
 * fetchCountries
 * - Intenta obtener la lista de países desde el backend.
 * - Si falla (network/CORS/500), intenta cargar 'assets/mock/countries.json' como fallback.
 * - Devuelve un array (puede estar vacío si todo falla).
 */
async function fetchCountries() {
  try {
    const res = await fetch(`${API_BASE}/countries`);
    if (!res.ok) throw new Error('Respuesta del servidor no OK');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('Error al cargar countries desde API, usando mock local. Error:', err);
    try {
      const fallback = await fetch('assets/mock/countries.json');
      if (!fallback.ok) return [];
      const json = await fallback.json();
      return Array.isArray(json) ? json : [];
    } catch (e) {
      console.error('Error al cargar mock de countries:', e);
      return [];
    }
  }
}
