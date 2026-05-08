/**
 * OpenAPI (Swagger) documentation for the Generations module.
 * Used by swagger-jsdoc to generate the API spec.
 */

/**
 * @swagger
 * tags:
 *   name: Generaciones
 *   description: Gestión de generaciones (requiere autenticación)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Generation:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID de la generación
 *         name:
 *           type: string
 *           nullable: true
 *         startYear:
 *           type: string
 *           format: date-time
 *           description: Año de inicio (ISO)
 *         endYear:
 *           type: string
 *           format: date-time
 *           description: Año de fin (ISO)
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
 *     CreateGenerationBody:
 *       type: object
 *       required: [startYear, endYear]
 *       properties:
 *         name:
 *           type: string
 *           nullable: true
 *         startYear:
 *           type: string
 *           format: date-time
 *           description: Año de inicio (ISO o YYYY-MM-DD)
 *         endYear:
 *           type: string
 *           format: date-time
 *           description: Año de fin (debe ser mayor que startYear)
 *         description:
 *           type: string
 *           nullable: true
 *         isActive:
 *           type: boolean
 *           default: true
 *     UpdateGenerationBody:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           nullable: true
 *         startYear:
 *           type: string
 *           format: date-time
 *         endYear:
 *           type: string
 *           format: date-time
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
 * /generations:
 *   get:
 *     tags: [Generaciones]
 *     summary: Listar generaciones
 *     description: Lista paginada de generaciones. Los endpoints de escritura requieren rol ADMIN.
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
 *         schema: { type: string, enum: [name, startYear, endYear, createdAt, isActive], default: startYear }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200:
 *         description: Lista paginada de generaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/Generation' } }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *       401: { description: No autenticado }
 */

/**
 * @swagger
 * /generations/{id}:
 *   get:
 *     tags: [Generaciones]
 *     summary: Detalle de generación
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Generación
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Generation' }
 *       401: { description: No autenticado }
 *       404: { description: Generación no encontrada }
 */

/**
 * @swagger
 * /generations:
 *   post:
 *     tags: [Generaciones]
 *     summary: Crear generación
 *     description: Solo ADMIN. endYear debe ser mayor que startYear.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateGenerationBody' }
 *     responses:
 *       201:
 *         description: Generación creada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Generation' }
 *       400: { description: Error de validación (startYear/endYear) }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       409: { description: Generación duplicada }
 */

/**
 * @swagger
 * /generations/{id}:
 *   put:
 *     tags: [Generaciones]
 *     summary: Actualizar generación (completo)
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
 *           schema: { $ref: '#/components/schemas/UpdateGenerationBody' }
 *     responses:
 *       200:
 *         description: Generación actualizada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Generation' }
 *       400: { description: Error de validación }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Generación no encontrada }
 *       409: { description: Generación duplicada }
 */

/**
 * @swagger
 * /generations/{id}:
 *   patch:
 *     tags: [Generaciones]
 *     summary: Actualizar generación (parcial)
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
 *           schema: { $ref: '#/components/schemas/UpdateGenerationBody' }
 *     responses:
 *       200:
 *         description: Generación actualizada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Generation' }
 *       400: { description: Error de validación }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Generación no encontrada }
 *       409: { description: Generación duplicada }
 */

/**
 * @swagger
 * /generations/{id}:
 *   delete:
 *     tags: [Generaciones]
 *     summary: Eliminar generación
 *     description: Solo ADMIN.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Generación eliminada
 *         content:
 *           application/json:
 *             schema: { type: object, properties: { message: { type: string } } }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Generación no encontrada }
 */

/**
 * @swagger
 * /generations/{id}/activate:
 *   post:
 *     tags: [Generaciones]
 *     summary: Activar generación
 *     description: Solo ADMIN.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Generación activada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Generation' }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Generación no encontrada }
 */

/**
 * @swagger
 * /generations/{id}/deactivate:
 *   post:
 *     tags: [Generaciones]
 *     summary: Desactivar generación
 *     description: Solo ADMIN.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Generación desactivada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Generation' }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Generación no encontrada }
 */

/* eslint-disable-next-line no-unused-expressions */
0;
