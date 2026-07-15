import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useRole } from '../context/RoleContext';
import { VALID_VIEWS, type RootStackParamList } from './routes';
import type { Rol } from '../types';

export type OnNavigate = (
  nextView: 'back' | string,
  roleOrParams?: Rol | Record<string, unknown> | null,
) => void;


export function useNavigate(): OnNavigate {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { setRole } = useRole();

  return function onNavigate(nextView, roleOrParams = null) {
    if (!nextView) return;

    if (nextView === 'back') {
      if (navigation.canGoBack()) navigation.goBack();
      else navigation.navigate('landing' as never);
      return;
    }

    const clean = String(nextView).replace(/^\//, '');

    // Si el segundo arg es un string, es el rol (compatibilidad legado)
    if (typeof roleOrParams === 'string') {
      setRole(roleOrParams as Rol);
    }

    if (VALID_VIEWS.includes(clean)) {
      // Si el segundo arg es un objeto, son params de navegación
      if (roleOrParams && typeof roleOrParams === 'object') {
        (navigation.navigate as any)(clean, roleOrParams);
      } else {
        (navigation.navigate as any)(clean);
      }
    } else {
      navigation.navigate('landing' as never);
    }
  };
}

export default useNavigate;
