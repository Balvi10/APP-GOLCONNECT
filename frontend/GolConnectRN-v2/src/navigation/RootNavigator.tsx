import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';
import type { RootStackParamList } from './routes';

import Landing from '../screens/Landing';
import Login from '../screens/Login';
import Register from '../screens/Register';
import RegistroReclutador from '../screens/RegistroReclutador';
import Inicio from '../screens/Inicio';
import InicioReclutador from '../screens/InicioReclutador';
import Profile from '../screens/Profile';
import PerfilReclutador from '../screens/PerfilReclutador';
import EditarPerfil from '../screens/EditarPerfil';
import SearchFeed from '../screens/SearchFeed';
import MisPostulaciones from '../screens/MisPostulaciones';
import PagoSeguro from '../screens/PagoSeguro';
import Exito from '../screens/Exito';
import ExitoReclutador from '../screens/ExitoReclutador';
import CrearAviso from '../screens/CrearAviso';
import CandidatosActivos from '../screens/CandidatosActivos';
import BuscadorReclutador from '../screens/BuscadorReclutador';
import MisJugadoresReclutador from '../screens/MisJugadoresReclutador';
import DetalleCandidato from '../screens/DetalleCandidato';
import ContactarJugador from '../screens/ContactarJugador';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="landing"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="landing" component={Landing} />
      <Stack.Screen name="login" component={Login} />
      <Stack.Screen name="register" component={Register} />
      <Stack.Screen name="registro-reclutador" component={RegistroReclutador} />
      <Stack.Screen name="inicio" component={Inicio} />
      <Stack.Screen name="inicio-reclutador" component={InicioReclutador} />
      <Stack.Screen name="profile" component={Profile} />
      <Stack.Screen name="perfil-reclutador" component={PerfilReclutador} />
      <Stack.Screen name="editar-perfil" component={EditarPerfil} />
      <Stack.Screen name="search" component={SearchFeed} />
      <Stack.Screen name="postulaciones" component={MisPostulaciones} />
      <Stack.Screen name="pro" component={PagoSeguro} />
      <Stack.Screen name="exito" component={Exito} />
      <Stack.Screen name="exito-reclutador" component={ExitoReclutador} />
      <Stack.Screen name="crear-aviso" component={CrearAviso} />
      <Stack.Screen name="candidatos-activos" component={CandidatosActivos} />
      <Stack.Screen name="buscar-reclutador" component={BuscadorReclutador} />
      <Stack.Screen name="mis-jugadores-reclutador" component={MisJugadoresReclutador} />
      <Stack.Screen name="detalle-candidato" component={DetalleCandidato} />
      <Stack.Screen name="contactar-jugador" component={ContactarJugador} />
    </Stack.Navigator>
  );
}
