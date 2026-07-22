# Arquitectura local

La aplicación se mantiene como monolito modular TypeScript. La UI y las rutas HTTP viven en `app/`; la lógica de negocio se incorporará en `src/domains/`; la infraestructura compartida vive en `src/infrastructure/`.

PostgreSQL es la fuente de verdad y se accede mediante Prisma. Redis queda reservado para colas, bloqueos y tiempo real. En desarrollo ambos servicios se ejecutan con Docker Compose y persisten datos en volúmenes nombrados.

El adaptador Cloudflare/Vinext existente se conserva para la vista previa, pero D1 no se utilizará como base de datos del CRM. Esta decisión alinea el entorno local con el PRD sin modificar todavía el despliegue productivo, que sigue pendiente de ADR.
