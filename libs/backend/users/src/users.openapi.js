/**
 * OpenAPI (Swagger) documentation for the Users module.
 * Used by swagger-jsdoc to generate the API spec.
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: Gestión de usuarios (requiere autenticación)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID del usuario
 *         username:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [ADMIN, STAFF]
 *         isActive:
 *           type: boolean
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UserWithAvatar:
 *       allOf:
 *         - $ref: '#/components/schemas/User'
 *         - type: object
 *           properties:
 *             avatar:
 *               type: string
 *               nullable: true
 *     Pagination:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *         limit:
 *           type: integer
 *         totalPages:
 *           type: integer
 *         page:
 *           type: integer
 *         hasPrevPage:
 *           type: boolean
 *         hasNextPage:
 *           type: boolean
 *         prevPage:
 *           type: integer
 *           nullable: true
 *         nextPage:
 *           type: integer
 *           nullable: true
 *     CreateUserBody:
 *       type: object
 *       required: [username, email, password]
 *       properties:
 *         username:
 *           type: string
 *           pattern: '^[a-zA-Z0-9]+$'
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 8
 *         avatar:
 *           type: string
 *           nullable: true
 *         role:
 *           type: string
 *           enum: [ADMIN, STAFF]
 *           default: STAFF
 *         isActive:
 *           type: boolean
 *           default: true
 *     UpdateUserBody:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           pattern: '^[a-zA-Z0-9]+$'
 *         email:
 *           type: string
 *           format: email
 *         role:
 *           type: string
 *           enum: [ADMIN, STAFF]
 *         isActive:
 *           type: boolean
 *     PatchMeBody:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           pattern: '^[a-zA-Z0-9]+$'
 *         email:
 *           type: string
 *           format: email
 *         avatar:
 *           type: string
 *           nullable: true
 *     ChangePasswordMeBody:
 *       type: object
 *       required: [currentPassword, newPassword]
 *       properties:
 *         currentPassword:
 *           type: string
 *         newPassword:
 *           type: string
 *           minLength: 8
 *     ChangePasswordAdminBody:
 *       type: object
 *       required: [newPassword]
 *       properties:
 *         newPassword:
 *           type: string
 *           minLength: 8
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *         code:
 *           type: string
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Listar usuarios
 *     description: Solo ADMIN. STAFF recibe 403.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: activeOnly
 *         schema: { type: boolean }
 *       - in: query
 *         name: role
 *         schema: { type: string, enum: [ADMIN, STAFF] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Búsqueda en username y email
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [username, email, role, createdAt, lastLogin, isActive], default: username }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: asc }
 *     responses:
 *       200:
 *         description: Lista paginada de usuarios (sin avatar)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/User' } }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos (STAFF) }
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Detalle de usuario
 *     description: ADMIN puede ver cualquiera. STAFF solo el propio.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Usuario (sin avatar)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Usuario no encontrado }
 */

/**
 * @swagger
 * /users:
 *   post:
 *     tags: [Users]
 *     summary: Crear usuario
 *     description: Solo ADMIN.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateUserBody' }
 *     responses:
 *       201:
 *         description: Usuario creado (sin avatar)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       400: { description: Error de validación }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       409: { description: Username o email ya existe }
 */

/**
 * @swagger
 * /users/me:
 *   patch:
 *     tags: [Users]
 *     summary: Actualizar perfil propio
 *     description: Cualquier usuario autenticado. Solo username, email, avatar.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/PatchMeBody' }
 *     responses:
 *       200:
 *         description: Usuario actualizado (con avatar)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/UserWithAvatar' }
 *       400: { description: Error de validación }
 *       401: { description: No autenticado }
 */

/**
 * @swagger
 * /users/me/change-password:
 *   post:
 *     tags: [Users]
 *     summary: Cambiar contraseña propia
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ChangePasswordMeBody' }
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *         content:
 *           application/json:
 *             schema: { type: object, properties: { message: { type: string } } }
 *       400: { description: Contraseña actual incorrecta o validación }
 *       401: { description: No autenticado }
 */

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Actualizar usuario (completo)
 *     description: Solo ADMIN. No acepta avatar ni password.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateUserBody' }
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       400: { description: Error de validación }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Usuario no encontrado }
 *       409: { description: Username o email ya existe }
 */

/**
 * @swagger
 * /users/{id}:
 *   patch:
 *     tags: [Users]
 *     summary: Actualizar usuario (parcial)
 *     description: Solo ADMIN.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateUserBody' }
 *     responses:
 *       200:
 *         description: Usuario actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       400: { description: Error de validación }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Usuario no encontrado }
 */

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Eliminar usuario
 *     description: Solo ADMIN. No puede eliminarse a sí mismo.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Usuario eliminado
 *         content:
 *           application/json:
 *             schema: { type: object, properties: { message: { type: string } } }
 *       400: { description: No puede eliminarse a sí mismo }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Usuario no encontrado }
 */

/**
 * @swagger
 * /users/{id}/activate:
 *   post:
 *     tags: [Users]
 *     summary: Activar usuario
 *     description: Solo ADMIN.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Usuario activado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Usuario no encontrado }
 */

/**
 * @swagger
 * /users/{id}/deactivate:
 *   post:
 *     tags: [Users]
 *     summary: Desactivar usuario
 *     description: Solo ADMIN. No puede desactivarse a sí mismo.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Usuario desactivado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       400: { description: No puede desactivarse a sí mismo }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Usuario no encontrado }
 */

/**
 * @swagger
 * /users/{id}/change-password:
 *   post:
 *     tags: [Users]
 *     summary: Cambiar contraseña de otro usuario (admin)
 *     description: Solo ADMIN. No usar para la propia contraseña.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ChangePasswordAdminBody' }
 *     responses:
 *       200:
 *         description: Contraseña actualizada
 *         content:
 *           application/json:
 *             schema: { type: object, properties: { message: { type: string } } }
 *       400: { description: Validación o uso para sí mismo }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Usuario no encontrado }
 */

/* eslint-disable-next-line no-unused-expressions */
0;
