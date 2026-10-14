# Backend pendiente para las pantallas de la Ola 3

Las migraciones actuales cubren la **beta cerrada**. Las pantallas de la Ola 3 ya existen en la app con datos de ejemplo
(modo demostración) y llaman funciones con los nombres de abajo. Cuando se escriba cada migración, la pantalla pasa a datos
reales sin cambios de diseño. Los nombres y campos son una **propuesta**: se pueden ajustar al escribir la migración.

Regla de siempre: la app lee tablas protegidas por RLS y escribe solo con funciones `rpc` (SECURITY DEFINER).

## Reservas y pagos (RS_01, RS_02, RS_03, PF_05, PF_06)

| Función / tabla | Qué hace | Pantalla |
|---|---|---|
| tabla `reservations` | id, user_id, event_id, session_id, status (`hold`, `confirmed`, `pending_payment`, `waitlist`, `cancelled`, `expired`), hold_expires_at, amount_cents, currency | RS_01–03, PF_05 |
| `create_reservation_hold(p_session_id)` | Aparta 1 cupo por 10 minutos (valor en `app_config`). Errores: `session_full`, `session_not_found`, `already_reserved` | RS_01 |
| `get_reservation(p_reservation_id)` | Devuelve la reserva con evento y sesión | RS_02, RS_03 |
| `confirm_reservation(p_reservation_id, p_payment)` | Cobra y confirma; crea `event_participants`, notificación y (cuando exista) membresía del chat. Errores: `hold_expired`, `card_declined` | RS_02 |
| `get_my_events()` | `{upcoming:[…], past:[…]}` con estado de cada reserva | PF_05 |
| job `expire_holds` | Libera cupos de holds vencidos (como `expire_stale_demands`) | RS_01 |
| tabla `payments` | Registro de cada cobro (id del proveedor, monto, estado) | RS_02 |

## Métodos de pago (PF_06)

| Función / tabla | Qué hace |
|---|---|
| tabla `payment_methods` | user_id, provider_ref, brand, last4, exp_month, exp_year, is_default. **Nunca** número completo ni CVV |
| `add_payment_method(p_provider_token, …)` | Guarda la referencia que entrega el proveedor de pagos |
| `remove_payment_method(p_id)` · `set_default_payment_method(p_id)` | Eliminar y cambiar predeterminada |

**Decisión previa:** elegir proveedor de pagos (Stripe, MercadoPago u otro). El formulario de tarjeta lo muestra el proveedor
y a Groups solo llega un identificador. También hay que decidir la moneda del lanzamiento (hoy la base usa MXN por defecto).

## Crear evento (EV_01–EV_09)

| Función / tabla | Qué hace | Pantalla |
|---|---|---|
| `save_event_draft(p_event_id, p_data)` | Crea o actualiza el borrador (`events.status = 'draft'`) del anfitrión. Hoy el borrador vive solo en el dispositivo | EV_01–EV_05 |
| `set_event_sessions(p_event_id, p_sessions)` | Reemplaza las sesiones (`event_sessions`); validar fechas futuras, máximo 52 y que el evento sea del anfitrión | EV_04 |
| `publish_event(p_event_id)` | Valida y pasa a `published` (EV_06/EV_07) | EV_06, EV_07 |
| tabla `platform_fees` | Porcentajes de reparto (hoy 75 % anfitrión / 20 % comisión / 5 % gastos, tomados del diseño) | EV_05 |
| tabla `provider_profiles` | Profesionales certificados que se pueden asignar a un evento | EV_03, LU_02–LU_04 |
| `events` | Agregar duración por sesión si hace falta (hoy sale de `ends_at`) y política de quién puede crear | EV_03 |

## Otras mejoras de funciones existentes

| Función | Qué agregar | Pantalla |
|---|---|---|
| `search_events` | Devolver categoría, lugar y cantidad de participantes; filtros de nivel, duración, tamaño del grupo, cupos, verificados | EX_02 |
| `get_event` | Anfitrión verificado y grupo asociado | EX_03 |
| `get_my_groups` / `get_group` | Foto del grupo y lista de eventos | GR_01, GR_02 |
| conexiones | Listar, solicitar y aceptar (hoy solo existe la tabla) | GR_04, PF_01 |

## Siguientes tandas (todavía sin backend)

Crear evento (EV_01–EV_09), chats (CH_01, CH_03, tablas `conversations`/`messages` + Realtime), Lucas profesional
(LU_02–LU_04, votación) y eliminar cuenta (PF_11).
