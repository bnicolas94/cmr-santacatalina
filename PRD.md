# PDR / PRD — CRM propio de WhatsApp para Santa Catalina

**Versión:** 1.0  
**Fecha:** 21 de julio de 2026  
**Estado:** Documento maestro para desarrollo  
**Modalidad de trabajo:** ChatGPT + Codex de escritorio + GitHub  
**Nombre provisional del producto:** Santa Catalina CRM

---

## 1. Resumen ejecutivo

Santa Catalina utiliza un único número de WhatsApp como principal canal de contacto con clientes. La operación actual depende de un celular y de varias sesiones de WhatsApp Web, lo que provoca lentitud, mensajes que no cargan, dificultades para publicar estados, riesgo de respuestas duplicadas y ausencia de trazabilidad sobre quién atendió cada conversación.

El proyecto propone desarrollar un CRM web propio conectado oficialmente a **WhatsApp Business Platform — Cloud API**, con una bandeja multiusuario, ficha unificada de clientes, gestión de pedidos, asignación de conversaciones, auditoría, respuestas rápidas e integración progresiva con producción, pagos y reparto.

La implementación deberá realizarse de forma gradual y segura. Durante la primera etapa se utilizará un número de prueba. El número comercial actual solo se incorporará cuando el sistema haya superado las pruebas técnicas, operativas y de contingencia. Se priorizará, cuando la cuenta resulte elegible, un esquema de coexistencia con WhatsApp Business para conservar funciones operativas que continúen dependiendo de la aplicación móvil.

---

## 2. Problema a resolver

### 2.1 Situación actual

- Un único número comercial concentra consultas, pedidos y reclamos.
- El celular asociado presenta bloqueos y demoras.
- WhatsApp Web funciona de forma irregular.
- No existe una bandeja centralizada con usuarios independientes.
- No queda registro confiable de qué empleado respondió.
- Dos empleados pueden responder simultáneamente al mismo cliente.
- El historial comercial está mezclado con la conversación.
- La carga de pedidos se realiza fuera del chat o de manera manual.
- No existe una medición consistente de tiempos de atención.
- El negocio depende excesivamente de un solo dispositivo y una sola aplicación.
- Los Estados de WhatsApp son relevantes para las ventas, por lo que no deben perderse durante la transición.

### 2.2 Impacto

- Riesgo de perder ventas por mensajes demorados o sin respuesta.
- Errores en productos, cantidades, domicilios, fechas o franjas horarias.
- Duplicación de trabajo.
- Dificultad para capacitar y supervisar telefonistas.
- Ausencia de métricas de rendimiento.
- Riesgo operativo alto ante pérdida, rotura o bloqueo del celular.
- Escasa capacidad de integrar atención, pedidos, producción y logística.

---

## 3. Objetivos del producto

### 3.1 Objetivo principal

Crear una plataforma web estable para que múltiples empleados atiendan el WhatsApp de Santa Catalina, gestionen clientes y conviertan conversaciones en pedidos trazables sin depender operativamente de WhatsApp Web.

### 3.2 Objetivos específicos

1. Centralizar todas las conversaciones en una bandeja propia.
2. Permitir atención simultánea con usuarios, roles y permisos.
3. Evitar respuestas duplicadas mediante asignación y bloqueo lógico.
4. Registrar quién leyó, tomó, respondió, transfirió y cerró cada conversación.
5. Crear o actualizar la ficha del cliente automáticamente a partir del número.
6. Convertir una conversación en pedido sin recargar los datos.
7. Diferenciar claramente pedidos de **envío** y **retira**.
8. Integrar catálogo, sabores, cantidades, precios, promociones y costos de envío.
9. Mostrar conversaciones y pedidos en tiempo real.
10. Permitir respuestas rápidas y plantillas aprobadas.
11. Conservar el historial desde la fecha de puesta en marcha.
12. Incorporar automatizaciones e IA de manera progresiva y supervisada.
13. Preparar la integración futura con producción, caja, pagos y reparto.
14. Reducir la dependencia del celular principal.
15. Mantener un plan de contingencia para no perder el canal comercial.

---

## 4. Métricas de éxito

El MVP será considerado exitoso cuando alcance:

- 99,5 % de disponibilidad mensual, excluyendo incidentes de Meta.
- 95 % de mensajes entrantes visibles en la bandeja dentro de los 5 segundos posteriores al webhook.
- 99 % de mensajes procesados sin duplicación.
- Cero pérdida de mensajes confirmados por el webhook.
- Reducción mínima del 50 % en respuestas duplicadas.
- Registro de autor en el 100 % de los mensajes salientes.
- Creación de un pedido desde una conversación en menos de 2 minutos.
- Al menos 90 % de los pedidos con cliente, modalidad, fecha, productos y total completos.
- Recuperación ante caída del servidor sin pérdida de eventos ya recibidos.
- Aprobación operativa por parte de al menos un administrador y dos telefonistas antes de incorporar el número real.

---

## 5. Usuarios y roles

### 5.1 Administrador

Puede:

- Gestionar usuarios, roles y permisos.
- Configurar sedes, horarios y parámetros.
- Gestionar números de WhatsApp y plantillas.
- Ver todas las conversaciones y pedidos.
- Modificar catálogo y precios.
- Acceder a auditoría, métricas y configuración.
- Reasignar conversaciones.
- Ejecutar acciones de contingencia.
- Exportar información.

### 5.2 Supervisor

Puede:

- Ver todas las conversaciones.
- Asignar y transferir chats.
- Intervenir en conversaciones.
- Ver desempeño de telefonistas.
- Modificar pedidos dentro de los permisos establecidos.
- Resolver conflictos o reclamos.
- Reabrir conversaciones.

### 5.3 Telefonista / Administrativa

Puede:

- Ver conversaciones disponibles y asignadas.
- Tomar una conversación.
- Responder mensajes.
- Crear o actualizar clientes.
- Crear pedidos.
- Usar respuestas rápidas.
- Solicitar intervención de un supervisor.
- Cerrar o derivar conversaciones.

### 5.4 Producción

Puede:

- Ver pedidos confirmados asignados a una sede.
- Ver productos, cantidades, horarios y observaciones.
- Actualizar estados operativos autorizados.
- No puede acceder a conversaciones privadas completas, salvo información necesaria.

### 5.5 Reparto

Puede:

- Ver entregas asignadas.
- Consultar nombre, teléfono, dirección, franja horaria, importe y observaciones.
- Marcar salida, entrega, intento fallido o incidencia.
- No puede acceder a configuración ni conversaciones no relacionadas.

### 5.6 Auditor / Solo lectura

Puede:

- Consultar reportes, conversaciones y pedidos.
- No puede enviar mensajes ni modificar registros.

---

## 6. Alcance del MVP

### 6.1 Incluido

- Inicio de sesión.
- Usuarios, roles y permisos.
- Una organización: Santa Catalina.
- Múltiples sedes.
- Integración con un número de prueba de WhatsApp Cloud API.
- Recepción de mensajes mediante webhooks.
- Envío de mensajes desde el CRM.
- Texto, imágenes, audios, videos, documentos y ubicación cuando la API lo permita.
- Estados de envío: pendiente, enviado, entregado, leído y fallido.
- Bandeja multiusuario.
- Filtros y búsqueda.
- Asignación de conversaciones.
- Prevención de respuestas simultáneas.
- Etiquetas y estados.
- Ficha del cliente.
- Direcciones múltiples por cliente.
- Notas internas.
- Respuestas rápidas.
- Gestión básica de plantillas.
- Creación y edición de pedidos.
- Productos, variantes/sabores, cantidades y precios.
- Modalidad envío o retira.
- Fecha, franja horaria, sede, pago y observaciones.
- Historial de cambios.
- Panel básico de pendientes.
- Auditoría.
- Configuración de entorno.
- Backups.
- Pruebas automatizadas prioritarias.
- Registro estructurado de errores.

### 6.2 Fuera del MVP

- Publicación automática de Estados.
- Campañas masivas.
- Bot completamente autónomo.
- Facturación electrónica.
- Conciliación bancaria automática.
- Optimización avanzada de rutas.
- Aplicación móvil nativa.
- Gestión integral de stock.
- Contabilidad.
- Liquidación de sueldos.
- SaaS para terceros.
- Migración automática de todo el historial antiguo de WhatsApp.
- Integración definitiva con Mercado Pago.
- Integración con impresoras y lectores.
- Llamadas de WhatsApp.
- Analítica avanzada basada en IA.

Estos puntos podrán incorporarse en fases posteriores.

---

## 7. Principios del producto

1. **No perder mensajes.**
2. **No duplicar mensajes.**
3. **Toda acción relevante debe ser auditable.**
4. **La atención humana tiene prioridad sobre la automatización.**
5. **La IA sugiere antes de actuar.**
6. **Los pedidos deben ser consistentes aunque la conversación sea desordenada.**
7. **La falla de una integración no debe bloquear toda la plataforma.**
8. **El número productivo no se toca hasta validar un entorno de prueba.**
9. **Las credenciales nunca se incluyen en el repositorio.**
10. **Cada fase debe quedar usable, probada y reversible.**

---

## 8. Flujos principales

### 8.1 Nuevo mensaje entrante

1. El cliente envía un mensaje.
2. Meta envía el evento al webhook.
3. El backend valida la firma y registra el evento bruto.
4. Se verifica si el evento ya fue procesado.
5. Se identifica o crea el contacto.
6. Se identifica o crea la conversación.
7. Se guarda el mensaje.
8. Si contiene multimedia, se crea una tarea de descarga.
9. Se actualiza la bandeja en tiempo real.
10. Se aplican reglas de prioridad y asignación.
11. Se registra auditoría.

### 8.2 Atención manual

1. El telefonista abre una conversación.
2. El sistema muestra si está libre, asignada o bloqueada.
3. El telefonista toma la conversación.
4. El CRM registra usuario y hora.
5. El telefonista escribe o utiliza una respuesta rápida.
6. El backend valida la ventana de atención y el tipo de mensaje.
7. El mensaje se envía a Meta.
8. Se guarda con estado pendiente.
9. Los webhooks posteriores actualizan enviado, entregado, leído o fallido.
10. Se registra autor y trazabilidad.

### 8.3 Creación de pedido

1. Desde la conversación se selecciona “Crear pedido”.
2. Se reutilizan cliente, teléfono y direcciones conocidas.
3. Se selecciona sede.
4. Se define fecha y franja horaria.
5. Se define modalidad: envío o retira.
6. Si es envío, se valida domicilio y costo.
7. Se agregan productos, sabores y cantidades.
8. El sistema calcula subtotal, descuentos, envío y total.
9. Se registra modalidad de pago.
10. Se valida información obligatoria.
11. El pedido queda como borrador o confirmado.
12. Se envía confirmación al cliente.
13. Producción recibe el pedido cuando corresponde.

### 8.4 Transferencia de conversación

1. El telefonista solicita transferencia.
2. Selecciona usuario, equipo o sede.
3. Agrega una nota interna opcional.
4. El sistema libera el bloqueo anterior.
5. Se notifica al nuevo responsable.
6. La acción queda auditada.

### 8.5 Reclamo

1. La conversación se etiqueta como reclamo.
2. Se marca prioridad alta.
3. Se vincula el pedido, si existe.
4. Se solicita intervención de supervisor.
5. Se registran resolución, compensación y cierre.

---

## 9. Estados del sistema

### 9.1 Estados de conversación

- NUEVA
- SIN_ASIGNAR
- ASIGNADA
- EN_ATENCION
- ESPERANDO_CLIENTE
- ESPERANDO_ACCION_INTERNA
- PEDIDO_EN_CARGA
- PEDIDO_CONFIRMADO
- RECLAMO
- CERRADA
- ARCHIVADA

### 9.2 Estados de mensaje

- RECIBIDO
- PENDIENTE_ENVIO
- ENVIADO
- ENTREGADO
- LEIDO
- FALLIDO
- CANCELADO

### 9.3 Estados de pedido

- BORRADOR
- PENDIENTE_DATOS
- PENDIENTE_PAGO
- CONFIRMADO
- EN_PRODUCCION
- LISTO
- EN_REPARTO
- ENTREGADO
- RETIRADO
- CANCELADO
- INCIDENCIA

### 9.4 Estados de pago

- NO_DEFINIDO
- PENDIENTE
- PARCIAL
- PAGADO
- RECHAZADO
- REEMBOLSADO

---

## 10. Requerimientos funcionales

### RF-001 — Autenticación

- El usuario deberá iniciar sesión con email o identificador y contraseña.
- Las contraseñas deberán almacenarse con hash seguro.
- El sistema deberá soportar cierre de sesión global.
- Las sesiones deberán expirar.
- El administrador podrá desactivar usuarios.
- Se deberá registrar último acceso e intentos fallidos.

### RF-002 — Autorización

- Cada acción deberá validarse en backend.
- Ocultar un botón en frontend no será considerado control suficiente.
- Los permisos deberán poder agruparse por rol.
- Las acciones críticas requerirán permiso específico.

### RF-003 — Recepción de webhooks

- El endpoint deberá verificar autenticidad.
- Deberá responder rápidamente a Meta.
- El evento bruto deberá persistirse antes del procesamiento.
- El procesamiento deberá ser idempotente.
- Los fallos deberán reintentarse.
- Los eventos no procesables deberán ir a una cola de errores.

### RF-004 — Bandeja

La bandeja deberá mostrar:

- Nombre o número.
- Vista previa del último mensaje.
- Fecha y hora.
- Cantidad de no leídos.
- Estado.
- Responsable.
- Etiquetas.
- Prioridad.
- Sede.
- Indicador de pedido vinculado.
- Indicador de ventana de 24 horas.

Filtros mínimos:

- Nuevas.
- Sin asignar.
- Mías.
- Esperando cliente.
- Reclamos.
- Cerradas.
- Por sede.
- Por etiqueta.
- Por responsable.
- Con mensajes no leídos.
- Con pedidos pendientes.

### RF-005 — Conversación

Debe incluir:

- Historial cronológico.
- Separadores por fecha.
- Autor de mensajes salientes.
- Visualización de multimedia.
- Respuesta rápida.
- Nota interna.
- Estado de entrega.
- Mensaje citado cuando esté disponible.
- Indicador de conversación asignada.
- Indicador de otro usuario activo.
- Panel lateral de cliente y pedidos.
- Acción de tomar, transferir, cerrar y reabrir.

### RF-006 — Concurrencia

- Una conversación podrá tener un responsable principal.
- El sistema deberá advertir si otro usuario está escribiendo.
- Podrá configurarse bloqueo exclusivo o colaboración.
- Para el MVP se usará bloqueo lógico renovable.
- El bloqueo deberá caducar automáticamente ante desconexión prolongada.
- Un supervisor podrá forzar liberación.

### RF-007 — Clientes

Datos mínimos:

- ID interno.
- Número en formato internacional.
- Nombre visible de WhatsApp.
- Nombre corregido por la empresa.
- Email.
- DNI/CUIT opcional.
- Sede habitual.
- Modalidad habitual.
- Observaciones.
- Fecha de alta.
- Último contacto.
- Consentimientos y bloqueos.
- Cantidad y total histórico de pedidos.

### RF-008 — Direcciones

- Un cliente podrá tener múltiples direcciones.
- Se podrá marcar una como predeterminada.
- Campos: calle, número, piso, departamento, localidad, provincia, código postal, referencia y geolocalización opcional.
- No se sobrescribirá una dirección histórica de un pedido ya confirmado.

### RF-009 — Pedidos

Campos obligatorios para confirmar:

- Cliente.
- Fecha.
- Franja horaria.
- Sede.
- Modalidad.
- Al menos un producto.
- Total.
- Estado.
- Método de pago.
- Dirección cuando sea envío.

Reglas:

- Todo pedido tendrá número único.
- Los importes se almacenarán como enteros en centavos o decimal exacto.
- El precio utilizado quedará congelado en el detalle.
- Cambiar el catálogo no modificará pedidos previos.
- Todo cambio relevante generará auditoría.
- Un pedido podrá vincularse a una conversación.
- Una conversación podrá tener varios pedidos históricos.

### RF-010 — Catálogo

- Productos activos e inactivos.
- Categorías.
- Variantes y sabores.
- Unidad comercial.
- Cantidad por plancha o presentación cuando corresponda.
- Precio base.
- Reglas por cantidad.
- Promociones con vigencia.
- Disponibilidad por sede.
- Observaciones para producción.

### RF-011 — Cálculo de precio

El motor deberá contemplar:

- Precio de producto.
- Variante o sabor.
- Cantidad.
- Descuento por volumen.
- Promoción vigente.
- Costo de envío.
- Bonificación manual autorizada.
- Redondeo.
- Total final.

Toda modificación manual deberá registrar:

- Usuario.
- Motivo.
- Valor anterior.
- Valor nuevo.
- Fecha y hora.

### RF-012 — Respuestas rápidas

- Título interno.
- Texto.
- Categoría.
- Variables.
- Sede.
- Activa/inactiva.
- Atajo de teclado o comando.
- Permisos de edición.

### RF-013 — Plantillas de WhatsApp

- Listar plantillas configuradas.
- Idioma.
- Categoría.
- Estado de aprobación.
- Variables requeridas.
- Vista previa.
- Registro de envíos.
- Validación previa de variables.
- No permitir texto libre fuera de la ventana habilitada cuando la política exija plantilla.

### RF-014 — Multimedia

- Registrar metadatos antes de descargar.
- Descargar mediante proceso asíncrono.
- Validar tipo y tamaño.
- Guardar en almacenamiento de objetos.
- Generar URL firmada temporal.
- No exponer credenciales.
- Permitir reproducción de audio.
- Marcar archivo no disponible cuando haya expirado o falle la descarga.

### RF-015 — Tiempo real

Actualizar sin recargar:

- Nuevo mensaje.
- Cambio de estado.
- Asignación.
- Usuario escribiendo.
- Pedido actualizado.
- Nueva nota.
- Cambio en lectura.
- Error de envío.

### RF-016 — Auditoría

Registrar como mínimo:

- Inicio y cierre de sesión.
- Mensaje enviado.
- Asignación y transferencia.
- Cambio de estado.
- Creación y edición de cliente.
- Creación, modificación y cancelación de pedido.
- Cambio de precio.
- Exportación.
- Cambio de configuración.
- Acción administrativa.

### RF-017 — Búsqueda

Buscar por:

- Número.
- Nombre.
- Texto de mensajes.
- Número de pedido.
- Dirección.
- Fecha.
- Responsable.
- Etiqueta.
- Estado.

### RF-018 — Notificaciones internas

- Nueva conversación.
- Transferencia recibida.
- Reclamo.
- Mensaje nuevo en conversación asignada.
- Error de envío.
- Pedido pendiente próximo a su fecha.
- Incidencia de reparto.

### RF-019 — Reportes básicos

- Conversaciones nuevas por día.
- Conversaciones sin respuesta.
- Tiempo de primera respuesta.
- Tiempo promedio de resolución.
- Conversaciones por telefonista.
- Pedidos creados.
- Conversión conversación/pedido.
- Pedidos por sede.
- Pedidos envío vs retira.
- Mensajes fallidos.

### RF-020 — Exportación

- Clientes en CSV.
- Pedidos en CSV.
- Reportes filtrados.
- Auditoría solo para usuarios autorizados.
- Las exportaciones deberán quedar registradas.

---

## 11. Requerimientos no funcionales

### RNF-001 — Rendimiento

- La bandeja inicial deberá cargar en menos de 3 segundos bajo carga normal.
- Abrir una conversación deberá demorar menos de 2 segundos cuando los mensajes estén disponibles.
- Los mensajes históricos deberán paginarse.
- No se cargará todo el historial en una sola consulta.

### RNF-002 — Disponibilidad

- El sistema deberá tolerar reinicios de la aplicación.
- Las colas deberán persistir.
- El webhook deberá poder recibir eventos aunque la interfaz esté caída.
- Los servicios críticos deberán tener monitoreo.

### RNF-003 — Idempotencia

- Cada webhook deberá identificarse por ID externo y tipo.
- Procesar dos veces el mismo evento no deberá duplicar mensajes, contactos ni estados.
- Los envíos deberán usar claves de idempotencia internas.

### RNF-004 — Seguridad

- HTTPS obligatorio.
- Secretos en variables de entorno o gestor de secretos.
- Protección CSRF cuando corresponda.
- Validación estricta de entradas.
- Rate limiting.
- Control de acceso en backend.
- Logs sin tokens ni datos sensibles innecesarios.
- Rotación de credenciales.
- Copias de seguridad cifradas.
- Política de mínimo privilegio.

### RNF-005 — Privacidad

- Acceso a conversaciones según rol.
- Registro de accesos administrativos.
- Retención configurable.
- Posibilidad de anonimizar o eliminar datos cuando corresponda legalmente.
- No usar conversaciones para entrenamiento propio sin autorización explícita.
- No enviar datos sensibles a modelos de IA sin una política definida.

### RNF-006 — Observabilidad

- Logs estructurados.
- ID de correlación por webhook, conversación y envío.
- Métricas de colas.
- Alertas por fallos consecutivos.
- Dashboard de salud.
- Registro de versión desplegada.

### RNF-007 — Recuperación

Objetivos iniciales:

- RPO: máximo 24 horas para base de datos en MVP; objetivo posterior de 1 hora.
- RTO: máximo 4 horas en MVP; objetivo posterior de 1 hora.
- Prueba periódica de restauración.
- Backup previo a cambios de esquema críticos.

### RNF-008 — Compatibilidad

- Diseño responsive para escritorio y tablet.
- Navegadores Chromium actuales.
- Prioridad en Windows.
- No se requiere soporte completo de teléfonos en el MVP.

### RNF-009 — Mantenibilidad

- TypeScript estricto.
- Separación por dominios.
- Migraciones versionadas.
- Pruebas para reglas críticas.
- Documentación de decisiones.
- Sin lógica comercial crítica únicamente en frontend.
- Linter y formateador obligatorios.

---

## 12. Arquitectura propuesta

### 12.1 Stack

- **Frontend y backend web:** Next.js con TypeScript.
- **Base de datos:** PostgreSQL.
- **ORM:** Prisma.
- **Colas y bloqueos:** Redis + BullMQ o equivalente.
- **Tiempo real:** WebSocket o Server-Sent Events.
- **Almacenamiento multimedia:** S3 compatible, por ejemplo Cloudflare R2.
- **Automatizaciones externas:** n8n.
- **Autenticación:** Auth.js o módulo propio seguro.
- **Validación:** Zod.
- **Pruebas unitarias/integración:** Vitest o Jest.
- **Pruebas end-to-end:** Playwright.
- **Contenedores:** Docker para desarrollo reproducible.
- **Repositorio:** GitHub.
- **CI:** GitHub Actions.
- **Hosting inicial:** Railway, VPS administrado o plataforma equivalente.

No se fijarán versiones mayores en este documento. Antes de iniciar cada fase se seleccionarán versiones estables y compatibles.

### 12.2 Componentes

1. Aplicación web.
2. API interna.
3. Receptor de webhooks.
4. Worker de procesamiento.
5. Worker de multimedia.
6. Worker de mensajes salientes.
7. Base PostgreSQL.
8. Redis.
9. Almacenamiento de objetos.
10. Servicio de tiempo real.
11. Integración con Meta.
12. Integración con n8n.
13. Servicio de auditoría.
14. Monitoreo y alertas.

### 12.3 Decisión de diseño

Se comenzará como **monolito modular**:

- Una base de código.
- Dominios separados.
- Workers separados cuando sea necesario.
- Despliegue simple.
- Posibilidad de extraer servicios más adelante.

No se utilizarán microservicios en el MVP.

---

## 13. Modelo de datos inicial

### organization

- id
- name
- timezone
- settings
- created_at
- updated_at

### branch

- id
- organization_id
- name
- address
- active

### user

- id
- organization_id
- name
- email
- password_hash
- active
- last_login_at

### role

- id
- name

### permission

- id
- key
- description

### user_role / role_permission

Relaciones de permisos.

### whatsapp_account

- id
- organization_id
- waba_id
- phone_number_id
- display_phone_number
- status
- token_reference
- coexistence_enabled
- active

### customer

- id
- organization_id
- whatsapp_number
- whatsapp_name
- display_name
- email
- document
- preferred_branch_id
- preferred_fulfillment
- notes
- blocked
- created_at
- updated_at

### customer_address

- id
- customer_id
- label
- street
- number
- floor
- apartment
- city
- province
- postal_code
- reference
- latitude
- longitude
- is_default

### conversation

- id
- organization_id
- whatsapp_account_id
- customer_id
- branch_id
- status
- priority
- assigned_user_id
- lock_user_id
- lock_expires_at
- last_message_at
- last_customer_message_at
- service_window_expires_at
- unread_count
- closed_at

### message

- id
- conversation_id
- external_message_id
- direction
- type
- text
- reply_to_message_id
- sent_by_user_id
- external_timestamp
- status
- error_code
- error_message
- raw_payload_reference
- created_at

### media

- id
- message_id
- external_media_id
- mime_type
- filename
- size
- storage_key
- sha256
- download_status

### conversation_assignment

- id
- conversation_id
- from_user_id
- to_user_id
- reason
- created_at

### tag / conversation_tag

Etiquetas.

### internal_note

- id
- conversation_id
- author_user_id
- body
- created_at

### product

- id
- organization_id
- category_id
- name
- active
- unit_type
- production_notes

### product_variant

- id
- product_id
- name
- sku
- base_price
- active

### price_rule

- id
- product_variant_id
- min_quantity
- max_quantity
- unit_price
- valid_from
- valid_to
- branch_id
- active

### promotion

- id
- name
- type
- value
- valid_from
- valid_to
- conditions
- active

### order

- id
- order_number
- organization_id
- branch_id
- customer_id
- conversation_id
- status
- fulfillment_type
- scheduled_date
- time_slot
- customer_address_snapshot
- subtotal
- discount_total
- shipping_total
- total
- payment_status
- payment_method
- notes
- created_by_user_id
- confirmed_at
- created_at
- updated_at

### order_item

- id
- order_id
- product_variant_id
- product_name_snapshot
- variant_name_snapshot
- quantity
- unit_price
- discount
- total
- production_notes

### webhook_event

- id
- provider
- external_event_key
- event_type
- payload
- status
- attempts
- processed_at
- error
- created_at

### outbound_message_job

- id
- message_id
- status
- attempts
- next_attempt_at
- last_error

### audit_log

- id
- organization_id
- actor_user_id
- action
- entity_type
- entity_id
- before
- after
- ip
- user_agent
- created_at

---

## 14. API interna propuesta

### Autenticación

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/session`

### Webhooks

- `GET /api/webhooks/whatsapp`
- `POST /api/webhooks/whatsapp`

### Conversaciones

- `GET /api/conversations`
- `GET /api/conversations/:id`
- `POST /api/conversations/:id/assign`
- `POST /api/conversations/:id/take`
- `POST /api/conversations/:id/release`
- `POST /api/conversations/:id/transfer`
- `POST /api/conversations/:id/close`
- `POST /api/conversations/:id/reopen`
- `POST /api/conversations/:id/notes`
- `POST /api/conversations/:id/tags`

### Mensajes

- `GET /api/conversations/:id/messages`
- `POST /api/conversations/:id/messages`
- `POST /api/conversations/:id/templates`
- `GET /api/messages/:id/media`

### Clientes

- `GET /api/customers`
- `GET /api/customers/:id`
- `POST /api/customers`
- `PATCH /api/customers/:id`
- `POST /api/customers/:id/addresses`
- `PATCH /api/customer-addresses/:id`

### Pedidos

- `GET /api/orders`
- `GET /api/orders/:id`
- `POST /api/orders`
- `PATCH /api/orders/:id`
- `POST /api/orders/:id/confirm`
- `POST /api/orders/:id/cancel`
- `POST /api/orders/:id/status`

### Catálogo

- `GET /api/products`
- `POST /api/products`
- `PATCH /api/products/:id`
- `POST /api/products/:id/variants`
- `POST /api/price-rules`
- `POST /api/promotions`

### Administración

- `GET /api/users`
- `POST /api/users`
- `PATCH /api/users/:id`
- `GET /api/roles`
- `GET /api/audit`
- `GET /api/health`

---

## 15. Integración con WhatsApp

### 15.1 Estrategia

1. Crear aplicación y activos de prueba.
2. Implementar webhook con número de prueba.
3. Implementar envío y estados.
4. Probar multimedia y plantillas.
5. Ejecutar pruebas de volumen.
6. Evaluar elegibilidad de coexistencia.
7. Preparar contingencia.
8. Incorporar número real fuera del horario pico.
9. Monitorear.
10. Mantener reversión documentada.

### 15.2 Reglas técnicas

- Nunca procesar el webhook de manera pesada antes de responder.
- Persistir primero, procesar después.
- Mantener payload bruto para diagnóstico con retención controlada.
- No confiar en que los eventos llegarán una sola vez.
- No confiar en orden perfecto.
- Usar timestamp externo y secuencia interna.
- Reintentar fallos transitorios.
- No reintentar indefinidamente errores permanentes.
- Mostrar errores funcionales al telefonista.
- No registrar tokens en logs.

### 15.3 Ventana de atención

El sistema calculará y mostrará la vigencia de la ventana de atención. Cuando no sea posible enviar texto libre, deberá exigir una plantilla válida o bloquear el envío con una explicación clara.

### 15.4 Coexistencia

La coexistencia será una decisión de implementación, no una suposición. Antes de incorporar el número comercial se validarán:

- Elegibilidad de la cuenta.
- Requisitos del alta.
- Restricciones de dispositivos vinculados.
- Sincronización disponible.
- Comportamiento de mensajes enviados desde la aplicación.
- Conservación de Estados.
- Procedimiento ante cambio de teléfono.
- Procedimiento de desconexión.
- Recuperación ante offboarding.

---

## 16. Automatización e IA

### 16.1 Fase inicial

La IA solo podrá:

- Resumir conversaciones.
- Transcribir audios.
- Detectar intención.
- Extraer posibles datos de pedido.
- Sugerir respuestas.
- Señalar datos faltantes.
- Clasificar reclamos.
- Proponer etiquetas.

El empleado deberá confirmar antes de enviar o guardar información crítica.

### 16.2 Fase posterior

Se podrá automatizar:

- Saludo inicial.
- Horarios.
- Direcciones.
- Consulta de precios.
- Catálogo.
- Estado del pedido.
- Solicitud guiada de datos.
- Recordatorios mediante plantillas.
- Confirmación de pedido.
- Aviso de salida a reparto.

### 16.3 Restricciones

La IA no deberá:

- Inventar precios.
- Confirmar stock sin consultar la fuente oficial.
- Aplicar descuentos no autorizados.
- Confirmar pedidos incompletos.
- Resolver reclamos sensibles sin intervención.
- Enviar información de otro cliente.
- Modificar pagos.
- Cancelar pedidos sin regla explícita.

---

## 17. Diseño de interfaz

### 17.1 Vista principal

Diseño de tres columnas:

1. **Izquierda:** filtros y lista de conversaciones.
2. **Centro:** conversación y compositor.
3. **Derecha:** cliente, pedido, etiquetas y acciones.

### 17.2 Prioridades visuales

- Lo no respondido debe ser evidente.
- La ventana de atención debe verse claramente.
- El responsable debe estar visible.
- El estado del pedido no debe confundirse con el estado de conversación.
- Los mensajes internos no deben parecer enviados al cliente.
- Los errores deben ser visibles y accionables.
- Los importes deben mostrarse con formato argentino.
- Las fechas deberán utilizar zona horaria de Buenos Aires.

### 17.3 Accesibilidad

- Navegación por teclado.
- Contraste suficiente.
- Estados no representados solo por color.
- Botones con texto o etiquetas accesibles.
- Confirmación para acciones destructivas.

---

## 18. Seguridad y operación

### 18.1 Credenciales

Se almacenarán fuera del repositorio:

- Token de Meta.
- App secret.
- Verify token.
- Credenciales de PostgreSQL.
- Credenciales de Redis.
- Credenciales de almacenamiento.
- Secretos de sesión.
- Tokens de n8n.

### 18.2 Ambientes

- `local`
- `test`
- `staging`
- `production`

Cada ambiente tendrá:

- Base separada.
- Credenciales separadas.
- Número o activo separado cuando sea posible.
- Almacenamiento separado.
- Variables documentadas.

### 18.3 Backups

- Backup automático diario inicial.
- Retención mínima de 14 días.
- Backup previo a migraciones críticas.
- Prueba de restauración documentada.
- Exportación independiente de configuración.

### 18.4 Contingencia

Se deberá documentar:

- Meta no responde.
- Webhook caído.
- Base de datos caída.
- Redis caído.
- Almacenamiento caído.
- Token vencido.
- Número desconectado.
- Mensajes salientes fallidos.
- CRM inaccesible.
- Caída de internet en la empresa.
- Necesidad de volver temporalmente a la aplicación móvil.

---

## 19. Estrategia de pruebas

### 19.1 Unitarias

Prioridad:

- Cálculo de precios.
- Ventana de atención.
- Máquina de estados.
- Permisos.
- Idempotencia.
- Formato y validación de teléfonos.
- Promociones.
- Totales de pedido.
- Asignación y bloqueo.

### 19.2 Integración

- Webhook a base de datos.
- Base de datos a bandeja.
- Envío a Meta simulado.
- Estados de mensajes.
- Colas y reintentos.
- Multimedia.
- Creación de pedido.
- Auditoría.

### 19.3 End-to-end

Escenarios:

1. Cliente nuevo escribe y aparece en bandeja.
2. Telefonista toma chat y responde.
3. Segundo telefonista no puede responder sin advertencia.
4. Se crea y confirma pedido de retira.
5. Se crea y confirma pedido de envío.
6. Se envía plantilla fuera de ventana.
7. Falla un envío y se muestra el error.
8. Supervisor transfiere conversación.
9. Se recibe audio y se reproduce.
10. Se reinicia el worker y no duplica mensajes.

### 19.4 Pruebas operativas

- Dos telefonistas atendiendo en simultáneo.
- Carga de mensajes durante una hora pico.
- Desconexión de una PC.
- Reinicio del servidor.
- Duplicación deliberada de webhooks.
- Eventos fuera de orden.
- Fallo de almacenamiento.
- Mensaje con archivo grande.
- Pedido con cambio de precio.
- Reclamo vinculado a pedido.

---

## 20. Despliegue y CI/CD

### Pipeline mínimo

1. Instalar dependencias.
2. Verificar formato.
3. Ejecutar lint.
4. Verificar TypeScript.
5. Ejecutar pruebas unitarias.
6. Ejecutar pruebas de integración.
7. Construir aplicación.
8. Aplicar análisis de seguridad básico.
9. Desplegar a staging.
10. Ejecutar smoke tests.
11. Aprobar manualmente producción.
12. Ejecutar migración.
13. Desplegar.
14. Verificar salud.
15. Permitir rollback.

No se desplegará automáticamente a producción desde cualquier rama.

---

## 21. Fases de desarrollo

### Fase 0 — Preparación

Entregables:

- Repositorio.
- PRD aprobado.
- AGENTS.md.
- Arquitectura inicial.
- Entornos.
- Docker local.
- Convenciones.
- CI básico.
- Registro de decisiones.

Criterio de salida:

- Un desarrollador puede clonar, configurar y ejecutar el proyecto siguiendo el README.

### Fase 1 — Fundaciones

Entregables:

- Next.js y TypeScript.
- PostgreSQL y Prisma.
- Redis.
- Autenticación.
- Roles.
- Sedes.
- Layout inicial.
- Auditoría base.
- Health checks.

Criterio de salida:

- Usuarios autorizados pueden ingresar y acceder solo a las secciones permitidas.

### Fase 2 — Núcleo de WhatsApp

Entregables:

- Verificación de webhook.
- Persistencia de eventos.
- Idempotencia.
- Contactos.
- Conversaciones.
- Mensajes.
- Envío.
- Estados.
- Cola de reintentos.
- Número de prueba.

Criterio de salida:

- Un mensaje enviado al número de prueba aparece en el CRM y puede responderse desde el CRM.

### Fase 3 — Bandeja multiusuario

Entregables:

- Lista de conversaciones.
- Vista de chat.
- Tiempo real.
- Asignación.
- Bloqueo.
- Transferencia.
- Notas.
- Etiquetas.
- Búsqueda.
- Respuestas rápidas.

Criterio de salida:

- Dos telefonistas pueden trabajar simultáneamente sin duplicar respuestas.

### Fase 4 — Clientes y pedidos

Entregables:

- Ficha de cliente.
- Direcciones.
- Catálogo.
- Variantes.
- Precios.
- Pedidos.
- Envío/retira.
- Confirmación.
- Estados.
- Historial.

Criterio de salida:

- Un telefonista puede transformar una conversación en un pedido completo y enviarlo a producción.

### Fase 5 — Operación y calidad

Entregables:

- Reportes básicos.
- Exportaciones.
- Monitoreo.
- Alertas.
- Backups.
- Restauración.
- Pruebas E2E.
- Seguridad.
- Manual operativo.

Criterio de salida:

- Staging puede utilizarse durante una prueba piloto sin errores críticos.

### Fase 6 — Número real y piloto

Entregables:

- Validación de coexistencia o estrategia alternativa.
- Plan de migración.
- Plan de reversión.
- Capacitación.
- Piloto controlado.
- Correcciones.

Criterio de salida:

- Operación aprobada por administración y telefonistas.

### Fase 7 — Automatización e IA

Entregables:

- Transcripción.
- Resumen.
- Extracción de datos.
- Respuesta sugerida.
- Automatizaciones n8n.
- Métricas de precisión.

Criterio de salida:

- La IA mejora tiempos sin aumentar errores ni enviar información no autorizada.

---

## 22. Backlog inicial para Codex

### Épica E0 — Repositorio

- SC-001 Crear estructura inicial.
- SC-002 Configurar TypeScript estricto.
- SC-003 Configurar ESLint y formatter.
- SC-004 Crear Docker Compose.
- SC-005 Crear README.
- SC-006 Crear validación de variables.
- SC-007 Configurar GitHub Actions.

### Épica E1 — Base de datos

- SC-010 Configurar Prisma.
- SC-011 Crear modelos organization, branch, user, role y permission.
- SC-012 Crear seed inicial.
- SC-013 Crear audit_log.
- SC-014 Crear estrategia de migraciones.
- SC-015 Agregar índices iniciales.

### Épica E2 — Autenticación

- SC-020 Implementar login.
- SC-021 Implementar sesión.
- SC-022 Implementar permisos.
- SC-023 Crear administración de usuarios.
- SC-024 Registrar auditoría de acceso.
- SC-025 Crear pruebas de autorización.

### Épica E3 — Webhooks

- SC-030 Crear endpoint de verificación.
- SC-031 Validar firma.
- SC-032 Persistir evento bruto.
- SC-033 Crear worker.
- SC-034 Implementar idempotencia.
- SC-035 Crear dead-letter queue.
- SC-036 Agregar métricas.

### Épica E4 — Mensajería

- SC-040 Modelar cliente, conversación y mensaje.
- SC-041 Procesar texto entrante.
- SC-042 Procesar estados.
- SC-043 Enviar texto.
- SC-044 Reintentar envíos.
- SC-045 Procesar multimedia.
- SC-046 Implementar paginación.
- SC-047 Implementar ventana de atención.

### Épica E5 — Bandeja

- SC-050 Crear lista.
- SC-051 Crear filtros.
- SC-052 Crear vista de conversación.
- SC-053 Crear compositor.
- SC-054 Implementar tiempo real.
- SC-055 Implementar asignación.
- SC-056 Implementar bloqueo.
- SC-057 Implementar transferencia.
- SC-058 Implementar notas.
- SC-059 Implementar etiquetas.

### Épica E6 — Pedidos

- SC-060 Crear ficha de cliente.
- SC-061 Crear direcciones.
- SC-062 Crear catálogo.
- SC-063 Crear variantes.
- SC-064 Crear reglas de precio.
- SC-065 Crear pedido.
- SC-066 Crear detalle.
- SC-067 Calcular total.
- SC-068 Diferenciar envío/retira.
- SC-069 Confirmar pedido.
- SC-070 Crear historial.

### Épica E7 — Calidad

- SC-080 Configurar Playwright.
- SC-081 Crear escenarios E2E.
- SC-082 Configurar monitoreo.
- SC-083 Crear backup.
- SC-084 Documentar restauración.
- SC-085 Crear dashboard de salud.
- SC-086 Ejecutar revisión de seguridad.

---

## 23. Método de trabajo con Codex de escritorio

Codex deberá trabajar sobre un repositorio Git local. Cada tarea se ejecutará en un hilo separado y, cuando haya paralelismo, en un worktree independiente.

### 23.1 Regla de una tarea

Cada hilo deberá tener:

- Un objetivo.
- Un alcance delimitado.
- Criterios de aceptación.
- Archivos permitidos o esperados.
- Pruebas requeridas.
- Exclusiones.
- Condición de finalización.

No se solicitará “hacer todo el CRM” en un único hilo.

### 23.2 Secuencia por tarea

1. Leer `AGENTS.md`.
2. Leer el ticket.
3. Inspeccionar el código relacionado.
4. Proponer un plan breve.
5. Implementar.
6. Ejecutar pruebas.
7. Revisar el diff.
8. Corregir.
9. Actualizar documentación.
10. Entregar resumen y evidencia.

### 23.3 Reglas para aceptar cambios

No aceptar una tarea si:

- No compila.
- Fallan pruebas existentes.
- Falta validación backend.
- Agrega secretos.
- Duplica lógica.
- Modifica archivos no relacionados sin explicación.
- No incluye migración cuando cambia el esquema.
- No contempla errores.
- No agrega pruebas para una regla crítica.
- Rompe permisos.
- No documenta una decisión relevante.

### 23.4 Uso de agentes paralelos

Adecuado para:

- Frontend y pruebas.
- Modelo de datos y UI.
- Documentación y observabilidad.
- Investigación de una integración.
- Revisión de seguridad.

No adecuado para:

- Dos agentes modificando la misma migración.
- Dos agentes modificando el mismo componente central.
- Cambios de arquitectura sin decisión previa.
- Integración simultánea de ramas no revisadas.

---

## 24. Definition of Done

Una tarea está terminada cuando:

- Cumple todos los criterios de aceptación.
- Compila.
- Pasa lint y typecheck.
- Pasa pruebas relacionadas.
- Incluye pruebas nuevas cuando corresponde.
- No contiene secretos.
- Maneja estados de error.
- Respeta roles y permisos.
- Registra auditoría cuando corresponde.
- Actualiza documentación.
- El diff fue revisado.
- Puede revertirse.
- Se entrega evidencia de comandos ejecutados.

---

## 25. Plantilla de ticket para Codex

```md
# [ID] Título

## Contexto

Explicar qué existe y por qué se necesita el cambio.

## Objetivo

Describir un único resultado verificable.

## Alcance

- Incluye:
- No incluye:

## Reglas

- Regla 1
- Regla 2

## Criterios de aceptación

- [ ] Criterio observable 1
- [ ] Criterio observable 2
- [ ] Criterio observable 3

## Archivos o módulos relacionados

- ruta/o/módulo

## Pruebas requeridas

- Unitarias:
- Integración:
- E2E:

## Restricciones

- No modificar...
- No agregar...
- Mantener compatibilidad...

## Entrega esperada

- Resumen.
- Archivos modificados.
- Pruebas ejecutadas.
- Riesgos o pendientes.
```

---

## 26. Primer prompt recomendado para Codex

```text
Trabajá sobre este repositorio como responsable de la tarea SC-001.

Primero:
1. Leé AGENTS.md y docs/PRD.md.
2. Inspeccioná el contenido actual del repositorio.
3. Presentá un plan breve y señalá cualquier conflicto entre el repositorio y el PRD.

Objetivo:
Crear la estructura inicial del proyecto Santa Catalina CRM como monolito modular con Next.js, TypeScript estricto, PostgreSQL, Prisma y Redis, preparado para desarrollo local con Docker.

Alcance:
- Inicializar la aplicación.
- Crear una estructura por dominios.
- Configurar TypeScript estricto.
- Configurar lint y formato.
- Crear Docker Compose para PostgreSQL y Redis.
- Crear validación centralizada de variables de entorno.
- Agregar una página de health local.
- Crear README con instrucciones reproducibles.
- Agregar .env.example sin secretos.

No incluir:
- Integración real con Meta.
- Autenticación.
- Bandeja.
- Pedidos.
- Despliegue productivo.

Criterios de aceptación:
- El proyecto inicia localmente siguiendo el README.
- PostgreSQL y Redis levantan con Docker Compose.
- Falla de forma clara si faltan variables obligatorias.
- Pasa lint, typecheck y build.
- No hay secretos en el repositorio.
- La estructura deja preparados los dominios auth, whatsapp, conversations, customers, orders, catalog y audit.
- Se informan todos los comandos ejecutados y sus resultados.

Antes de terminar:
- Revisá el diff completo.
- Ejecutá las validaciones.
- No hagas commit ni push sin indicación explícita.
```

---

## 27. Estructura inicial del repositorio

```text
santa-catalina-crm/
├─ AGENTS.md
├─ README.md
├─ .env.example
├─ docker-compose.yml
├─ docs/
│  ├─ PRD.md
│  ├─ ARCHITECTURE.md
│  ├─ RUNBOOK.md
│  ├─ SECURITY.md
│  ├─ TESTING.md
│  └─ adr/
├─ prisma/
│  ├─ schema.prisma
│  ├─ migrations/
│  └─ seed.ts
├─ src/
│  ├─ app/
│  ├─ components/
│  ├─ domains/
│  │  ├─ auth/
│  │  ├─ audit/
│  │  ├─ whatsapp/
│  │  ├─ conversations/
│  │  ├─ customers/
│  │  ├─ catalog/
│  │  ├─ orders/
│  │  └─ reporting/
│  ├─ infrastructure/
│  │  ├─ database/
│  │  ├─ queue/
│  │  ├─ storage/
│  │  ├─ realtime/
│  │  └─ observability/
│  ├─ lib/
│  └─ test/
└─ e2e/
```

---

## 28. Riesgos principales

### Riesgo R1 — Número comercial

**Impacto:** crítico.  
**Mitigación:** número de prueba, backup, coexistencia validada, ventana de migración y reversión.

### Riesgo R2 — Eventos duplicados o fuera de orden

**Impacto:** alto.  
**Mitigación:** idempotencia, eventos brutos, timestamps, estados monotónicos y reprocesamiento.

### Riesgo R3 — Dependencia de Meta

**Impacto:** alto.  
**Mitigación:** colas, reintentos, alertas, estado de servicio y canal de contingencia.

### Riesgo R4 — Automatización incorrecta

**Impacto:** alto.  
**Mitigación:** aprobación humana, límites, logs, métricas y rollout gradual.

### Riesgo R5 — Complejidad excesiva

**Impacto:** medio/alto.  
**Mitigación:** monolito modular, MVP estricto y una tarea por hilo.

### Riesgo R6 — Acceso indebido

**Impacto:** crítico.  
**Mitigación:** RBAC, auditoría, mínimo privilegio, sesiones seguras y revisión de seguridad.

### Riesgo R7 — Datos inconsistentes

**Impacto:** alto.  
**Mitigación:** transacciones, snapshots, constraints, validación backend y pruebas.

### Riesgo R8 — Adopción operativa

**Impacto:** alto.  
**Mitigación:** piloto, capacitación, interfaz familiar y métricas.

---

## 29. Decisiones abiertas

Antes de la Fase 4 deberán resolverse:

1. Hosting productivo definitivo.
2. Proveedor de almacenamiento.
3. Esquema de autenticación.
4. Uso de coexistencia.
5. Sedes exactas habilitadas.
6. Catálogo maestro.
7. Reglas actuales de precio.
8. Franjas horarias.
9. Cálculo de envíos.
10. Métodos de pago.
11. Política de retención.
12. Herramienta de monitoreo.
13. Integración con el sistema de pedidos existente.
14. Permisos finales por rol.
15. Horarios de soporte y contingencia.

Las decisiones se documentarán en archivos ADR.

---

## 30. Criterio de aprobación del MVP

El MVP podrá pasar a piloto productivo solamente cuando:

- El número de prueba haya funcionado al menos durante cinco jornadas operativas.
- No existan defectos críticos abiertos.
- Se hayan probado duplicados y eventos fuera de orden.
- Se haya restaurado exitosamente un backup.
- Haya un plan de contingencia escrito.
- Los usuarios hayan sido capacitados.
- Los permisos hayan sido revisados.
- Los mensajes y pedidos sean auditables.
- El proceso de alta del número real esté validado.
- Administración apruebe expresamente la salida.

---

## 31. Próximo paso

Crear el repositorio, incorporar este documento como `docs/PRD.md`, agregar `AGENTS.md` y ejecutar en Codex la tarea **SC-001 — Estructura inicial del proyecto**.
