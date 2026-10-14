# Decisiones pendientes y límites honestos

Lo que **no** está validado o es una suposición mía:

1. **Probado contra PostgreSQL 16 con un reemplazo de Supabase**, no contra Supabase real. El esquema, las funciones y la seguridad sí corrieron de verdad; Auth, Storage y los roles son una simulación. Hay que correr `supabase db push` en un proyecto de prueba y repetir el flujo.
2. **`config.toml` sin validar** (no había Docker). Puede requerir ajustes con `supabase start`.
3. **Edge Functions**: la lógica tiene pruebas y revisión de tipos, pero no se desplegaron ni se llamaron contra la API de Anthropic ni de Expo.
4. **Push con Expo** es una suposición (app en React Native/Expo). Si el frontend es nativo o Flutter, hay que cambiar `push-dispatch` a FCM/APNs.
5. **Enlaces diferidos (deep links tras instalar)**: no están. Quien no tiene la app llega a la tienda y pierde el token; hoy la atribución depende de que abra el enlace otra vez o lo pegue. Se puede resolver con un servicio de enlaces diferidos (Branch, AppsFlyer) o una pantalla "pega tu código".
6. **Tarjeta de compartir en SVG**, no PNG. Instagram/TikTok piden imagen raster; falta convertirla (por ejemplo con `resvg` en la función).
7. **Sin panel de administración**: el equipo opera con funciones `staff_*` desde el SQL editor.
8. **Conexiones** (amistades): la tabla existe y se lee, pero no hay función para enviar/aceptar solicitudes; `create_group_invites` exige conexiones aceptadas.
9. **Valores de `.well-known`** son de ejemplo.
10. **Lucas con IA** depende de qué modelo y clave configures (`LUCAS_MODEL`); no fijé un modelo.
11. **Fuera de la beta**: reservas, pagos, chat, reseñas escritas, panel de proveedores, grupos de más de una ciudad.
12. **Privacidad y legales**: falta política de privacidad, borrado de cuenta desde la app y revisión de datos personales (perfil público por defecto).
