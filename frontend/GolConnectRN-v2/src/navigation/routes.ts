
export const ROUTES = {
  landing: 'landing',
  login: 'login',
  register: 'register',
  registroReclutador: 'registro-reclutador',
  inicio: 'inicio',
  inicioReclutador: 'inicio-reclutador',
  profile: 'profile',
  search: 'search',
  postulaciones: 'postulaciones',
  pro: 'pro',
  exito: 'exito',
  exitoReclutador: 'exito-reclutador',
  perfilReclutador: 'perfil-reclutador',
  editarPerfil: 'editar-perfil',
  crearAviso: 'crear-aviso',
  candidatosActivos: 'candidatos-activos',
  buscarReclutador: 'buscar-reclutador',
  misJugadoresReclutador: 'mis-jugadores-reclutador',
  detalleCandidato: 'detalle-candidato',
  contactarJugador: 'contactar-jugador',
} as const;

export type RouteName = (typeof ROUTES)[keyof typeof ROUTES];

export const VALID_VIEWS: string[] = Object.values(ROUTES);

/**
 * Params que recibe cada pantalla del stack. Las pantallas que no aparecen
 * acá no reciben parámetros (undefined).
 */
export type RootStackParamList = {
  landing: undefined;
  login: undefined;
  register: undefined;
  'registro-reclutador': undefined;
  inicio: undefined;
  'inicio-reclutador': undefined;
  profile: undefined;
  search: undefined;
  postulaciones: undefined;
  pro: undefined;
  exito: undefined;
  'exito-reclutador': undefined;
  'perfil-reclutador': undefined;
  'editar-perfil': undefined;
  'crear-aviso': undefined;
  'candidatos-activos': { avisoId?: number } | undefined;
  'buscar-reclutador': undefined;
  'mis-jugadores-reclutador': undefined;
  'detalle-candidato': { jugadorId: number };
  'contactar-jugador': { jugadorId: number };
};
