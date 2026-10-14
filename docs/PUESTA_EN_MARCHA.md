# Puesta en marcha

Requisitos: cuenta en Supabase, [Supabase CLI](https://supabase.com/docs/guides/cli), Deno.

1. **Crear el proyecto** en supabase.com y anotar el *project ref*.
2. **Vincular y aplicar la base**
   ```bash
   supabase link --project-ref TU_REF
   supabase db push
   ```
   (No ejecutes `seed.sql` en producción: tiene usuarios de demostración con contraseña `demo1234`.)
3. **Secretos** — copia `.env.example` a `.env`, rellénalo y:
   ```bash
   supabase secrets set --env-file .env
   ```
   Sin `ANTHROPIC_API_KEY`/`LUCAS_MODEL`, Lucas funciona con reglas simples.
4. **Desplegar funciones**
   ```bash
   supabase functions deploy lucas-chat invite-preview share-card
   supabase functions deploy push-dispatch --no-verify-jwt
   ```
5. **Push**: en Database → Webhooks crea un webhook sobre `INSERT` en `public.notifications` hacia la URL de `push-dispatch`, con el encabezado `x-webhook-secret` igual a `PUSH_WEBHOOK_SECRET`.
6. **Vencer demandas**: ejecuta una vez `supabase/optional/pg_cron.sql` en el SQL editor.
7. **Página del enlace**: publica `web/deno-deploy/main.ts` (Deno Deploy) en tu dominio; reemplaza los valores de ejemplo en `web/.well-known/*` (Team ID de Apple, paquete y huella SHA-256 de Android) para que los enlaces abran la app.
8. **Primer usuario del equipo**: regístrate en la app y en el SQL editor: `insert into staff_users(user_id) values ('<tu uuid>');`
9. **Acceso con Google/Apple**: configura los proveedores en Authentication → Providers (o con las variables del `.env`).
10. **Cambiar reglas**: edita filas de `app_config`.

## Antes de invitar a la beta

- Probar en un dispositivo real: enlace → app instalada, y enlace → sin app (ver decisiones pendientes).
- Confirmar que el correo de verificación llega (configurar SMTP propio en Supabase; el de prueba tiene límite bajo).
