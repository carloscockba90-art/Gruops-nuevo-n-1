# Pendientes del frontend (desde Excel v31)

Generado de la hoja Maestro. Sirve de checklist y de contexto para cualquier IA o persona que programe. Si el Excel cambia, vuelve a generarlo.

Decisiones vigentes (v31): barra inferior de 6 pestañas (Inicio, Explorar, Crear, Grupos, Chats, Perfil); el avatar del encabezado también abre Perfil; todo lo "Entra" es Lanzamiento; las pantallas se construyen por olas.

El estado "Hecha" significa que existe en `mobile/src/app`; todas siguen pendientes de revisión de diseño y de conectarse a datos reales.

## Resumen

| Decisión | Ola | Pantallas |
|---|---|---|
| En decisión | Ola 3 | 4 |
| En decisión | Ola 4 | 1 |
| Entra | Ola 1 | 6 |
| Entra | Ola 2 | 14 |
| Entra | Ola 3 | 23 |
| Queda fuera | Ola 4 | 3 |

## Ola 1 — Entra (6 pantallas)

### AU_01 · Bienvenida / acceso

- **Estado en la app:** Hecha (diseño del Excel; falta probar el flujo de invitación con Supabase real)
- **Pestaña / se abre desde:** Acceso (sin pestaña) / Inicio de la app
- **Horas estimadas:** 14 · **Diseño:** BASE LISTA · **Rol:** Visitante
- **UI:** Hero de marca + CTA principal. Variante desde invitación: banner 'Te invitó [nombre] a [grupo]' con foto/actividad/progreso; conservar invite_token durante autenticación.
- **Flujo:** AU_01 → AU_03 si crea cuenta · AU_01 → AU_02 si ya tiene cuenta · Desde invitación: conservar token → login/registro/onboarding → abrir/unir a GR_03 o GR_02
- **Estados:** En el flujo: — · Falta definir: cargando (acceso social), error de red
- **Datos:** Lee: invite_links (solo si llega por un enlace de invitación) · Escribe: —

### AU_02 · Iniciar sesión

- **Estado en la app:** Hecha (Google/Apple pendientes de configurar en Supabase)
- **Pestaña / se abre desde:** Acceso (sin pestaña) / AU_01
- **Horas estimadas:** 16 · **Diseño:** BASE LISTA · **Rol:** Visitante
- **UI:** Formulario login, validación, estados loading/error y accesos Google/Apple.
- **Flujo:** Credenciales válidas → IN_01 · Error → estado inline · Registro → AU_03
- **Estados:** En el flujo: loading y error inline (en el flujo) · Falta definir: captura del estado de error
- **Datos:** Lee: users, auth_credentials · Escribe: sessions

### AU_03 · Registro

- **Estado en la app:** Hecha
- **Pestaña / se abre desde:** Acceso (sin pestaña) / AU_01
- **Horas estimadas:** 16 · **Diseño:** BASE LISTA · **Rol:** Visitante
- **UI:** Formulario de cuenta con validaciones y aceptación de términos.
- **Flujo:** AU_03 → crear usuario → AU_04
- **Estados:** En el flujo: validaciones (en la descripción) · Falta definir: error por correo ya registrado, cargando al crear usuario
- **Datos:** Lee: — · Escribe: users, auth_credentials, otp_codes

### AU_04 · Verificación

- **Estado en la app:** Hecha (necesita plantilla de correo con código en Supabase)
- **Pestaña / se abre desde:** Acceso (sin pestaña) / AU_03
- **Horas estimadas:** 14 · **Diseño:** BASE LISTA · **Rol:** Visitante
- **UI:** 6 dígitos, autoavance, reenviar y validación visual.
- **Flujo:** OTP correcto → AU_05 · OTP inválido/expirado → permanecer
- **Estados:** En el flujo: OTP inválido o expirado: permanece (en el flujo) · Falta definir: error de red; el reenvío con cuenta regresiva ya se ve en la captura
- **Datos:** Lee: otp_codes · Escribe: users (verificado), otp_codes

### AU_05 · Onboarding / intereses

- **Estado en la app:** Hecha (usa el catálogo de 14 intereses de la base)
- **Pestaña / se abre desde:** Acceso (sin pestaña) / AU_04
- **Horas estimadas:** 14 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** Grid visual de intereses con selección múltiple y CTA Continuar.
- **Flujo:** Selecciona intereses → guardar → IN_01
- **Estados:** En el flujo: — · Falta definir: cargando y error al guardar
- **Datos:** Lee: interests · Escribe: user_interests

### IN_01 · Inicio personalizado + Lucas IA

- **Estado en la app:** Hecha con datos de ejemplo (falta datos reales de lugar y asistentes)
- **Pestaña / se abre desde:** Inicio / Barra inferior
- **Horas estimadas:** 24 · **Diseño:** EN REVISIÓN · **Rol:** Usuario
- **UI:** Header + campana/avatar; bloque Lucas; recomendados; próximos eventos; personas; tarjeta de demanda; bottom nav definitivo: Inicio / Explorar / Crear / Grupos / Chats / Perfil. El avatar del header también puede abrir PF_01 como acceso rápido.
- **Flujo:** Inicio → contenido personalizado · Tarjeta demanda → GR_03 · Abrir chat Lucas → LU_00 · Avatar → PF_01 · Tocar la campana → IN_02
- **Estados:** En el flujo: — · Falta definir: vacío (sin recomendados ni eventos próximos), cargando, error
- **Datos:** Lee: events, event_participants, users, connections, demand_intents, notifications · Escribe: —


## Ola 2 — Entra (14 pantallas)

### IN_02 · Notificaciones

- **Estado en la app:** Hecha con datos de ejemplo (falta probar con Supabase real)
- **Pestaña / se abre desde:** Inicio / IN_01
- **Horas estimadas:** 24 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** Título 'Notificaciones' con flecha atrás y acción 'Marcar todas como leídas'. Secciones 'Hoy' y 'Anteriores'. Cada ítem trae avatar o icono, texto (ej. 'María López aceptó tu solicitud de conexión'), tiempo relativo ('Hace 2 h') y un punto azul si no está leído; los de 'Anteriores' llevan flecha. Tipos que se ven: solicitud o aceptación de conexión, comentario en un evento, evento actualizado y reserva cancelada. [Cierre v25] Notificaciones con secciones Hoy/Anteriores. Ciclo mínimo: grupo completo, llegaron propuestas, votación por cerrar y opción seleccionada. Solicitud de permiso push…
- **Flujo:** Tocar la campana en IN_01 → IN_02 · Tocar una notificación → EX_03 (evento) o PE_03 (solicitud de conexión) · Volver → IN_01
- **Estados:** Cerrado v25: vacío sin notificaciones; loading skeleton; error + Reintentar. Permiso push contextual, nunca al primer arranque.
- **Datos:** Lee: notifications · Escribe: notifications (marcar leída), push_tokens

### EX_02 · Resultados / filtros

- **Estado en la app:** Hecha (backend: texto y categoría; fecha, horario, precio, modalidad y orden se aplican en el dispositivo; datos de ejemplo en modo demo)
- **Pestaña / se abre desde:** Explorar / Barra inferior
- **Horas estimadas:** 24 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** Listado de resultados + botón Filtros + chips activos + vacío/no resultados.
- **Flujo:** Filtros → refrescar resultados · Sin match → ofrecer Lucas/Avísame · Ver favoritos → EX_04 (propuesto, v12)
- **Estados:** Cerrado v25: loading con skeleton; vacío 'No encontré algo que calce' + Preguntar a Lucas + Avísame; error recuperable + Reintentar.
- **Datos:** Lee: events, event_categories, event_reviews · Escribe: demand_intents (sin resultados / Avísame)

### EX_02a · Filtros (modal) - parte 1

- **Estado en la app:** Hecha (fecha, horario, precio, categorías; falta slider de precio y fecha personalizada)
- **Pestaña / se abre desde:** Explorar / EX_02
- **Horas estimadas:** 8 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** Modal 'Filtros' con 'Limpiar todo': fecha (cualquier fecha, hoy, esta semana, este mes, personalizar), horario (mañana, tarde, noche), precio por persona (slider y rangos), categorías (Todas, Deportes, Bienestar, Cultura, Gastronomía, Naturaleza, Social, Aprendizaje) y botón 'Ver 124 resultados'.
- **Flujo:** Aplicar filtros → refrescar resultados en EX_02
- **Estados:** En el flujo: — · Falta definir: filtros activos y 'sin resultados con estos filtros'
- **Datos:** Lee: events, event_categories · Escribe: —

### EX_02b · Filtros (modal) - parte 2

- **Estado en la app:** Parcial (modalidad y orden funcionan; nivel, duración, tamaño del grupo y "personas" aparecen como "Pronto")
- **Pestaña / se abre desde:** Explorar / EX_02
- **Horas estimadas:** 8 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** Continuación del modal 'Filtros': tipo de actividad (todas, presencial, online), nivel de dificultad, duración (slider), tamaño del grupo, personas (solo con cupos disponibles, solo verificados, solo mis amigos), ordenar por (más relevantes, fecha, mejor valorados, menor precio, mayor precio) y botón 'Ver 124 resultados'.
- **Flujo:** Aplicar filtros → refrescar resultados en EX_02
- **Estados:** En el flujo: — · Falta definir: filtros activos y 'sin resultados con estos filtros'
- **Datos:** Lee: events · Escribe: —

### EX_03 · Detalle de experiencia

- **Estado en la app:** Hecha (Reservar abre "Próximamente" hasta RS_01; falta foto, host verificado y grupo asociado desde el backend)
- **Pestaña / se abre desde:** Explorar / EX_02
- **Horas estimadas:** 24 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** Hero + datos + descripción + host + asistentes + precio + CTA Reservar.
- **Flujo:** EX_03 → RS_01 al reservar · Host → PE_02 · Grupo asociado → GR_02
- **Estados:** En el flujo: — · Falta definir: cargando, error, evento sin cupos, evento ya realizado
- **Datos:** Lee: events, event_sessions, users (host), event_participants, event_reviews, groups · Escribe: favorites

### GR_01 · Mis grupos

- **Estado en la app:** Hecha (tabs Todos/Organizo/Participo + grupos en formación; falta foto de grupo)
- **Pestaña / se abre desde:** Grupos / Barra inferior
- **Horas estimadas:** 12 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** Tabs simples Todos/Organizo/Participo + cards grupo.
- **Flujo:** Seleccionar grupo → GR_02 · Provisional → GR_03
- **Estados:** En el flujo: — · Falta definir: vacío (sin grupos), cargando, error
- **Datos:** Lee: groups, group_members · Escribe: —

### GR_02 · Detalle del grupo

- **Estado en la app:** Parcial (Eventos, Miembros, Info e Invitar; la pestaña Chat espera CH_03)
- **Pestaña / se abre desde:** Grupos / GR_01
- **Horas estimadas:** 24 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** Header grupo + tabs Eventos/Chat/Miembros/Info + CTA Invitar.
- **Flujo:** Grupo → evento próximo → EX_03 · Chat → CH_03 · Botón 'Invitar' → GR_04 (v12) · Tocar un miembro → PE_02 (v20) · Compartir o copiar enlace → GR_04 (v20)
- **Estados:** En el flujo: — · Falta definir: cargando, error, sin eventos próximos
- **Datos:** Lee: groups, group_members, events, users · Escribe: group_invites, invite_links

### GR_03 · Grupo en formación

- **Estado en la app:** Hecha con datos de ejemplo (get_demand/join/leave listos en backend; falta probar con Supabase real)
- **Pestaña / se abre desde:** Grupos / GR_01
- **Horas estimadas:** 38 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** Estado de demanda con avatares, timeline, Unirme/Salir, progreso visible y CTA Compartir. Mostrar 'Faltan N personas para activar el grupo'. Al completarse, pasa a búsqueda/recepción de ofertas.
- **Flujo:** Demanda → sumar miembros → compartir enlace → alcanzar mínimo → sourcing profesional → ofertas → votación → evento · Expirado/cancelado → Buscar alternativa con Lucas o Reintentar convocatoria
- **Estados:** Cerrado v25: activo / completo / expirado / cancelado. Expirado ofrece Buscar alternativa con Lucas y Reintentar convocatoria. Compartir muestra contador faltante.
- **Datos:** Lee: demand_intents, demand_members, provider_offers, invite_links · Escribe: demand_members (unirse / salir), invite_links

### GR_04 · Invitar al grupo

- **Estado en la app:** Hecha (enlace real; conexiones con datos de ejemplo: el backend no las lista)
- **Pestaña / se abre desde:** Grupos / GR_02
- **Horas estimadas:** 21 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** Título 'Invitar al grupo' y subtítulo 'Selecciona personas para invitar'. Buscador 'Buscar conexiones…', lista con casillas de selección (nombre e intereses), contador con avatares ('3 seleccionados'), botón 'Invitar (3)' y banner de éxito '¡Invitaciones enviadas! Se notificó a 3 personas'. [Cierre v25] Invitar al grupo: botones Compartir enlace y Copiar enlace arriba; lista de conexiones debajo. Si no hay conexiones, estado vacío con CTA Compartir enlace.
- **Flujo:** GR_02 o GR_03 → GR_04 · Compartir/Copiar enlace → menú nativo o portapapeles · Seleccionar conexiones → enviar invitaciones → volver al grupo
- **Estados:** En el flujo: — · Falta definir: sin conexiones para invitar, error de envío; botón 'Compartir' y copiar enlace
- **Datos:** Lee: groups, users, connections, invite_links · Escribe: group_invites, invite_links

### LU_00 · Apertura de Lucas IA

- **Estado en la app:** Hecha
- **Pestaña / se abre desde:** Inicio / IN_01
- **Horas estimadas:** 14 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** 'Lucas IA' con logo, 'Tu asistente para descubrir, crear y disfrutar experiencias'. Cuatro sugerencias: 'Buscar eventos cerca de mí', 'Crear un evento', 'Ideas para el fin de semana' y 'Recomendaciones personalizadas'. Campo '¿Qué quieres hacer?' con micrófono y botón de envío, y teclado abierto.
- **Flujo:** Tocar sugerencia → enviar sugerencia como primer mensaje → LU_01 · Escribir o hablar → LU_01 · Video avatar queda como modo de interfaz del asistente, no como flujo separado
- **Estados:** Cerrado v25: sugerencias alimentan LU_01 directamente. Loading/error de IA se muestran inline; no abre rutas adicionales.
- **Datos:** Lee: users, lucas_messages · Escribe: —

### LU_01 · Chat con Lucas IA

- **Estado en la app:** Hecha con respuestas de ejemplo (la función lucas-chat existe; falta probarla con Supabase real y la voz)
- **Pestaña / se abre desde:** Inicio / LU_00
- **Horas estimadas:** 40 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** Conversación + quick replies + cards de experiencia/demanda + input texto/voz. Cards de propuestas dinámicas (por ejemplo sushi, pádel, networking) con botón 'Crear grupo': abre una demanda o suma a un grupo en formación (GR_03).
- **Flujo:** Intención → buscar match · Match → experiencia/grupo · Sin match → crear demand_intent / Avísame · Propuesta dinámica → Crear grupo → demanda abierta → GR_03 (el equipo crea el grupo cuando se llega al mínimo; no es automático)
- **Estados:** En el flujo: sin match → Avísame (en el flujo) · Falta definir: cargando la respuesta de Lucas, error
- **Datos:** Lee: events, demand_intents, users, lucas_messages · Escribe: demand_intents (sin match), lucas_messages

### PF_01 · Mi perfil

- **Estado en la app:** Hecha (métricas reales de get_me; intereses, eventos, conexiones y pagos abren "Próximamente")
- **Pestaña / se abre desde:** Perfil / Barra inferior
- **Horas estimadas:** 16 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** Header perfil + métricas + accesos a intereses/eventos/grupos/conexiones/métodos de pago.
- **Flujo:** Editar datos/entrar a subsecciones → rutas existentes o modales · Editar perfil → PF_03 | Mis intereses → PF_04 | Mis eventos → PF_05 | Conexiones → PE_03 | Métodos de pago → PF_06 | Historial → PF_08 | Beneficios → PF_09 | Sello de verificación → PF_10 (v12)
- **Estados:** En el flujo: — · Falta definir: cargando, error
- **Datos:** Lee: users, events, groups, connections, payment_methods, user_interests · Escribe: —

### PF_02 · Configuración / cuenta

- **Estado en la app:** Hecha (4 interruptores guardan al instante; Ayuda y Eliminar cuenta "Próximamente")
- **Pestaña / se abre desde:** Perfil / PF_01
- **Horas estimadas:** 12 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** Lista de ajustes y toggles; navegación interna mínima.
- **Flujo:** Cambiar preferencia → persistir · Cerrar sesión → AU_01 · Editar perfil → PF_03 | opciones internas → PF_07 | Eliminar cuenta → PF_11 (v12)
- **Estados:** En el flujo: — · Falta definir: error al guardar una preferencia
- **Datos:** Lee: user_settings, users · Escribe: user_settings, sessions (cerrar sesión)

### PF_03 · Editar perfil

- **Estado en la app:** Hecha (validaciones y perfil privado; falta subir foto)
- **Pestaña / se abre desde:** Perfil / PF_01
- **Horas estimadas:** 18 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** 'Editar perfil'. Foto con botón de cámara, campos Nombre, Edad, Ciudad y Bio (texto largo) y botón 'Guardar cambios'.
- **Flujo:** Guardar → PF_01 · Cancelar → vuelve a la pantalla de origen (PF_01 o PF_02) · Interruptor 'Perfil público / privado' → guarda con 'Guardar cambios' (v20)
- **Estados:** En el flujo: — · Falta definir: validaciones, error de subida de foto, error al guardar; interruptor perfil público / privado
- **Datos:** Lee: users · Escribe: users (incluye profile_visibility), almacenamiento de archivos (foto)


## Ola 3 — Entra (23 pantallas)

### EX_04 · Favoritos (eventos guardados)

- **Estado en la app:** Hecha (acceso: corazón en EX_02; datos reales con tabla favorites)
- **Pestaña / se abre desde:** Explorar / EX_02
- **Horas estimadas:** 10 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** Título 'Mis favoritos'. Tarjetas de evento con foto, corazón relleno, nombre, fecha y hora, precio ('Gratis' o '$25') y flecha. La captura combina la lista con el estado vacío: corazón, 'Aún no tienes favoritos' y 'Guarda eventos que te interesen para verlos aquí'.
- **Flujo:** Acceso por definir (propuesta: desde EX_02 'Ver favoritos') · Tocar una tarjeta → EX_03 · Quitar corazón → el evento sale de la lista
- **Estados:** En el flujo: vacío (en la captura) · Falta definir: cargando, error, desde dónde se llega
- **Datos:** Lee: favorites, events · Escribe: favorites (quitar)

### EV_01 · Crear evento: modalidad

- **Estado en la app:** Hecha (modalidad + categoría; borrador guardado en el dispositivo)
- **Pestaña / se abre desde:** Crear / Barra inferior
- **Horas estimadas:** 8 · **Diseño:** BASE LISTA · **Rol:** Organizador / profesional
- **UI:** Dos cards de modalidad con explicación breve.
- **Flujo:** Modalidad → EV_02
- **Estados:** En el flujo: — · Falta definir: salir sin guardar (borrador)
- **Datos:** Lee: — · Escribe: events (borrador)

### EV_02 · Información básica

- **Estado en la app:** Hecha (validaciones; falta subir foto)
- **Pestaña / se abre desde:** Crear / EV_01
- **Horas estimadas:** 18 · **Diseño:** BASE LISTA · **Rol:** Organizador / profesional
- **UI:** Carga de imagen + inputs + selector categoría + validaciones.
- **Flujo:** Datos válidos → EV_03
- **Estados:** En el flujo: validaciones (en la descripción) · Falta definir: error de subida de foto, campos inválidos
- **Datos:** Lee: event_categories · Escribe: events (borrador), almacenamiento de archivos (foto)

### EV_03 · Detalles del evento

- **Estado en la app:** Hecha (fecha, hora, duración, ubicación, cupos; falta selector de instructor)
- **Pestaña / se abre desde:** Crear / EV_02
- **Horas estimadas:** 16 · **Diseño:** BASE LISTA · **Rol:** Organizador / profesional
- **UI:** 'Crear evento · Paso 2 de 3 · Detalles'. Campos: Fecha (selector), Hora de inicio, Duración (lista), Ubicación (conmutador Presencial / Online y dirección), Cupos disponibles e Instructor o profesional (selector con su certificación; 'Selecciona si aplica'). Botón 'Siguiente'.
- **Flujo:** Evento único → EV_05 · Recurrente → EV_04
- **Estados:** En el flujo: — · Falta definir: validación de fecha y cupos
- **Datos:** Lee: provider_profiles · Escribe: events (borrador)

### EV_04 · Periodicidad + calendario

- **Estado en la app:** Hecha (recurrencia, días, final y calendario de sesiones)
- **Pestaña / se abre desde:** Crear / EV_03
- **Horas estimadas:** 24 · **Diseño:** BASE LISTA · **Rol:** Organizador / profesional
- **UI:** Selector recurrencia + días + calendario preview + resumen sesiones.
- **Flujo:** Config recurrencia → generar preview sesiones → EV_05 · Si el evento es gratis → EV_04b → EV_06; si es de pago → EV_05 (v12)
- **Estados:** En el flujo: — · Falta definir: validación de fechas y número de sesiones
- **Datos:** Lee: — · Escribe: event_sessions

### EV_04b · Evento gratis (variante del precio)

- **Estado en la app:** Hecha (misma pantalla que EV_05 con el conmutador Gratis | Pagado)
- **Pestaña / se abre desde:** Crear / EV_04
- **Horas estimadas:** 6 · **Diseño:** BASE LISTA · **Rol:** Organizador / profesional
- **UI:** 'Precio del evento · Paso 3 de 3 · Precio'. Conmutador Gratis | Pagado con 'Gratis' activo. Tarjeta 'Evento gratuito: tu evento será sin costo para todos los asistentes', campo Precio '$0' ('No se cobrará a los asistentes'), mensaje 'Los eventos gratuitos ayudan a crear comunidad y atraer más personas' y botón 'Continuar a vista previa'.
- **Flujo:** Evento gratis → EV_04b → EV_06 · Evento de pago → EV_05 → EV_06
- **Estados:** En el flujo: — · Falta definir: confirmar si es pantalla propia o parte de EV_05
- **Datos:** Lee: — · Escribe: events (precio = gratis)

### EV_05 · Precio + ganancias

- **Estado en la app:** Hecha (precio, capacidad y ganancias con desglose; porcentajes provisionales)
- **Pestaña / se abre desde:** Crear / EV_04
- **Horas estimadas:** 14 · **Diseño:** BASE LISTA · **Rol:** Organizador / profesional
- **UI:** Precio + desglose colapsable + métodos de pago + cálculo automático de ganancia.
- **Flujo:** Definir precio → calcular breakdown → EV_06
- **Estados:** En el flujo: — · Falta definir: precio inválido; la variante para evento gratis es la fila EV_04b
- **Datos:** Lee: platform_fees · Escribe: events (precio)

### EV_06 · Preview / publicar

- **Estado en la app:** Pendiente
- **Pestaña / se abre desde:** Crear / EV_04b o EV_05
- **Horas estimadas:** 12 · **Diseño:** BASE LISTA · **Rol:** Organizador / profesional
- **UI:** Preview reutiliza componentes de EX_03 + CTA Publicar evento.
- **Flujo:** Validación OK → publicar → EV_07 · Error → volver a sección correspondiente
- **Estados:** En el flujo: error → volver a la sección correspondiente (en el flujo) · Falta definir: cargando al publicar
- **Datos:** Lee: events (borrador), event_sessions · Escribe: —

### EV_07 · Evento publicado

- **Estado en la app:** Pendiente
- **Pestaña / se abre desde:** Crear / EV_06
- **Horas estimadas:** 14 · **Diseño:** BASE LISTA · **Rol:** Organizador / profesional
- **UI:** Check de éxito + datos mínimos del evento + CTAs.
- **Flujo:** Publicar → status=published → EV_07 · Ver evento → EX_03 · Botón 'Ver panel' → EV_08 (propuesto, v12)
- **Estados:** En el flujo: — · Falta definir: —
- **Datos:** Lee: events · Escribe: events (status=published), notifications

### EV_08 · Panel anfitrión

- **Estado en la app:** Pendiente
- **Pestaña / se abre desde:** Crear / EV_07
- **Horas estimadas:** 24 · **Diseño:** BASE LISTA · **Rol:** Organizador / profesional
- **UI:** 'Panel del evento'. Cabecera con foto, nombre ('Yoga al atardecer'), fecha, lugar y estado 'Publicado'. Tres métricas: Vistas (245), Reservas (18) e Ingresos ($0). 'Asistentes (18)' con 'Ver todos' y filas con foto, nombre y estado (Confirmada / Pendiente). Botón 'Ir a Check-in'.
- **Flujo:** Botón 'Ver panel' en EV_07 → EV_08 · Botón 'Check-in' → EV_09 · Volver → EV_07
- **Estados:** En el flujo: — · Falta definir: evento sin reservas todavía, cargando, error
- **Datos:** Lee: events, event_participants, reservations, payments · Escribe: —

### EV_09 · Check-in con QR

- **Estado en la app:** Pendiente
- **Pestaña / se abre desde:** Crear / EV_08
- **Horas estimadas:** 18 · **Diseño:** BASE LISTA · **Rol:** Organizador / profesional
- **UI:** 'Check-in' con el nombre del evento, cámara con marco y código QR, texto 'Enfoca el código QR del asistente' y tarjeta de resultado: 'Válido', asistente (Ana ····4242) y 'Registro confirmado'.
- **Flujo:** Escanear QR → resultado en pantalla y registro de asistencia · Volver → EV_08
- **Estados:** En el flujo: — · Falta definir: permiso de cámara denegado, QR inválido, asistente ya registrado
- **Datos:** Lee: event_participants, reservations · Escribe: event_participants (asistencia)

### RS_01 · Reserva / selección de sesión

- **Estado en la app:** Hecha con datos de ejemplo (el backend aún no tiene reservas ni hold de cupo)
- **Pestaña / se abre desde:** Explorar / EX_03
- **Horas estimadas:** 20 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** Resumen evento + sesiones disponibles + cupos + CTA continuar.
- **Flujo:** Selecciona sesión → hold/cupo → pago si corresponde
- **Estados:** En el flujo: hold de cupo (en el flujo) · Falta definir: sesión sin cupos, hold expirado
- **Datos:** Lee: events, event_sessions · Escribe: reservations (hold de cupo)

### RS_02 · Checkout / pago

- **Estado en la app:** Hecha con pago SIMULADO (falta proveedor de pagos y funciones de backend)
- **Pestaña / se abre desde:** Explorar / RS_01
- **Horas estimadas:** 36 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** Resumen + método + pago + loading/error/reintento.
- **Flujo:** Intento pago → éxito confirma reserva → RS_03 · Fallo → retry
- **Estados:** En el flujo: loading, error y reintento (en la descripción) · Falta definir: captura de los estados de error y reintento
- **Datos:** Lee: reservations, payment_methods · Escribe: payments, reservations (estado)

### RS_03 · Confirmación de reserva

- **Estado en la app:** Hecha con datos de ejemplo (chat del grupo espera CH_03)
- **Pestaña / se abre desde:** Explorar / RS_02
- **Horas estimadas:** 10 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** Check éxito + evento + CTA Ver mis eventos / Ir al chat. Incluye agregar al calendario, ver ubicación, ir al chat del grupo y compartir.
- **Flujo:** Reserva confirmada → participant + notificación + chat
- **Estados:** En el flujo: — · Falta definir: —
- **Datos:** Lee: reservations, events · Escribe: event_participants, notifications, conversation_members

### CH_01 · Lista de conversaciones

- **Estado en la app:** Pendiente
- **Pestaña / se abre desde:** Chats / Barra inferior
- **Horas estimadas:** 12 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** Listado con avatar, preview, timestamp y badge no leído.
- **Flujo:** Seleccionar conversación → tipo correspondiente
- **Estados:** En el flujo: — · Falta definir: vacío (sin conversaciones), cargando, error
- **Datos:** Lee: conversations, conversation_members, messages · Escribe: —

### CH_03 · Chat grupo / evento

- **Estado en la app:** Pendiente
- **Pestaña / se abre desde:** Chats / CH_01
- **Horas estimadas:** 46 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** Header grupo/evento + mensajes + composer + acceso a detalle.
- **Flujo:** Miembros autorizados → chat realtime → detalle asociado
- **Estados:** En el flujo: — · Falta definir: error de envío, sin conexión, usuario no autorizado
- **Datos:** Lee: conversations, conversation_members, messages, message_attachments, message_reactions · Escribe: messages, message_reactions

### LU_02 · Oportunidad profesional

- **Estado en la app:** Pendiente
- **Pestaña / se abre desde:** Grupos / GR_03 (supuesto)
- **Horas estimadas:** 24 · **Diseño:** BASE LISTA · **Rol:** Organizador / profesional
- **UI:** Card de oportunidad + datos + ingreso potencial + CTAs Aceptar/Rechazar + formulario oferta.
- **Flujo:** Opportunity → aceptar/rechazar · Aceptar → provider_offer · Cerrar sourcing al cumplir regla
- **Estados:** En el flujo: — · Falta definir: oportunidad expirada o sourcing cerrado
- **Datos:** Lee: provider_opportunities, demand_intents · Escribe: provider_offers

### LU_03 · Ofertas + votación

- **Estado en la app:** Pendiente
- **Pestaña / se abre desde:** Grupos / GR_03 (cuando hay ofertas)
- **Horas estimadas:** 36 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** Cards de profesionales/ofertas + Votar + countdown + resultado.
- **Flujo:** Ofertas → voting → close → selected_offer → crear evento idempotente · Empate/no quórum → regla de fallback · Entrada: GR_03 cuando llegan ofertas, y notificación push (v20)
- **Estados:** En el flujo: empate o sin quórum → fallback (en el flujo) · Falta definir: captura del resultado, votación cerrada, empate
- **Datos:** Lee: provider_offers, offer_votes · Escribe: offer_votes, events (crea el evento ganador)

### LU_04 · Postulación de instructor

- **Estado en la app:** Pendiente
- **Pestaña / se abre desde:** Grupos / GR_03 (supuesto)
- **Horas estimadas:** 20 · **Diseño:** BASE LISTA · **Rol:** Organizador / profesional
- **UI:** 'Postulación de instructor · Comparte tu experiencia profesional'. Campos: Servicio o especialidad, Años de experiencia (lista), Certificaciones (agregar; archivo adjunto 'Certificado Yoga.pdf 2.4 MB' con quitar) y Fotos de tu trabajo (hasta 5 y botón agregar). Botón 'Enviar postulación' y mensaje 'Tu postulación está en revisión. Te avisaremos por correo cuando tengamos una respuesta'.
- **Flujo:** Desde el bloque '¿Eres instructor? Postúlate' de GR_03 → LU_04 · Enviar postulación → confirmación y estado 'en revisión' · Si se aprueba, el profesional recibe oportunidades en LU_02
- **Estados:** En el flujo: estado 'en revisión' (en la captura) · Falta definir: validaciones del formulario, error de envío, postulación rechazada
- **Datos:** Lee: provider_profiles · Escribe: provider_profiles (postulación)

### PF_04 · Mis intereses

- **Estado en la app:** Hecha (set_my_interests real; "más populares" provisional)
- **Pestaña / se abre desde:** Perfil / PF_01
- **Horas estimadas:** 8 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** 'Mis intereses · Selecciona los temas que te interesan'. Buscador y dos secciones, 'Más populares' y 'Todos los intereses', con chips con icono (Yoga, Senderismo, Cocina, Arte, Música, Viajes, Bienestar, Fotografía, Tecnología, Lectura, Deporte, Meditación); los elegidos van en azul. Botón 'Guardar intereses (3)'.
- **Flujo:** Acceso 'Mis intereses' en PF_01 → PF_04 · Guardar → PF_01
- **Estados:** En el flujo: — · Falta definir: error al guardar
- **Datos:** Lee: interests, user_interests · Escribe: user_interests

### PF_05 · Mis eventos

- **Estado en la app:** Hecha con datos de ejemplo (falta get_my_events en el backend)
- **Pestaña / se abre desde:** Perfil / PF_01
- **Horas estimadas:** 14 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** 'Mis eventos' con pestañas 'Próximos (3)' y 'Pasados (5)'. Tarjetas con foto, nombre, fecha y hora, lugar y estado (Confirmada o Lista de espera) y flecha.
- **Flujo:** Acceso 'Mis eventos' en PF_01 (o 'Ver en mis eventos' tras reservar) → PF_05 · Tocar un evento → EX_03
- **Estados:** En el flujo: — · Falta definir: vacío (sin eventos próximos o pasados), cargando, error
- **Datos:** Lee: event_participants, events, reservations · Escribe: —

### PF_06 · Métodos de pago (gestión)

- **Estado en la app:** Hecha con datos de ejemplo (falta tabla payment_methods y proveedor de pagos)
- **Pestaña / se abre desde:** Perfil / PF_01
- **Horas estimadas:** 22 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** Título 'Métodos de pago'. Tarjeta informativa: 'Tus métodos de pago se usan para reservas y beneficios. Puedes agregar, editar o eliminar tus tarjetas en cualquier momento'. Sección 'Mis métodos de pago' con Visa terminada en 4242 (vence 12/2028, etiqueta 'Predeterminada') y Mastercard terminada en 1887 (vence 08/2027), ambas con flecha. Tarjeta punteada 'Agregar tarjeta: guarda una nueva tarjeta de crédito o débito' y botón fijo 'Agregar nuevo método'.
- **Flujo:** Acceso 'Métodos de pago' en PF_01 (o 'Gestionar' en el checkout) → PF_06 · Agregar tarjeta → formulario del proveedor de pagos → vuelve a la lista · Eliminar → confirmación
- **Estados:** En el flujo: — · Falta definir: vacío (sin tarjetas), tarjeta rechazada, detalle de editar o eliminar, error
- **Datos:** Lee: payment_methods · Escribe: payment_methods (agregar / editar / eliminar / predeterminada)

### PF_11 · Eliminar cuenta (modal)

- **Estado en la app:** Pendiente
- **Pestaña / se abre desde:** Perfil / PF_02
- **Horas estimadas:** 12 · **Diseño:** BASE LISTA · **Rol:** Usuario
- **UI:** Modal sobre la pantalla Configuración (oscurecida). Ícono de papelera, título 'Eliminar cuenta', texto 'Esta acción eliminará tu perfil, tus reservas y tus conexiones. No se puede deshacer'. Campo 'Confirma tu contraseña' con mostrar / ocultar, botón rojo 'Eliminar cuenta', botón 'Cancelar' y cierre con X.
- **Flujo:** Opción 'Eliminar cuenta' en PF_02 → PF_11 · Confirmar → cierra sesión y vuelve a la pantalla de acceso · Cancelar → PF_02
- **Estados:** En el flujo: — · Falta definir: contraseña incorrecta, usuario sin contraseña (Google / Apple), error de red
- **Datos:** Lee: users, auth_credentials · Escribe: users (cuenta eliminada o anonimizada), sessions


## No entran todavía (8)

- PE_01 · Descubrir personas — Queda fuera (Ola 4)
- PE_02 · Perfil público de persona — En decisión (Ola 3)
- PE_03 · Conexiones — En decisión (Ola 3)
- CH_02 · Chat individual — Queda fuera (Ola 4)
- PF_07 · Sub-pantallas de Configuración — En decisión (Ola 3)
- PF_08 · Historial de actividades — En decisión (Ola 3)
- PF_09 · Beneficios y créditos — Queda fuera (Ola 4)
- PF_10 · Verificación de identidad — En decisión (Ola 4)
