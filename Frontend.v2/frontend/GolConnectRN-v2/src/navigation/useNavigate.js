import { useNavigation } from '@react-navigation/native';
import { useRole } from '../context/RoleContext';
import { VALID_VIEWS } from './routes';

/**
 * useNavigate — shim de compatibilidad con la firma web.
 *
 *   onNavigate('inicio')
 *   onNavigate('login', 'reclutador')          // cambia el rol
 *   onNavigate('detalle-candidato', { jugadorId: 5 })  // pasa params al stack
 *   onNavigate('back')
 */
export function useNavigate() {
  const navigation = useNavigation();
  const { setRole } = useRole();

  return function onNavigate(nextView, roleOrParams = null) {
    if (!nextView) return;

    if (nextView === 'back') {
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.navigate('landing');
      return;
    }

    const clean = String(nextView).replace(/^\//, '');

    // Si el segundo arg es un string, es el rol (compatibilidad legado)
    if (typeof roleOrParams === 'string') {
      setRole(roleOrParams);
    }

    if (VALID_VIEWS.includes(clean)) {
      // Si el segundo arg es un objeto, son params de navegación
      if (roleOrParams && typeof roleOrParams === 'object') {
        navigation.navigate(clean, roleOrParams);
      } else {
        navigation.navigate(clean);
      }
    } else {
      navigation.navigate('landing');
    }
  };
}

export default useNavigate;
