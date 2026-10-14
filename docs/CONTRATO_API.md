# Contrato de la API por pantalla

Cliente: `supabase-js`. `supabase.rpc('nombre', {params})` para funciones; `supabase.from('tabla').select()` para lecturas. Los errores llegan en `error.message` como código corto (lista al final).

## Acceso (AU_01–AU_05)

| Pantalla | Llamada |
|---|---|
| AU_01 Bienvenida (variante "te invitó…") | `rpc('get_invite_preview', {p_token})` (funciona sin sesión) para mostrar quién invita y a qué. Guardar el token en el dispositivo. |
| AU_02 Iniciar sesión | `auth.signInWithOtp / signInWithPassword / signInWithOAuth` |
| AU_03 Registro | `auth.signUp` (o OTP). El perfil se crea solo. La atribución del registro a un enlace se hace en AU_05 con `accept_invite` (cuenta como registro por invitación si la cuenta se creó hace menos de 1 día). |
| AU_04 Verificación | `auth.verifyOtp` |
| AU_05 Intereses | `rpc('set_my_interests', {p_interest_ids})` (mínimo 1, hay máximo) y luego `rpc('accept_invite', {p_token})` si hay token guardado. Catálogo: `from('interests').select()` |

## Inicio (IN_01–IN_02)

| Pantalla | Llamada |
|---|---|
| IN_01 Inicio | `rpc('get_home')` → `{me, unread_notifications, suggestions, open_demands, recommended_events, upcoming_events, …}` |
| IN_02 Notificaciones | `from('notifications').select().order('created_at',{ascending:false})`, `rpc('mark_notification_read',{p_id})`, `rpc('mark_all_notifications_read')`. Registrar push: `rpc('register_push_token',{p_token,p_platform})` (`ios`/`android`) |

## Explorar (EX_02–EX_03)

| Pantalla | Llamada |
|---|---|
| EX_02 Resultados / filtros | `rpc('search_events',{p_query,p_category_id,p_city,p_order,p_limit,p_offset})` → `{items,total}`. Categorías: `from('event_categories')` |
| EX_02 sin coincidencias | CTA a Lucas o `rpc('create_demand_intent',{p_text,p_source:'explore'})` |
| EX_03 Detalle | `rpc('get_event',{p_event_id})`; favorito: `rpc('toggle_favorite',{p_event_id})` |

## Grupos (GR_01–GR_04)

| Pantalla | Llamada |
|---|---|
| GR_01 Mis grupos | `rpc('get_my_groups',{p_role})` (`p_role` opcional: `owner`/`member`) → grupos y grupos en formación |
| GR_02 Detalle del grupo | `rpc('get_group',{p_group_id})` |
| GR_03 Grupo en formación | `rpc('get_demand',{p_demand_id})`; `join_demand`, `leave_demand`, `cancel_demand`, `reopen_demand` (todas `{p_demand_id}`) |
| GR_03 Compartir | `rpc('create_invite_link',{p_target_type:'demand',p_target_id,p_channel})` → `{link_id, token, path, channel, expires_at}` (la URL completa es `WEB_BASE_URL + path`); abrir la hoja nativa de compartir; `rpc('track_event',{p_name:'share_sheet_opened',p_props:{channel}})`. Imagen: `GET /functions/v1/share-card?token=…` (SVG) |
| GR_04 Invitar al grupo | `create_invite_link` con `p_target_type:'group'` (WhatsApp/copiar) y `rpc('create_group_invites',{p_group_id,p_user_ids})` para conexiones |

## Lucas IA (LU_00–LU_01)

| Pantalla | Llamada |
|---|---|
| LU_00 Apertura | `rpc('get_lucas_suggestions')` |
| LU_01 Chat | `POST /functions/v1/lucas-chat {message}` → `{reply, events, suggested_action}`. Si `suggested_action.type == 'create_demand'` y la persona acepta: `rpc('create_demand_intent',{p_text,p_title,p_source:'lucas'})` |

## Perfil (PF_01–PF_03)

| Pantalla | Llamada |
|---|---|
| PF_01 Mi perfil | `rpc('get_me')` |
| PF_02 Configuración | `rpc('update_settings',{p_patch})` (claves: `push_enabled`, `notif_group_updates`, `notif_lucas`, `notif_messages`, `language`) |
| PF_03 Editar perfil | `rpc('update_me',{p_patch})` (claves permitidas: `display_name`, `age`, `city`, `bio`, `photo_path`, `profile_visibility` = `public`/`private`). La foto se sube a Storage `avatars/{user_id}/…` y luego se guarda la ruta. |
| Perfil de otra persona | `rpc('get_public_profile',{p_user_id})` (respeta público/privado) |

## Página pública del enlace

`https://<tu-dominio>/i/{token}` → Edge Function `invite-preview` (HTML con Open Graph; con `Accept: application/json` devuelve JSON). Los botones de la página llevan a `groups://i/{token}` o a la tienda.

## Equipo (no es una pantalla de la app)

Funciones `staff_*`, solo para usuarios en `staff_users` (se llaman desde el SQL editor o un panel futuro): `staff_add_offer`, `staff_publish_offers`, `staff_set_demand_status`, `staff_notify_demand`, `staff_create_group_from_demand`.

## Eventos de analítica permitidos en `track_event`

`session_start`, `push_permission`, `push_opened`, `lucas_conversation_started`, `screen_view`, `share_sheet_opened`. El resto del embudo se registra solo desde las funciones.

## Códigos de error

`not_authenticated`, `forbidden`, `rate_limited`, `text_required`, `invalid_source`, `invalid_token`, `invite_invalid`, `invite_expired`, `demand_not_found`, `demand_closed`, `demand_expired`, `demand_locked`, `demand_not_ready`, `demand_not_reopenable`, `not_member`, `not_connected`, `group_not_found`, `group_closed`, `event_not_found`, `event_not_allowed`, `profile_not_found`, `interests_required`, `too_many_interests`, `unknown_interest`, `invalid_photo_path`, `invalid_platform`, `invalid_role`, `props_too_large`.

> Nota: los nombres exactos de campos de los JSON de respuesta están en `supabase/migrations/20261010000200_functions.sql`; las pruebas en `tests/db/10_beta_flow.sql` muestran ejemplos reales de uso.
