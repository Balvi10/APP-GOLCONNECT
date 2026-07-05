/**
 * Nombres de ruta = exactamente las cadenas "view" del App.jsx original,
 * de modo que la lógica de navegación de cada pantalla se porta sin cambios.
 */
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
};

export const VALID_VIEWS = Object.values(ROUTES);
