# Hito 0 — Probar que la infraestructura funciona fuera de simulación

Objetivo: que una persona real, con un teléfono Android real, pase por **registro → Lucas → enlace → push** contra un Supabase real. Nada de pantallas bonitas hasta que esto funcione.

Lo que necesitas tener (lo creas tú, yo no puedo): cuenta de Supabase, cuenta de GitHub, cuenta de Expo (expo.dev), un teléfono Android con cable o la app de desarrollo instalada, y opcionalmente una clave de la API de IA para Lucas.

## Checklist

### A. Repositorio
- [ ] Crear repositorio privado en GitHub y subir esta carpeta (`git remote add origin …` y `git push -u origin main`).
- [ ] Confirmar que el flujo `.github/workflows/ci.yml` queda en verde.

### B. Supabase real (detalle en `docs/PUESTA_EN_MARCHA.md`)
- [ ] Crear proyecto y anotar el *project ref*.
- [ ] `supabase link --project-ref TU_REF` y `supabase db push`.
- [ ] Si `db push` falla: **copiar el error completo**. La base solo se probó en un Postgres simulado; es normal que aparezcan ajustes (extensiones, roles, `config.toml`).
- [ ] Carga de datos de referencia (intereses): vienen en la migración 5; comprobar en Table Editor que `interests` tiene filas.
- [ ] Authentication → desactivar “Confirm email” mientras pruebas (o configurar SMTP propio).

### C. Aplicación en el teléfono
- [ ] `cd mobile && cp .env.example .env` y poner URL y clave publishable (Project Settings → API).
- [ ] `npm install` y `npx expo start`; abrir con **Expo Go** solo para ver pantallas y probar registro/ingreso.
- [ ] Registrarse desde la app: verificar que existe la fila en `auth.users` y en `profiles`.
- [ ] En AU_05, elegir intereses: se guardan con `set_my_interests`.

### D. Lucas
- [ ] `supabase secrets set ANTHROPIC_API_KEY=… LUCAS_MODEL=…` (sin esto Lucas responde con reglas simples).
- [ ] `supabase functions deploy lucas-chat invite-preview share-card` y `supabase functions deploy push-dispatch --no-verify-jwt`.
- [ ] Llamar `askLucas('quiero jugar fútbol el sábado')` desde la app y recibir `reply` y, si corresponde, `suggested_action`.
- [ ] Aceptar la sugerencia → `create_demand_intent` crea el grupo en formación.

### E. Enlaces de invitación
- [ ] Publicar `web/deno-deploy/main.ts` en un dominio. Poner ese dominio en `mobile/app.json` (reemplazar `REEMPLAZAR_DOMINIO`).
- [ ] Generar la huella SHA-256 de la app (la entrega EAS al compilar) y ponerla en `web/.well-known/assetlinks.json`.
- [ ] Abrir `https://TU_DOMINIO/i/<token>` en el teléfono: con la app instalada abre la app; sin ella muestra la página pública.
- [ ] Caso “instalar y luego unirse” (deferred deep link) **no está resuelto**: el token se guarda solo si la app se abrió desde el enlace. Decisión pendiente.

### F. Push en Android real (requiere development build)
- [ ] `npm i -g eas-cli` · `eas login` · `eas init` (esto crea el `projectId` en `app.json > extra.eas`).
- [ ] Crear proyecto en Firebase, descargar `google-services.json`, subir la credencial FCM V1 con `eas credentials`.
- [ ] `eas build --profile development --platform android`, instalar el APK en el teléfono.
- [ ] Iniciar sesión: el token queda en `push_tokens` (vía `register_push_token`).
- [ ] Crear el webhook de base de datos hacia `push-dispatch` (paso 5 de PUESTA_EN_MARCHA) y provocar una notificación: llega al teléfono.

## Criterio de éxito
Dos cuentas reales: la A crea un grupo en formación con Lucas y comparte el enlace; la B lo abre en otro teléfono, se registra, se une; A recibe una notificación push; al llegar al mínimo la demanda pasa a `complete`.
