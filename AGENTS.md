# AGENTS.md — Santa Catalina CRM

## Propósito

Este repositorio contiene el CRM propio de Santa Catalina para atención multiusuario mediante WhatsApp Business Platform, gestión de clientes y pedidos.

## Fuente de verdad

Antes de modificar código, leer:

1. `docs/PRD.md`
2. `docs/ARCHITECTURE.md`, cuando exista.
3. ADR relacionados.
4. El ticket de la tarea.

En caso de conflicto:

1. Seguridad y preservación de datos.
2. PRD.
3. ADR más reciente.
4. Ticket.
5. Código existente.

No asumir una regla comercial. Marcarla como pendiente cuando no esté documentada.

## Forma de trabajo

- Una tarea por hilo.
- Cambios pequeños y revisables.
- Inspeccionar antes de editar.
- Explicar brevemente el plan.
- No hacer commit, push, merge ni despliegue sin autorización explícita.
- No modificar archivos fuera del alcance sin justificarlo.
- No borrar datos o migraciones existentes para “hacer pasar” una prueba.
- No introducir secretos.

## Calidad obligatoria

Antes de finalizar:

- Ejecutar formatter.
- Ejecutar lint.
- Ejecutar typecheck.
- Ejecutar pruebas relacionadas.
- Ejecutar build cuando el cambio afecte compilación.
- Revisar el diff.
- Informar comandos y resultados.

## Arquitectura

- Monolito modular.
- TypeScript estricto.
- Lógica de negocio por dominios.
- Validación en backend.
- PostgreSQL como fuente de verdad.
- Prisma para acceso de datos.
- Redis para colas, bloqueos o tiempo real cuando corresponda.
- No agregar microservicios sin ADR aprobado.
- No poner lógica comercial crítica únicamente en componentes de UI.

## Dominios

- auth
- audit
- whatsapp
- conversations
- customers
- catalog
- orders
- reporting

Cada dominio debe evitar dependencias circulares.

## Reglas críticas

- Los webhooks deben ser idempotentes.
- Los eventos brutos deben persistirse antes del procesamiento asíncrono.
- No duplicar mensajes ni pedidos.
- Los precios de pedidos confirmados son snapshots y no cambian con el catálogo.
- Toda acción crítica debe ser auditable.
- Los permisos se validan en backend.
- Los mensajes salientes deben guardar autor.
- No registrar tokens ni credenciales.
- Manejar errores transitorios y permanentes de forma diferente.
- No confirmar pedidos incompletos.
- Diferenciar siempre `ENVIO` y `RETIRA`.

## Base de datos

- Todo cambio de esquema requiere migración.
- No editar migraciones ya aplicadas.
- Agregar índices para consultas críticas.
- Usar transacciones para operaciones consistentes.
- Evitar dinero en punto flotante.
- Agregar constraints cuando expresen una regla estable.
- Documentar migraciones destructivas.

## API

- Validar input.
- Autenticar.
- Autorizar.
- Usar respuestas de error consistentes.
- No filtrar información interna.
- Agregar correlación cuando corresponda.
- Paginar colecciones.
- Evitar endpoints que carguen historiales completos.

## Frontend

- Priorizar escritorio y tablet.
- Manejar loading, vacío, error y éxito.
- No representar estados solo por color.
- Confirmar acciones destructivas.
- Mantener accesibilidad básica y navegación por teclado.
- No ocultar fallos de envío.

## Pruebas

Agregar pruebas para:

- Reglas de precios.
- Estados.
- Permisos.
- Idempotencia.
- Ventana de atención.
- Asignación y bloqueo.
- Pedidos.
- Migraciones o transformaciones de datos críticas.

Un test no debe depender de servicios externos reales salvo tarea específica.

## Seguridad

- Variables de entorno validadas.
- `.env.example` sin valores reales.
- Logs sanitizados.
- HTTPS en producción.
- Rate limiting en endpoints expuestos.
- Verificación de firma de webhooks.
- Mínimo privilegio.
- No enviar datos de clientes a servicios externos sin decisión documentada.

## Entrega de cada tarea

La respuesta final debe incluir:

1. Resumen.
2. Archivos modificados.
3. Decisiones tomadas.
4. Pruebas y comandos ejecutados.
5. Riesgos o pendientes.
6. Instrucciones manuales, si existen.
