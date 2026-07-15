// =============================================================================
//  GolConnect — Capa de API
//  ⚡ PARA CAMBIAR DE PC: solo modificá API_BASE_URL (una sola línea)
// =============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  User,
  AuthResponse,
  PerfilJugador,
  PerfilReclutador,
  VideoJugador,
  TrayectoriaJugador,
  AvisoBusqueda,
  Postulacion,
  ContactoJugador,
  InicioReclutadorData,
  InicioJugadorData,
  PaginatedResponse,
  CanalContacto,
  TipoContacto,
} from '../types';

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
export function urlFoto(path?: string | null): string | null {
  if (!path) return null;
  return `${API_BASE_URL}/media/${path}`;
}

// ---------------------------------------------------------------------------
//  Token helpers
// ---------------------------------------------------------------------------
const TOKEN_KEY = 'golconnect_token';
const USER_KEY = 'golconnect_user';

export async function guardarSesion(token: string, user: User): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function obtenerToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function obtenerUsuario(): Promise<User | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? (JSON.parse(raw) as User) : null;
}

export async function cerrarSesionLocal(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
  await AsyncStorage.removeItem(USER_KEY);
}

// ---------------------------------------------------------------------------
//  Fetch base — maneja headers, token y errores de forma centralizada
// ---------------------------------------------------------------------------
async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await obtenerToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> | undefined),
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

  return data as T;
}

// ---------------------------------------------------------------------------
//  AUTH
// ---------------------------------------------------------------------------
export interface RegistroJugadorPayload {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  fecha_nacimiento: string;
  ciudad?: string | null;
  altura_cm?: number | null;
  peso_kg?: number | null;
  pierna_habil?: string;
  posicion_principal?: string | null;
  posicion_secundaria?: string | null;
  estado?: string;
  club_actual?: string | null;
  liga_actual?: string | null;
  division_actual?: string | null;
  video_url?: string | null;
}

export interface RegistroReclutadorPayload {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  cargo?: string | null;
  institucion?: string | null;
  categoria?: string | null;
  ciudad?: string | null;
  pais?: string | null;
}

export const auth = {
  async loginJugador(email: string, password: string): Promise<AuthResponse> {
    const data = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rol: 'jugador' }),
    });
    await guardarSesion(data.token, data.user);
    return data;
  },

  async loginReclutador(email: string, password: string): Promise<AuthResponse> {
    const data = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, rol: 'reclutador' }),
    });
    await guardarSesion(data.token, data.user);
    return data;
  },

  async registrarJugador(payload: RegistroJugadorPayload): Promise<AuthResponse> {
    const data = await apiFetch<AuthResponse>('/auth/register/jugador', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await guardarSesion(data.token, data.user);
    return data;
  },

  async registrarReclutador(payload: RegistroReclutadorPayload): Promise<AuthResponse> {
    const data = await apiFetch<AuthResponse>('/auth/register/reclutador', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await guardarSesion(data.token, data.user);
    return data;
  },

  async logout(): Promise<void> {
    await apiFetch('/auth/logout', { method: 'POST' }).catch(() => {});
    await cerrarSesionLocal();
  },

  me(): Promise<User> {
    return apiFetch<User>('/auth/me');
  },
};

// ---------------------------------------------------------------------------
//  JUGADOR
// ---------------------------------------------------------------------------
export const jugador = {
  inicio(): Promise<InicioJugadorData> {
    return apiFetch<InicioJugadorData>('/jugador/inicio');
  },

  perfil(): Promise<User> {
    return apiFetch<User>('/jugador/perfil');
  },

  actualizarPerfil(payload: Partial<PerfilJugador> & { nombre?: string; apellido?: string; whatsapp?: string }): Promise<User> {
    return apiFetch<User>('/jugador/perfil', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  videos(): Promise<VideoJugador[]> {
    return apiFetch<VideoJugador[]>('/jugador/videos');
  },

  agregarVideo(payload: { url: string; titulo?: string; es_highlight?: boolean }): Promise<VideoJugador> {
    return apiFetch<VideoJugador>('/jugador/videos', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  eliminarVideo(id: number): Promise<{ message: string }> {
    return apiFetch(`/jugador/videos/${id}`, { method: 'DELETE' });
  },

  trayectoria(): Promise<TrayectoriaJugador[]> {
    return apiFetch<TrayectoriaJugador[]>('/jugador/trayectoria');
  },

  agregarTrayectoria(payload: Partial<TrayectoriaJugador>): Promise<TrayectoriaJugador> {
    return apiFetch<TrayectoriaJugador>('/jugador/trayectoria', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// ---------------------------------------------------------------------------
//  RECLUTADOR
// ---------------------------------------------------------------------------
export interface FiltrosBusquedaJugador {
  nombre?: string;
  posicion?: string;
  ciudad?: string;
  estado?: string;
  edad_min?: number | string;
  edad_max?: number | string;
  altura_min?: number | string;
}

export const reclutador = {
  inicio(): Promise<InicioReclutadorData> {
    return apiFetch<InicioReclutadorData>('/reclutador/inicio');
  },

  perfil(): Promise<User> {
    return apiFetch<User>('/reclutador/perfil');
  },

  actualizarPerfil(payload: Partial<PerfilReclutador> & { nombre?: string; apellido?: string; whatsapp?: string }): Promise<User> {
    return apiFetch<User>('/reclutador/perfil', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  buscar(filtros: FiltrosBusquedaJugador = {}): Promise<PaginatedResponse<PerfilJugador>> {
    const params = new URLSearchParams(filtros as Record<string, string>).toString();
    return apiFetch(`/reclutador/buscar${params ? '?' + params : ''}`);
  },

  misJugadores(): Promise<ContactoJugador[]> {
    return apiFetch<ContactoJugador[]>('/reclutador/mis-jugadores');
  },
};

// ---------------------------------------------------------------------------
//  AVISOS
// ---------------------------------------------------------------------------
export interface FiltrosAvisos {
  posicion?: string;
  lugar?: string;
}

export const avisos = {
  listar(filtros: FiltrosAvisos = {}): Promise<PaginatedResponse<AvisoBusqueda>> {
    const params = new URLSearchParams(filtros as Record<string, string>).toString();
    return apiFetch(`/avisos${params ? '?' + params : ''}`);
  },

  crear(payload: Partial<AvisoBusqueda>): Promise<AvisoBusqueda> {
    return apiFetch<AvisoBusqueda>('/avisos', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  ver(id: number): Promise<AvisoBusqueda> {
    return apiFetch<AvisoBusqueda>(`/avisos/${id}`);
  },

  actualizar(id: number, payload: Partial<AvisoBusqueda>): Promise<AvisoBusqueda> {
    return apiFetch<AvisoBusqueda>(`/avisos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  eliminar(id: number): Promise<{ message: string }> {
    return apiFetch(`/avisos/${id}`, { method: 'DELETE' });
  },

  candidatos(avisoId: number): Promise<Postulacion[]> {
    return apiFetch<Postulacion[]>(`/avisos/${avisoId}/candidatos`);
  },
};

// ---------------------------------------------------------------------------
//  POSTULACIONES
// ---------------------------------------------------------------------------
export const postulaciones = {
  misPostulaciones(): Promise<Postulacion[]> {
    return apiFetch<Postulacion[]>('/postulaciones');
  },

  postular(avisoId: number): Promise<Postulacion> {
    return apiFetch<Postulacion>(`/avisos/${avisoId}/postular`, { method: 'POST' });
  },

  cambiarEstado(postulacionId: number, payload: Partial<Postulacion>): Promise<Postulacion> {
    return apiFetch<Postulacion>(`/postulaciones/${postulacionId}/estado`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};

// ---------------------------------------------------------------------------
//  JUGADORES (vista de reclutador)
// ---------------------------------------------------------------------------
export interface ContactarPayload {
  tipo: TipoContacto;
  canal: CanalContacto;
  notas?: string;
  fecha_reunion?: string;
}

export const jugadores = {
  detalle(jugadorId: number): Promise<PerfilJugador> {
    return apiFetch<PerfilJugador>(`/jugadores/${jugadorId}`);
  },

  contactar(jugadorId: number, payload: ContactarPayload): Promise<ContactoJugador> {
    return apiFetch<ContactoJugador>(`/jugadores/${jugadorId}/contactar`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// ---------------------------------------------------------------------------
//  PAGOS
// ---------------------------------------------------------------------------
export const pagos = {
  iniciar(): Promise<any> {
    return apiFetch('/pagos', { method: 'POST' });
  },

  estado(): Promise<any> {
    return apiFetch('/pagos/estado');
  },
};

// ---------------------------------------------------------------------------
//  NOTIFICACIONES
// ---------------------------------------------------------------------------
export interface Notificacion {
  id: number;
  tipo: string;
  titulo: string;
  cuerpo: string;
  leida?: boolean;
  data?: Record<string, unknown>;
  created_at?: string;
}

export const notificaciones = {
  listar(): Promise<Notificacion[]> {
    return apiFetch<Notificacion[]>('/notificaciones');
  },

  marcarLeida(id: number): Promise<{ message: string }> {
    return apiFetch(`/notificaciones/${id}/leer`, { method: 'POST' });
  },
};
