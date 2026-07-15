

export type Rol = 'jugador' | 'reclutador';
export type PiernaHabil = 'zurdo' | 'diestro' | 'ambidiestro';
export type EstadoJugador = 'libre' | 'amateur' | 'profesional';
export type PlanJugador = 'amateur' | 'pro';
export type EstadoAviso = 'activo' | 'pausado' | 'finalizado';
export type CanalContacto = 'email' | 'whatsapp';
export type TipoContacto = 'interes' | 'prueba' | 'reunion';
export type EstadoContacto =
  | 'mensaje_enviado'
  | 'reunion_agendada'
  | 'oferta_pendiente'
  | 'en_revision'
  | 'cerrado';

export interface VideoJugador {
  id: number;
  perfil_jugador_id?: number;
  url: string;
  titulo?: string | null;
  es_highlight?: boolean;
  orden?: number;
}

export interface TrayectoriaJugador {
  id: number;
  club: string;
  division?: string | null;
  categoria?: string | null;
  partidos?: number | null;
  temporada_inicio?: number | null;
  temporada_fin?: number | null;
}

export interface PerfilJugador {
  id?: number;
  user_id?: number;
  fecha_nacimiento?: string;
  ciudad?: string | null;
  pais?: string | null;
  altura_cm?: number | null;
  peso_kg?: number | null;
  pierna_habil?: PiernaHabil;
  posicion_principal?: string | null;
  posicion_secundaria?: string | null;
  estado?: EstadoJugador;
  club_actual?: string | null;
  liga_actual?: string | null;
  division_actual?: string | null;
  foto_perfil?: string | null;
  plan?: PlanJugador;
  pro_expira_en?: string | null;
  visitas_perfil?: number;
  clubes_interesados?: number;
  scouts_activos?: number;
  temporada_partidos?: number | null;
  temporada_goles?: number | null;
  temporada_asistencias?: number | null;
  videos?: VideoJugador[];
  trayectoria?: TrayectoriaJugador[];
  user?: User;
  // Presente cuando viene "aplanado" en ContactoController::detalle
  nombre?: string;
  apellido?: string;
  email?: string;
  whatsapp?: string | null;
}

export interface CredencialReclutador {
  id: number;
  titulo?: string | null;
  estado?: string | null;
  identificador?: string | null;
}

export interface PerfilReclutador {
  id?: number;
  user_id?: number;
  cargo?: string | null;
  institucion?: string | null;
  categoria?: string | null;
  ciudad?: string | null;
  pais?: string | null;
  foto_perfil?: string | null;
  anios_experiencia?: number | null;
  fichajes_realizados?: number | null;
  verificado?: boolean;
  verificado_en?: string | null;
  credencial_path?: string | null;
  credenciales?: CredencialReclutador[];
}

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: Rol;
  whatsapp?: string | null;
  perfilJugador?: PerfilJugador | null;
  perfilReclutador?: PerfilReclutador | null;
}

export interface AvisoBusqueda {
  id: number;
  perfil_reclutador_id?: number;
  deporte?: string;
  nombre: string;
  posicion_requerida: string;
  descripcion?: string | null;
  estatura_minima_cm?: number | null;
  edad_minima?: number | null;
  edad_maxima?: number | null;
  fecha_inicio?: string | null;
  lugar?: string | null;
  habilidades_clave?: string | null;
  requisitos_ingreso?: string | null;
  estado?: EstadoAviso;
  total_postulaciones?: number;
  preseleccionados?: number;
  reclutador?: { user?: User } & Partial<PerfilReclutador>;
}

export interface Postulacion {
  id: number;
  aviso_busqueda_id?: number;
  perfil_jugador_id?: number;
  estado?: string;
  preseleccionado?: boolean;
  fecha_prueba?: string | null;
  notas_reclutador?: string | null;
  jugador?: PerfilJugador;
  aviso?: AvisoBusqueda;
}

export interface ContactoJugador {
  id: number;
  perfil_reclutador_id?: number;
  perfil_jugador_id?: number;
  tipo?: TipoContacto;
  canal?: CanalContacto;
  notas?: string | null;
  estado?: EstadoContacto;
  fecha_reunion?: string | null;
  created_at?: string;
  jugador?: PerfilJugador;
}

export interface InicioReclutadorData {
  nombre: string;
  apellido: string;
  institucion?: string | null;
  verificado?: boolean;
  total_avisos_activos: number;
  total_postulaciones: number;
  total_jugadores: number;
  avisos_recientes: AvisoBusqueda[];
}

export interface InicioJugadorData {
  nombre: string;
  apellido: string;
  foto_perfil?: string | null;
  plan?: PlanJugador;
  pro_expira_en?: string | null;
  visitas_perfil?: number;
  clubes_interesados?: number;
  scouts_activos?: number;
  temporada_partidos?: number;
  temporada_goles?: number;
  temporada_asistencias?: number;
}

/** Respuesta paginada estándar de Laravel (->paginate()) */
export interface PaginatedResponse<T> {
  current_page: number;
  data: T[];
  total: number;
  per_page?: number;
  last_page?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
