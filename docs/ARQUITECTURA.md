# Arquitectura

## Piezas

| Pieza | Para qué |
|---|---|
| Supabase Auth | Registro con correo (código OTP), Google y Apple. Al crearse un usuario, un trigger (`handle_new_user`) crea su perfil, sus ajustes y, si venía de un enlace, guarda la atribución. |
| PostgreSQL + RLS | Datos. El cliente solo puede **leer** lo que le corresponde; no tiene permiso de escritura directa. |
| Funciones SQL (`security definer`) | Toda escritura. Validan, aplican límites y devuelven errores con códigos cortos (`rate_limited`, `not_member`…). Los ayudantes internos empiezan con `_` y no son llamables desde la app. |
| Edge Functions | Lo que no cabe en SQL: `lucas-chat` (IA), `invite-preview` (página con Open Graph), `share-card` (imagen SVG 1080×1920), `push-dispatch` (envío push vía Expo). |
| Schema `metrics` | Vistas del embudo viral. No se exponen por la API; solo `service_role` (panel interno / SQL editor). |
| Storage | Buckets `avatars` (cada quien en su carpeta) y `event-covers` (solo el equipo). |

## Seguridad en una línea

`revoke all` a `anon` y `authenticated`, luego solo `select` sobre tablas con política RLS y `execute` sobre una lista corta de funciones. `anon` solo puede ejecutar `get_invite_preview`. El equipo ("staff") se define en la tabla `staff_users`.

## Ciclo de la demanda (grupo en formación)

`open` → (llega al mínimo) `complete` → `sourcing` → `offers` → `voting` → `selected`; o `expired` / `cancelled`. Mientras está `open` se puede entrar y salir; después queda bloqueada (`demand_locked`). `expire_stale_demands()` vence las que pasaron `demand_days` sin llegar al mínimo, y `reopen_demand` permite reintentar.

## Entidades del Excel → backend

| Entidad (hoja Entidades) | Estado |
|---|---|
| Usuario | `profiles` (+ `auth.users` de Supabase) |
| Ajustes, Intereses | `user_settings`, `interests`, `user_interests` |
| Experiencia, Sesión, Categoría | `events`, `event_sessions`, `event_categories` |
| Reseña, Favorito | `event_reviews` (lectura), `favorites` |
| Grupo, Miembros, Invitaciones de grupo | `groups`, `group_members`, `group_invites` |
| Grupo en formación | `demand_intents`, `demand_members`, `provider_offers` |
| Enlace de invitación | `invite_links`, `invite_acceptances` |
| Lucas IA | `lucas_suggestions`, `lucas_messages` |
| Notificaciones | `notifications`, `push_tokens` |
| Conexiones | `connections` (se leen; el flujo para crearlas no está en la beta) |
| Métricas | `analytics_events` + schema `metrics` |
| Reservas, pagos, chats, etc. | **No incluidos** (fases Lanzamiento / Después) |

## Cosas que se pueden cambiar sin código

Tabla `app_config`: `min_members_default` (8), `demand_days` (14), `invite_days` (30), `max_links_per_day` (30), `max_demands_per_day` (10).
