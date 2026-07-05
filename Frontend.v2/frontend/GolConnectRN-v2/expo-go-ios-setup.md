# Expo Go en iPhone — Solución a problemas de compatibilidad de SDK

## Contexto del problema

Proyecto React Native con Expo que no levantaba en Expo Go para iOS.  
**Stack:** React Native + Expo + TypeScript  
**Herramienta:** Expo Go 54.0.2 en iPhone (= SDK 54)

---

## Errores encontrados (en orden)

### 1. Incompatibilidad de SDK
```
Project is incompatible with this version of Expo Go
The installed version of Expo Go is for SDK 54.0.0
The project you opened uses SDK 52
```
**Causa:** El `package.json` original tenía `expo: ~56.0.11` pero la Expo Go del iPhone era SDK 54. Se hizo un downgrade a SDK 52 que tampoco era correcto — la versión de Expo Go indica el SDK que soporta, no el número de app.

**Regla clave:** La versión de Expo Go **ES** el SDK. Expo Go 54.x.x = SDK 54.

---

### 2. Timeout de red
```
Unknown error: The request timed out
exp://192.168.1.4:8081
```
**Causa:** Firewall de Windows bloqueando el puerto 8081.

**Fix aplicado:**
```powershell
# En PowerShell como administrador
New-NetFirewallRule -DisplayName "Expo Metro" -Direction Inbound -Protocol TCP -LocalPort 8081 -Action Allow
```

**Alternativa si sigue fallando:** usar tunnel en lugar de red local:
```bash
npx expo start --tunnel
```

---

### 3. Módulo expo-asset faltante
```
Error: The required package `expo-asset` cannot be found
```
**Fix:**
```bash
npx expo install expo-asset
```

---

### 4. babel-preset-expo faltante
```
Error: Cannot find module 'babel-preset-expo'
```
**Causa:** No estaba en `devDependencies`.

**Fix:** Agregarlo al `package.json` y reinstalar (ver sección de dependencias abajo).

---

## Solución final

### package.json correcto para SDK 54

```json
{
  "dependencies": {
    "expo": "~54.0.0",
    "expo-status-bar": "~3.0.9",
    "expo-font": "~14.0.12",
    "expo-asset": "~12.0.13",
    "expo-linear-gradient": "~15.0.8",
    "react": "19.1.0",
    "react-dom": "19.1.0",
    "react-native": "0.81.5",
    "@expo-google-fonts/oswald": "^0.4.2",
    "@expo-google-fonts/inter": "^0.4.2",
    "@react-navigation/native": "^7.0.14",
    "@react-navigation/native-stack": "^7.2.0",
    "react-native-screens": "~4.16.0",
    "react-native-safe-area-context": "~5.6.0",
    "@expo/vector-icons": "^15.0.3"
  },
  "devDependencies": {
    "@babel/core": "^7.25.0",
    "babel-preset-expo": "~54.0.10"
  }
}
```

### app.json correcto

- Sacar `newArchEnabled` del nivel raíz
- Ponerlo dentro de `ios` y `android` en `true`

```json
{
  "expo": {
    "name": "GolConnect",
    "slug": "golconnect",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "golconnect",
    "userInterfaceStyle": "dark",
    "backgroundColor": "#121414",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#121414"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.golconnect.app",
      "newArchEnabled": true
    },
    "android": {
      "package": "com.golconnect.app",
      "newArchEnabled": true,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#121414"
      }
    },
    "web": {
      "bundler": "metro",
      "favicon": "./assets/favicon.png"
    }
  }
}
```

---

## Secuencia de comandos para levantar desde cero

```bash
# 1. Limpiar instalación previa
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# 2. Reinstalar dependencias
npm install

# 3. Levantar el servidor
npx expo start

# Si hay problemas de red/firewall, usar tunnel:
npx expo start --tunnel
```

Al escanear el QR: usar la **cámara nativa del iPhone**, no desde adentro de Expo Go. iOS lo detecta y abre Expo Go automáticamente.

---

## Reglas para no volver a tener este problema

| Situación | Acción |
|---|---|
| Proyecto nuevo con Expo Go en iPhone | Verificar versión de Expo Go en App Store → ese número es el SDK a usar |
| SDK del proyecto ≠ SDK de Expo Go | Actualizar `package.json` con versiones del SDK correcto |
| Timeout al conectar | Agregar regla de firewall en Windows o usar `--tunnel` |
| Error de módulo faltante | `npx expo install <nombre-del-modulo>` (no `npm install`) |
| Warning de New Architecture | `newArchEnabled: true` dentro de `ios` y `android` en `app.json` |

---

## Herramientas de diagnóstico útiles

```bash
node --version          # Verificar Node (recomendado v18+)
npm --version
npx expo --version      # Versión de Expo CLI instalada
npx expo-doctor         # Chequeo de compatibilidad de dependencias
```

> **Nota:** `expo doctor` no funciona en Expo CLI v56+, usar `npx expo-doctor` en su lugar.
