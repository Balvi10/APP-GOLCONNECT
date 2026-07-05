// =============================================================================
//  GolConnect — Capa de API
//  ⚡ PARA CAMBIAR DE PC: solo modificá API_BASE_URL (una sola línea)
// =============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';

// 👇 CAMBIÁ SOLO ESTA IP cuando mudes el proyecto a otra computadora
const API_IP = '192.168.0.43';
const API_PORT = '8000';

export const API_BASE_URL = `http://${API_IP}:${API_PORT}/api`;

/**
 * Construye la URL de una foto de perfil guardada en el servidor.
 *
 * Usa /api/media/... (servido por MediaController en Laravel) en vez de
 * /storage/... (el symlink de storage:link), porque en Windows el servidor
 * embebido de PHP a veces no resuelve ese symlink y devuelve 404 aunque el
 * archivo exista físicamente en disco. Sirviendo el archivo con código PHP
 * evitamos depender de esa resolución del sistema operativo.
 */
export function urlFoto(path) {
  if (!path) return null;
  return `${API_BASE_URL}/media/${path}`;
}

// ---------------------------------------------------------------------------
//  Token helpers
// ---------------------------------------------------------------------------
const TOKEN_KEY = 'golconnect_token';
const USER_KEY  = 'golconnect_user';

export async function guardarSesion(token, user) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function obtenerToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function obtenerUsuario() {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function cerrarSesionLocal() {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}

// ---------------------------------------------------------------------------
//  Fetch base — maneja headers, token y errores de forma centralizada
// ---------------------------------------------------------------------------
async function apiFetch(endpoint, options = {}) {
  const token = await obtenerToken();

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const mensaje =
      data?.message ||
      (data?.errors ? Object.values(data.errors).flat().join(' ') : null) ||
      `Error ${response.status}`;
    throw new Error(mensaje);
  }

  return data;
}

// ---------------------------------------------------------------------------
//  AUTH
// ---------------------------------------------------------------------------
export const auth = {
  async loginJugador(email, password) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rol: 'jugador' }),
    });
    await guardarSesion(data.token, data.user);
    return data;
  },

  async loginReclutador(email, password) {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rol: 'reclutador' }),
    });
    await guardarSesion(data.token, data.user);
    return data;
  },

  async registrarJugador(payload) {
    const data = await apiFetch('/auth/register/jugador', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await guardarSesion(data.token, data.user);
    return data;
  },

  async registrarReclutador(payload) {
    const data = await apiFetch('/auth/register/reclutador', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await guardarSesion(data.token, data.user);
    return data;
  },

  async logout() {
    await apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});
    await cerrarSesionLocal();
  },

  async me() {
    return apiFetch('/auth/me');
  },
};

// ---------------------------------------------------------------------------
//  JUGADOR
// ---------------------------------------------------------------------------
export const jugador = {
  inicio() {
    return apiFetch('/jugador/inicio');
  },

  perfil() {
    return apiFetch('/jugador/perfil');
  },

  actualizarPerfil(payload) {
    return apiFetch('/jugador/perfil', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  videos() {
    return apiFetch('/jugador/videos');
  },

  agregarVideo(payload) {
    return apiFetch('/jugador/videos', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  eliminarVideo(id) {
    return apiFetch(`/jugador/videos/${id}`, { method: 'DELETE' });
  },

  trayectoria() {
    return apiFetch('/jugador/trayectoria');
  },

  agregarTrayectoria(payload) {
    return apiFetch('/jugador/trayectoria', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// ---------------------------------------------------------------------------
//  RECLUTADOR
// ---------------------------------------------------------------------------
export const reclutador = {
  inicio() {
    return apiFetch('/reclutador/inicio');
  },

  perfil() {
    return apiFetch('/reclutador/perfil');
  },

  actualizarPerfil(payload) {
    return apiFetch('/reclutador/perfil', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  buscar(filtros = {}) {
    const params = new URLSearchParams(filtros).toString();
    return apiFetch(`/reclutador/buscar${params ? '?' + params : ''}`);
  },

  misJugadores() {
    return apiFetch('/reclutador/mis-jugadores');
  },
};

// ---------------------------------------------------------------------------
//  AVISOS
// ---------------------------------------------------------------------------
export const avisos = {
  listar(filtros = {}) {
    const params = new URLSearchParams(filtros).toString();
    return apiFetch(`/avisos${params ? '?' + params : ''}`);
  },

  crear(payload) {
    return apiFetch('/avisos', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  ver(id) {
    return apiFetch(`/avisos/${id}`);
  },

  actualizar(id, payload) {
    return apiFetch(`/avisos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  eliminar(id) {
    return apiFetch(`/avisos/${id}`, { method: 'DELETE' });
  },

  candidatos(avisoId) {
    return apiFetch(`/avisos/${avisoId}/candidatos`);
  },
};

// ---------------------------------------------------------------------------
//  POSTULACIONES
// ---------------------------------------------------------------------------
export const postulaciones = {
  misPostulaciones() {
    return apiFetch('/postulaciones');
  },

  postular(avisoId) {
    return apiFetch(`/avisos/${avisoId}/postular`, { method: 'POST' });
  },

  cambiarEstado(postulacionId, payload) {
    return apiFetch(`/postulaciones/${postulacionId}/estado`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};

// ---------------------------------------------------------------------------
//  JUGADORES (vista de reclutador)
// ---------------------------------------------------------------------------
export const jugadores = {
  detalle(jugadorId) {
    return apiFetch(`/jugadores/${jugadorId}`);
  },

  contactar(jugadorId, payload) {
    return apiFetch(`/jugadores/${jugadorId}/contactar`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// ---------------------------------------------------------------------------
//  PAGOS
// ---------------------------------------------------------------------------
export const pagos = {
  iniciar() {
    return apiFetch('/pagos', { method: 'POST' });
  },

  estado() {
    return apiFetch('/pagos/estado');
  },
};

// ---------------------------------------------------------------------------
//  NOTIFICACIONES
// ---------------------------------------------------------------------------
export const notificaciones = {
  listar() {
    return apiFetch('/notificaciones');
  },

  marcarLeida(id) {
    return apiFetch(`/notificaciones/${id}/leer`, { method: 'POST' });
  },
};
