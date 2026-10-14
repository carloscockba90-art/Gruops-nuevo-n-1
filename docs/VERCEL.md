# Ver la app en el navegador con Vercel

La app Expo también se exporta como sitio web. Sirve para **ver y enseñar pantallas, probar registro/ingreso y Lucas**. No sirve para probar push, App Links ni el guardado seguro del token (eso es del Hito 0 en Android).

## Pasos (una sola vez)
1. Subir este repositorio a GitHub.
2. En vercel.com: **Add New → Project** → elegir el repositorio.
3. **Root Directory:** `mobile`. El resto lo toma de `mobile/vercel.json` (comando `npx expo export --platform web`, salida `dist`, y reescritura de rutas a `index.html`).
4. **Environment Variables:** `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (solo la clave publishable, nunca la service_role).
5. Deploy. Cada `git push` genera una dirección nueva de prueba.
6. En Supabase → Authentication → URL Configuration, agrega la dirección de Vercel como URL permitida.

## Probar en tu computador
```bash
cd mobile && npm install && npm run web
```

## Cómo está resuelto lo que no existe en la web
- Almacenamiento de sesión y del token de invitación: `src/lib/storage.ts` e `invite.ts` (web, localStorage) frente a `*.native.ts` (Android, SQLite y SecureStore). Expo elige el archivo según la plataforma.
- Push: `src/lib/push.ts` no hace nada en web; `push.native.ts` es el real.

## Modo demostración
Para ver las pestañas sin Supabase: en Vercel → Settings → Environment Variables agrega `EXPO_PUBLIC_DEMO` = `1` (en Production y Preview) y vuelve a desplegar (Deployments → ⋯ → Redeploy). Aparece una franja naranja "Modo demostración" y la app te deja entrar sin cuenta. Para apagarlo, borra la variable y redespliega. No hay datos reales; nunca lo dejes activo cuando haya usuarios reales.

## Instalación de paquetes en Vercel
`vercel.json` fija `npm ci --legacy-peer-deps`. Sin esa opción `npm ci` falla por avisos de compatibilidad entre paquetes de Expo
(`react-native-worklets`) y el despliegue se queda en "Error" en el paso Install. No la quites.
