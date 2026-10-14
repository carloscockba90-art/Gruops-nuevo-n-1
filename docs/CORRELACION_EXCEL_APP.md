# Correlación Excel v31 ↔ app

Se actualiza en cada tanda de pantallas. Sirve para decidir si se corrige la app, el Excel o el backend.

## Resuelto
- Barra de 6 pestañas con Perfil (decisión v31) y avatar que también abre Perfil: la app ya lo hace así.
- "Personas que podrías conocer" se mantiene en IN_01 (v31 no lo quita): la app lo muestra con datos de ejemplo.
- AU_01–AU_05 construidas según las capturas del Excel (hero oscuro, formulario con ojo, código de 6 dígitos, grid de intereses).

## Diferencias abiertas
| # | Excel | App / backend | Propuesta |
|---|---|---|---|
| 1 | AU_04 usa tablas `otp_codes` / endpoints `/auth/otp/*` | Supabase Auth gestiona el código solo: `verifyOtp` y `resend`. No existe tabla propia | Actualizar columnas de datos y endpoints de AU_03/AU_04. Requiere editar la plantilla "Confirm signup" de Supabase para que el correo incluya `{{ .Token }}` |
| 2 | AU_02/AU_01: acceso con Google y Apple | Botones visibles; no activos | Configurar proveedores en Supabase y Expo (sprint de acceso real) |
| 3 | AU_05 muestra 9 intereses (Running, Yoga, Pádel, Trekking, Cocina, Música, Surf, Fotografía, Viajes) | El catálogo de la base tiene 14 y no incluye Trekking, Surf ni Viajes (sí Senderismo, Ciclismo, etc.) | Decidir el catálogo final y ajustar la migración 5 |
| 4 | IN_01: tarjetas con lugar, categoría, asistentes y "en común"; bloque de personas | `get_home` no devuelve esos campos ni personas; no existen funciones de conexiones | Ampliar `get_home` (migración nueva) o mostrar solo lo disponible |
| 5 | IN_01 comenta "avatar a la izquierda" | La imagen lo muestra a la derecha; la app lo deja a la derecha | Corregir el comentario del Excel |
| 6 | Lucas: texto + voz | Micrófono solo visual | Definir si la voz entra al lanzamiento |
| 7 | Endpoints REST tentativos (`GET /home`, `POST /auth/register`) | Funciones `rpc` y Supabase Auth | Actualizar la columna "Endpoints" |
| 8 | Eventos e intereses con fotos | Bloques de color e iconos | Subir fotos a Storage cuando existan |
| 9 | IN_02 muestra notificaciones de conexión y comentarios en eventos | El backend solo genera group_complete, offers_received, voting_closing, option_selected, demand_expired, invite_received, group_created | La app muestra los 7 tipos que existen. Decidir si conexión/comentario entran al lanzamiento (requiere backend de conexiones) |
| 10 | IN_02: tocar abre EX_03 o PE_03 | Abre GR_03 (demanda) o Grupos (grupo), porque EX_03/PE_03 aún no existen | Se reconecta al construir Explorar y Personas |
| 11 | GR_03: fecha y lugar del grupo | `demand_intents` no guarda fecha/lugar; la app los muestra solo en datos de ejemplo | Agregar columnas (migración) o quitar del diseño |
| 12 | GR_04: invitar conexiones | No hay función para listar/solicitar/aceptar conexiones. `create_group_invites` solo vale para un grupo ya creado, no para una demanda | En grupo en formación solo se ofrece enlace; las conexiones salen vacías fuera del modo demo |
| 13 | LU_01 comenta un banner "Crear grupo automático" | Regla vigente: el equipo crea el grupo, no es automático (CONTEXTO.md) | La app usa "Crear una propuesta con Lucas": Lucas propone, la persona confirma y se abre una demanda (GR_03). Eliminar el texto "automático" del Excel |
| 14 | LU_01: "Me interesa" en tarjetas de evento | EX_03 (detalle de evento) aún no existe | Por ahora lleva a Explorar |
| 15 | EX_02a/02b: filtros de fecha, horario, precio (slider), nivel, duración (slider), tamaño de grupo, cupos, verificados y amigos | `search_events` solo filtra por texto, categoría, ciudad y orden (fecha, precio, valoración). La app filtra fecha, horario, precio (rangos), modalidad y orden en el dispositivo sobre hasta 50 resultados | Nivel, duración, tamaño, cupos, verificados y amigos se ven como "Pronto". Hay que decidir si entran al lanzamiento y ampliar `events`/`search_events` (migración); el slider y "Personalizar" fecha quedan pendientes |
| 16 | Categorías del diseño: Deportes, Bienestar, Cultura, Gastronomía, Naturaleza, Social, Aprendizaje | La base tiene Deporte, Bienestar, Gastronomía, Cultura, Aire libre, Aprender, Social | Elegir los nombres finales y ajustar la migración 5 (o el Excel) |
| 17 | EX_02: tarjeta con lugar, categoría, participantes y valoración | `search_events` no devuelve categoría, lugar ni cantidad de participantes (sí valoración y precio) | Ampliar `search_events`; en modo demo se ven completos |
| 18 | EX_03: anfitrión "Instructor certificado" y grupo asociado | `get_event` no trae si el anfitrión está verificado ni el grupo asociado | Ampliar `get_event`. "Reservar" abre una pantalla "Próximamente" hasta construir RS_01 |
| 19 | Precios en pesos chilenos ($15.000) | La base usa MXN por defecto | Decidir la moneda del lanzamiento. La app muestra "$" sin código de moneda |
| 20 | GR_01/GR_02 muestran foto del grupo y del evento | No hay imagen en `groups`; `get_group` solo trae el próximo evento | Agregar foto de grupo (Storage) y lista de eventos del grupo |
| 21 | GR_02: pestaña Chat y tocar un miembro | CH_03 y PE_02 aún no existen | La pestaña Chat muestra aviso; los miembros no son tocables todavía |
| 22 | PF_01: accesos a Intereses, Eventos, Conexiones, Métodos de pago (y PF_08–PF_10) | Esas pantallas son de la Ola 3 | Los accesos abren "Próximamente". PF_08–PF_10 no tienen fila en el Excel maestro |
| 23 | PF_02: opciones internas (PF_07) y Privacidad | PF_07 no está definida. El backend guarda 4 avisos + idioma | Notificaciones se despliega con 4 interruptores; Privacidad abre PF_03 (donde está el interruptor público/privado, v20); Idioma solo español |
| 24 | PF_03: foto con botón de cámara | Falta el selector de imágenes y el bucket `avatars` real | El botón avisa que llegará con el almacenamiento de archivos |
| 25 | Ola 3 (reservas, pagos, mis eventos, métodos de pago) | El backend actual es el de la beta cerrada: no existen reservas, pagos, `payment_methods` ni `get_my_events` | Las pantallas funcionan con datos de ejemplo y usan nombres de función propuestos. Lista completa en `docs/BACKEND_PENDIENTE_OLA3.md` |
| 26 | RS_02: formulario con número de tarjeta, MM/AA y CVV dentro de la app (el título de la imagen dice "Método de papo") | Guardar o enviar datos de tarjeta a nuestro backend no es aceptable (seguridad y normas de tarjetas) | En la demostración el formulario es simulado y no guarda nada. En producción lo muestra el proveedor de pagos (Stripe, MercadoPago u otro): hay que elegirlo. Corregir "papo" → "pago" en el Excel |
| 27 | RS_01/RS_02 no muestran el tiempo del cupo apartado ni tarjetas guardadas | El flujo dice "hold de cupo" y PF_06 pide "Gestionar" desde el checkout | La app muestra una cuenta regresiva de 10 minutos (valor propuesto), el estado "tu cupo expiró" y las tarjetas guardadas con enlace a Gestionar |
| 28 | RS_02 incluye "Transferencia" sin detallar | No hay flujo definido para confirmar una transferencia | Queda como reserva "Pago pendiente" (visible en PF_05). Definir quién la confirma y en cuánto tiempo |
| 29 | PF_05 muestra "Lista de espera" | No hay forma de entrar a una lista de espera: una sesión sin cupos solo aparece deshabilitada en RS_01 | Definir el flujo de lista de espera (EX_03 "evento sin cupos" ya estaba en "Falta definir") |
| 30 | RS_03: "Ir al chat del grupo", "Ver mis reservas" | CH_03 aún no existe; PF_05 se llama "Mis eventos" | El chat abre "Próximamente". "Ver mis reservas" abre Mis eventos. Calendario y ubicación abren enlaces de Google |
| 31 | EX_04: "Acceso por definir" | — | Resuelto: corazón junto al buscador en EX_02 |
| 32 | PF_04: intereses del diseño (Tecnología, Lectura, Viajes…) y "Más populares" | La base tiene 14 intereses distintos y no hay métricas de popularidad | "Más populares" = los 6 primeros del catálogo (provisional). Ver fila 3 sobre el catálogo final |
| 33 | PF_06: editar tarjeta | El Excel marca "detalle de editar o eliminar" como por definir | Al tocar una tarjeta: hacer predeterminada o eliminar (con confirmación). Máximo 5 tarjetas (valor propuesto) |
| 34 | EV_01 (imagen) pide modalidad **y** categoría; el texto del Excel solo dice modalidad. EV_02 también tiene selector de categoría | — | La categoría se elige en EV_01 y se puede cambiar en EV_02. Las categorías del diseño (Bienestar, Deporte, Gastronomía, Cultura, Cursos, Otro, Arte) no coinciden con la base (ver fila 16). Ajustar el Excel o la migración |
| 35 | Numeración de pasos: EV_03 dice "Paso 2 de 3 · Detalles" y EV_04b "Paso 3 de 3 · Precio"; EV_01 muestra 4 puntos y EV_02 no muestra paso | — | Pasos: 1 = tipo, categoría e información · 2 = detalles y periodicidad · 3 = precio. Unificado en un encabezado "Paso n de 3" con barra |
| 36 | EV_03 dice "Evento único → EV_05; Recurrente → EV_04", pero EV_03 no tiene opción de recurrencia (la pregunta "¿Se repite esta clase?" está en EV_04) | — | Siempre EV_03 → EV_04. Si elige "Evento único", EV_04 solo muestra la fecha y sigue a precio. Actualizar el flujo del Excel |
| 37 | EV_04 repite "Fecha de inicio", que ya se eligió como "Fecha" en EV_03 | — | Es el mismo dato: cambiar uno cambia el otro |
| 38 | EV_04: "Personalizada" y el texto "(continua)" no están explicados | — | Personalizada = elegir fechas una por una. "Sin fecha de fin" muestra las primeras 12 sesiones. Máximo 52 sesiones por evento (valor propuesto). Mensual repite el mismo día del mes (si el mes no lo tiene, lo salta) |
| 39 | EV_04 dice "si es gratis → EV_04b; si es de pago → EV_05", pero quién decide si es gratis es el conmutador que está dentro de EV_04b | — | EV_04b y EV_05 son la misma pantalla con el conmutador Gratis \| Pagado (resuelve la duda "pantalla propia o parte de EV_05") |
| 40 | EV_05: "Capacidad por sesión" repite "Cupos disponibles" de EV_03; porcentajes 75 % / 20 % / 5 % | No existe la tabla `platform_fees` | Capacidad y cupos son el mismo dato. Los porcentajes están fijos en la app hasta crear `platform_fees`. El Excel menciona "métodos de pago" en EV_05 y el diseño no los muestra: definir cómo cobra el anfitrión |
| 41 | EV_03: "Instructor o profesional" con certificación | No existen `provider_profiles` | El campo muestra "Sin instructor" y avisa que llegará con Lucas profesional (LU_02–LU_04) |
| 42 | EV_01 "Falta definir: salir sin guardar (borrador)" y quién puede crear eventos (rol "Organizador / profesional") | El backend no tiene función de borradores ni distingue organizadores | El borrador se guarda solo en este dispositivo y reaparece en la pestaña Crear ("Continuar / Empezar de nuevo"). Hoy cualquier persona ve Crear: definir si hay que ser organizador verificado. La pestaña Crear también ofrece "Hablar con Lucas" |
| 43 | EV_05 termina en EV_06 (vista previa) | EV_06 se construye en la próxima tanda | Por ahora el último botón abre "Próximamente" |
