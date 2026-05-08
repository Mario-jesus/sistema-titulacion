/**
 * OpenAPI (Swagger) documentation for the Modalities module.
 * Used by swagger-jsdoc to generate the API spec.
 */

/**
 * @swagger
 * tags:
 *   name: Modalidades
 *   description: Gestión de modalidades de titulación (requiere autenticación)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Modality:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID de la modalidad
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
 *     CreateModalityBody:
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
 *     UpdateModalityBody:
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
 * /modalities:
 *   get:
 *     tags: [Modalidades]
 *     summary: Listar modalidades
 *     description: Lista paginada de modalidades. Los endpoints de escritura requieren rol ADMIN.
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
 *         description: Lista paginada de modalidades
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/Modality' } }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *       401: { description: No autenticado }
 */

/**
 * @swagger
 * /modalities/{id}:
 *   get:
 *     tags: [Modalidades]
 *     summary: Detalle de modalidad
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Modalidad
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Modality' }
 *       401: { description: No autenticado }
 *       404: { description: Modalidad no encontrada }
 */

/**
 * @swagger
 * /modalities:
 *   post:
 *     tags: [Modalidades]
 *     summary: Crear modalidad
 *     description: Solo ADMIN.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateModalityBody' }
 *     responses:
 *       201:
 *         description: Modalidad creada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Modality' }
 *       400: { description: Error de validación }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       409: { description: Nombre de modalidad ya existe }
 */

/**
 * @swagger
 * /modalities/{id}:
 *   put:
 *     tags: [Modalidades]
 *     summary: Actualizar modalidad (completo)
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
 *           schema: { $ref: '#/components/schemas/UpdateModalityBody' }
 *     responses:
 *       200:
 *         description: Modalidad actualizada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Modality' }
 *       400: { description: Error de validación }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Modalidad no encontrada }
 *       409: { description: Nombre de modalidad ya existe }
 */

/**
 * @swagger
 * /modalities/{id}:
 *   patch:
 *     tags: [Modalidades]
 *     summary: Actualizar modalidad (parcial)
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
 *           schema: { $ref: '#/components/schemas/UpdateModalityBody' }
 *     responses:
 *       200:
 *         description: Modalidad actualizada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Modality' }
 *       400: { description: Error de validación }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Modalidad no encontrada }
 *       409: { description: Nombre de modalidad ya existe }
 */

/**
 * @swagger
 * /modalities/{id}:
 *   delete:
 *     tags: [Modalidades]
 *     summary: Eliminar modalidad
 *     description: Solo ADMIN.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Modalidad eliminada
 *         content:
 *           application/json:
 *             schema: { type: object, properties: { message: { type: string } } }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Modalidad no encontrada }
 *       409: { description: Modalidad en uso, no se puede eliminar }
 */

/**
 * @swagger
 * /modalities/{id}/activate:
 *   post:
 *     tags: [Modalidades]
 *     summary: Activar modalidad
 *     description: Solo ADMIN.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Modalidad activada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Modality' }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Modalidad no encontrada }
 */

/**
 * @swagger
 * /modalities/{id}/deactivate:
 *   post:
 *     tags: [Modalidades]
 *     summary: Desactivar modalidad
 *     description: Solo ADMIN.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Modalidad desactivada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Modality' }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Modalidad no encontrada }
 */

/* eslint-disable-next-line no-unused-expressions */
0;
