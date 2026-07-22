# Santa Catalina CRM

Prototipo del CRM multiusuario de Santa Catalina, preparado para desarrollo local con Node.js, PostgreSQL y Redis.

## Requisitos

- Node.js 22.13 o superior
- npm
- Docker con Docker Compose

## Inicio local

1. Copiar `.env.example` como `.env`.
2. Instalar dependencias con `npm install`.
3. Levantar infraestructura con `docker compose up -d`.
4. Generar el cliente con `npm run db:generate`.
5. Iniciar la app con `npm run dev`.
6. Abrir `http://localhost:3000`; el health check está en `http://localhost:3000/api/health`.

`npm run dev` valida las variables antes de iniciar y muestra cuáles faltan. PostgreSQL y Redis usan credenciales exclusivamente locales definidas en `.env.example` y datos persistentes en volúmenes de Docker.

## Comandos

- `npm run env:check`: valida la configuración.
- `npm run db:migrate`: crea y aplica una migración de desarrollo cuando exista un modelo.
- `npm run lint`: ejecuta ESLint.
- `npm run typecheck`: valida TypeScript estricto.
- `npm test`: compila y ejecuta las pruebas.
- `npm run build`: genera el build de producción.

Para detener servicios: `docker compose down`. Este comando conserva los datos. No usar `docker compose down -v` salvo que se quiera borrar explícitamente la base local.

No conectar todavía el número comercial real de WhatsApp.
