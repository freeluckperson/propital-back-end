# API De gestion De Notificaciones

## Descripción

Esta es una API de gestión de notificaciones diseñada para enviar, filtrar y administrar notificaciones para múltiples usuarios, incluidos usuarios con privilegios de administrador. Desarrollada con un enfoque en la autenticación segura y la gestión eficiente de usuarios, esta API permite a los administradores enviar notificaciones y a los usuarios consultar y marcar sus notificaciones como leídas. También se ofrece una lógica de eliminación de usuarios y asignación de permisos de administrador.

## Tecnologías Usadas

- **Node.js**: Entorno de ejecución de JavaScript en el servidor.
- **Express**: Framework para crear APIs en Node.js, facilitando la creación de endpoints.
- **MongoDB**: Base de datos NoSQL utilizada para almacenar usuarios y notificaciones.
- **Mongoose**: ODM (Object Data Modeling) para MongoDB y Node.js, permite definir esquemas y realizar operaciones en MongoDB.
- **bcrypt**: Biblioteca para el hash de contraseñas, aumentando la seguridad de los datos sensibles de los usuarios.
- **jsonwebtoken (JWT)**: Se utiliza para generar tokens de autenticación, proporcionando seguridad en las sesiones de los usuarios.
- **cors**: Middleware que habilita el soporte de CORS para permitir solicitudes entre dominios.
- **morgan**: Middleware para el registro de solicitudes HTTP, útil para desarrollo y depuración.
- **cookie-parser**: Analiza las cookies en las solicitudes HTTP, permitiendo manejar el token de autenticación.
- **Zod**: Biblioteca para la validación de datos, utilizada para validar el formato de las solicitudes de registro y login.

## Características de la API

### Autenticación y Seguridad

- **Registro de usuarios**: Endpoint para crear nuevos usuarios, almacenando contraseñas con hash para mayor seguridad.
- **Inicio de sesión**: Autenticación mediante JWT, con el token almacenado en cookies seguras y de solo lectura.
- **Autorización de usuarios**: Middleware que verifica la validez del token JWT antes de acceder a rutas protegidas.
- **Logout**: Permite a los usuarios cerrar sesión limpiando el token de las cookies.

### Gestión de Usuarios

- **Asignación de privilegios de administrador**: Endpoint protegido para que los administradores asignen permisos a otros usuarios.
- **Eliminación lógica de usuarios**: Permite desactivar usuarios sin eliminarlos físicamente de la base de datos.
- **Protección de rutas**: Solo los usuarios con token válido pueden acceder a rutas protegidas, y ciertas acciones están reservadas a administradores.

### Gestión de Notificaciones

- **Creación de notificaciones (admin)**: Permite a los administradores enviar notificaciones a múltiples destinatarios.
- **Filtrado de notificaciones por fecha**: Los usuarios pueden filtrar notificaciones según rangos como "hoy", "esta semana" y "último mes".
- **Consulta de notificaciones del usuario**: Los usuarios pueden ver todas sus notificaciones y la cantidad total.
- **Marcado de notificaciones como leídas**: Los usuarios pueden marcar notificaciones individuales o todas como leídas.
- **Eliminación de notificaciones**: Permite eliminar notificaciones específicas, solo accesible para el usuario destinatario o el administrador.

## Endpoints de la API

| Método | Ruta                         | Descripción                                                                       |
| ------ | ---------------------------- | --------------------------------------------------------------------------------- |
| POST   | `/register`                  | Registra un nuevo usuario en la plataforma.                                       |
| POST   | `/login`                     | Autentica al usuario y devuelve un token JWT.                                     |
| POST   | `/logout`                    | Cierra sesión y elimina el token JWT de las cookies.                              |
| GET    | `/protected`                 | Ruta protegida de ejemplo que verifica la autenticación del usuario.              |
| POST   | `/notifications`             | Crea una notificación para varios usuarios (requiere ser admin).                  |
| GET    | `/notifications/filter`      | Filtra notificaciones según el rango de fecha (hoy, esta semana, último mes).     |
| GET    | `/my-notifications`          | Muestra todas las notificaciones del usuario autenticado.                         |
| PUT    | `/notifications/read`        | Marca una o varias notificaciones específicas como leídas.                        |
| PUT    | `/my-notifications/read-all` | Marca todas las notificaciones del usuario autenticado como leídas.               |
| DELETE | `/notifications/:id`         | Elimina una notificación específica.                                              |
| PUT    | `/grant-admin/:id`           | Otorga privilegios de administrador a un usuario específico (requiere ser admin). |
| DELETE | `/users/:id`                 | Realiza la eliminación lógica de un usuario específico.                           |

## Configuración e Instalación

### Prerrequisitos

- **Node.js** y **npm** instalados en su máquina.
- Base de datos **MongoDB** configurada.
- Variables de entorno definidas en un archivo `.env`:
  - `PORT`: Puerto en el que se ejecutará la aplicación.
  - `MONGO_URL`: URL de conexión a MongoDB.
  - `JWT_SECRET`: Clave secreta para firmar los tokens JWT.
  - `NODE_ENV`: `production` o `development` para configurar la seguridad de las cookies.

### Instalación

1. Clona el repositorio en tu máquina local.
   ```bash
   git clone https://github.com/tu_usuario/tu_repositorio.git
   cd tu_repositorio
   npm install
   npm run dev
   ```
