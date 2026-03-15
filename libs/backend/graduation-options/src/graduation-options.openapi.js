/**
 * OpenAPI (Swagger) documentation for the Graduation Options module.
 * Used by swagger-jsdoc to generate the API spec.
 */

/**
 * @swagger
 * tags:
 *   name: Opciones de Titulación
 *   description: Gestión de opciones de titulación (requiere autenticación)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GraduationOption:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID de la opción de titulación
 *         name:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
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
 *     CreateGraduationOptionBody:
 *       type: object
 *       required: [name]
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *         description:
 *           type: string
 *           nullable: true
 *         isActive:
 *           type: boolean
 *           default: true
 *     UpdateGraduationOptionBody:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *         description:
 *           type: string
 *           nullable: true
 *         isActive:
 *           type: boolean
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
 * /graduation-options:
 *   get:
 *     tags: [Opciones de Titulación]
 *     summary: Listar opciones de titulación
 *     description: Lista paginada de opciones de titulación. Los endpoints de escritura requieren rol ADMIN.
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
 *         name: search
 *         schema: { type: string }
 *         description: Búsqueda por nombre (alternativa q)
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Alias de search
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [name, createdAt, isActive], default: name }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: asc }
 *     responses:
 *       200:
 *         description: Lista paginada de opciones de titulación
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/GraduationOption' } }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *       401: { description: No autenticado }
 */

/**
 * @swagger
 * /graduation-options/{id}:
 *   get:
 *     tags: [Opciones de Titulación]
 *     summary: Detalle de opción de titulación
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Opción de titulación
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/GraduationOption' }
 *       401: { description: No autenticado }
 *       404: { description: Opción de titulación no encontrada }
 */

/**
 * @swagger
 * /graduation-options:
 *   post:
 *     tags: [Opciones de Titulación]
 *     summary: Crear opción de titulación
 *     description: Solo ADMIN.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateGraduationOptionBody' }
 *     responses:
 *       201:
 *         description: Opción de titulación creada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/GraduationOption' }
 *       400: { description: Error de validación }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       409: { description: Nombre de opción de titulación ya existe }
 */

/**
 * @swagger
 * /graduation-options/{id}:
 *   put:
 *     tags: [Opciones de Titulación]
 *     summary: Actualizar opción de titulación (completo)
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
 *           schema: { $ref: '#/components/schemas/UpdateGraduationOptionBody' }
 *     responses:
 *       200:
 *         description: Opción de titulación actualizada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/GraduationOption' }
 *       400: { description: Error de validación }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Opción de titulación no encontrada }
 *       409: { description: Nombre de opción de titulación ya existe }
 */

/**
 * @swagger
 * /graduation-options/{id}:
 *   patch:
 *     tags: [Opciones de Titulación]
 *     summary: Actualizar opción de titulación (parcial)
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
 *           schema: { $ref: '#/components/schemas/UpdateGraduationOptionBody' }
 *     responses:
 *       200:
 *         description: Opción de titulación actualizada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/GraduationOption' }
 *       400: { description: Error de validación }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Opción de titulación no encontrada }
 *       409: { description: Nombre de opción de titulación ya existe }
 */

/**
 * @swagger
 * /graduation-options/{id}:
 *   delete:
 *     tags: [Opciones de Titulación]
 *     summary: Eliminar opción de titulación
 *     description: Solo ADMIN.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Opción de titulación eliminada
 *         content:
 *           application/json:
 *             schema: { type: object, properties: { message: { type: string } } }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Opción de titulación no encontrada }
 */

/**
 * @swagger
 * /graduation-options/{id}/activate:
 *   post:
 *     tags: [Opciones de Titulación]
 *     summary: Activar opción de titulación
 *     description: Solo ADMIN.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Opción de titulación activada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/GraduationOption' }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Opción de titulación no encontrada }
 */

/**
 * @swagger
 * /graduation-options/{id}/deactivate:
 *   post:
 *     tags: [Opciones de Titulación]
 *     summary: Desactivar opción de titulación
 *     description: Solo ADMIN.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Opción de titulación desactivada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/GraduationOption' }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Opción de titulación no encontrada }
 */

/* eslint-disable-next-line @typescript-eslint/no-unused-expressions */
0;
