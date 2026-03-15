/**
 * OpenAPI (Swagger) documentation for the Careers module.
 * Used by swagger-jsdoc to generate the API spec.
 */

/**
 * @swagger
 * tags:
 *   name: Careers
 *   description: Gestión de carreras (requiere autenticación)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ModalityRef:
 *       type: object
 *       nullable: true
 *       properties:
 *         id:
 *           type: string
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
 *     Career:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID de la carrera
 *         name:
 *           type: string
 *         shortName:
 *           type: string
 *         modalityId:
 *           type: string
 *         modality:
 *           $ref: '#/components/schemas/ModalityRef'
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
 *     CreateCareerBody:
 *       type: object
 *       required: [name, shortName, modalityId]
 *       properties:
 *         name:
 *           type: string
 *         shortName:
 *           type: string
 *         modalityId:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         isActive:
 *           type: boolean
 *           default: true
 *     UpdateCareerBody:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         shortName:
 *           type: string
 *         modalityId:
 *           type: string
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
 * /careers:
 *   get:
 *     tags: [Careers]
 *     summary: Listar carreras
 *     description: Lista paginada de carreras. Escritura requiere rol ADMIN.
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
 *         description: Búsqueda en name y shortName
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Alias de search
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [name, shortName, createdAt, isActive], default: name }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: asc }
 *     responses:
 *       200:
 *         description: Lista paginada de carreras
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/Career' } }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 */

/**
 * @swagger
 * /careers/{id}:
 *   get:
 *     tags: [Careers]
 *     summary: Detalle de carrera
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Carrera con modalidad poblada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Career' }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Carrera no encontrada (CAREER_NOT_FOUND) }
 */

/**
 * @swagger
 * /careers:
 *   post:
 *     tags: [Careers]
 *     summary: Crear carrera
 *     description: Solo ADMIN.
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateCareerBody' }
 *     responses:
 *       201:
 *         description: Carrera creada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Career' }
 *       400: { description: Error de validación (VALIDATION_ERROR) }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Modalidad no encontrada (MODALITY_NOT_FOUND) }
 *       409: { description: name o shortName ya existe (DUPLICATE_ERROR) }
 */

/**
 * @swagger
 * /careers/{id}:
 *   put:
 *     tags: [Careers]
 *     summary: Actualizar carrera (completo)
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
 *           schema: { $ref: '#/components/schemas/UpdateCareerBody' }
 *     responses:
 *       200:
 *         description: Carrera actualizada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Career' }
 *       400: { description: Error de validación (VALIDATION_ERROR) }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Carrera o modalidad no encontrada (CAREER_NOT_FOUND, MODALITY_NOT_FOUND) }
 *       409: { description: name o shortName duplicado (DUPLICATE_ERROR) }
 */

/**
 * @swagger
 * /careers/{id}:
 *   patch:
 *     tags: [Careers]
 *     summary: Actualizar carrera (parcial)
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
 *           schema: { $ref: '#/components/schemas/UpdateCareerBody' }
 *     responses:
 *       200:
 *         description: Carrera actualizada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Career' }
 *       400: { description: Error de validación (VALIDATION_ERROR) }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Carrera o modalidad no encontrada (CAREER_NOT_FOUND, MODALITY_NOT_FOUND) }
 *       409: { description: name o shortName duplicado (DUPLICATE_ERROR) }
 */

/**
 * @swagger
 * /careers/{id}:
 *   delete:
 *     tags: [Careers]
 *     summary: Eliminar carrera
 *     description: Solo ADMIN.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Carrera eliminada
 *         content:
 *           application/json:
 *             schema: { type: object, properties: { message: { type: string } } }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Carrera no encontrada (CAREER_NOT_FOUND) }
 */

/**
 * @swagger
 * /careers/{id}/activate:
 *   post:
 *     tags: [Careers]
 *     summary: Activar carrera
 *     description: Solo ADMIN.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Carrera activada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Career' }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Carrera no encontrada (CAREER_NOT_FOUND) }
 */

/**
 * @swagger
 * /careers/{id}/deactivate:
 *   post:
 *     tags: [Careers]
 *     summary: Desactivar carrera
 *     description: Solo ADMIN.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Carrera desactivada
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Career' }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: Carrera no encontrada (CAREER_NOT_FOUND) }
 */

/* eslint-disable-next-line no-unused-expressions */
0;
