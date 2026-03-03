| Método | Endpoint            | Descripción           | Auth |
| ------ | ------------------- | --------------------- | ---- |
| POST   | /api/auth/registrar | Registrar usuario     | No   |
| POST   | /api/auth/login     | Iniciar sesión        | No   |
| GET    | /api/auth/perfil    | Obtener perfil        | Sí   |
| GET    | /api/miembros       | Listar miembros       | Sí   |
| POST   | /api/miembros       | Crear miembro         | Sí   |
| GET    | /api/miembros/:id   | Ver miembro           | Sí   |
| PATCH  | /api/miembros/:id   | Actualizar miembro    | Sí   |
| DELETE | /api/miembros/:id   | Eliminar miembro      | Sí   |
| GET    | /api/grupos         | Listar grupos         | Sí   |
| POST   | /api/grupos         | Crear grupo           | Sí   |
| GET    | /api/asistencia     | Ver asistencias       | Sí   |
| POST   | /api/asistencia     | Crear registro        | Sí   |
| GET    | /api/finanzas       | Ver finanzas          | Sí   |
| POST   | /api/finanzas       | Registrar transacción | Sí   |
| GET    | /api/eventos        | Listar eventos        | Sí   |
| POST   | /api/eventos        | Crear evento          | Sí   |
