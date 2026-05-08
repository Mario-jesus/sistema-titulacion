/**
 * OpenAPI (Swagger) documentation for the New Admissions module.
 * Used by swagger-jsdoc to generate the API spec.
 */

/**
 * @swagger
 * tags:
 *   name: NewAdmissions
 *   description: Gestión de admisiones por carrera y generación (requiere autenticación)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     NewAdmission:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: ID del registro
 *         generationId:
 *           type: string
 *         careerId:
 *           type: string
 *         maleCount:
 *           type: integer
 *           minimum: 0
 *         femaleCount:
 *           type: integer
 *           minimum: 0
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
 *     CreateNewAdmissionBody:
 *       type: object
 *       required: [careerId, generationId]
 *       properties:
 *         careerId:
 *           type: string
 *         generationId:
 *           type: string
 *         maleCount:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         femaleCount:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description:
 *           type: string
 *           nullable: true
 *         isActive:
 *           type: boolean
 *           default: true
 *     UpdateNewAdmissionBody:
 *       type: object
 *       properties:
 *         careerId:
 *           type: string
 *         generationId:
 *           type: string
 *         maleCount:
 *           type: integer
 *           minimum: 0
 *         femaleCount:
 *           type: integer
 *           minimum: 0
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
 * /new-admissions:
 *   get:
 *     tags: [NewAdmissions]
 *     summary: Listar admisiones
 *     description: Lista paginada. Escritura requiere rol ADMIN.
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
 *         description: Búsqueda en description
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Alias de search
 *       - in: query
 *         name: careerId
 *         schema: { type: string }
 *       - in: query
 *         name: generationId
 *         schema: { type: string }
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, enum: [maleCount, femaleCount, createdAt, isActive], default: createdAt }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: desc }
 *     responses:
 *       200:
 *         description: Lista paginada de admisiones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/NewAdmission' } }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos (FORBIDDEN) }
 */

/**
 * @swagger
 * /new-admissions/{id}:
 *   get:
 *     tags: [NewAdmissions]
 *     summary: Detalle de admisión
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Registro de admisiones
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/NewAdmission' }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos }
 *       404: { description: No encontrado (NEW_ADMISSION_NOT_FOUND) }
 */

/**
 * @swagger
 * /new-admissions:
 *   post:
 *     tags: [NewAdmissions]
 *     summary: Crear registro de admisiones
 *     description: Solo ADMIN. careerId y generationId requeridos. Unicidad compuesta (careerId+generationId).
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateNewAdmissionBody' }
 *     responses:
 *       201:
 *         description: Registro creado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/NewAdmission' }
 *       400: { description: Error de validación (VALIDATION_ERROR) }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos (FORBIDDEN) }
 *       404: { description: Carrera o generación no encontrada (CAREER_NOT_FOUND, GENERATION_NOT_FOUND) }
 *       409: { description: Duplicado careerId+generationId (DUPLICATE_ERROR) }
 */

/**
 * @swagger
 * /new-admissions/{id}:
 *   put:
 *     tags: [NewAdmissions]
 *     summary: Actualizar registro (completo)
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
 *           schema: { $ref: '#/components/schemas/UpdateNewAdmissionBody' }
 *     responses:
 *       200:
 *         description: Registro actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/NewAdmission' }
 *       400: { description: Error de validación (VALIDATION_ERROR) }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos (FORBIDDEN) }
 *       404: { description: No encontrado (NEW_ADMISSION_NOT_FOUND, CAREER_NOT_FOUND, GENERATION_NOT_FOUND) }
 *       409: { description: Duplicado (DUPLICATE_ERROR) }
 */

/**
 * @swagger
 * /new-admissions/{id}:
 *   patch:
 *     tags: [NewAdmissions]
 *     summary: Actualizar registro (parcial)
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
 *           schema: { $ref: '#/components/schemas/UpdateNewAdmissionBody' }
 *     responses:
 *       200:
 *         description: Registro actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/NewAdmission' }
 *       400: { description: Error de validación (VALIDATION_ERROR) }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos (FORBIDDEN) }
 *       404: { description: No encontrado (NEW_ADMISSION_NOT_FOUND, CAREER_NOT_FOUND, GENERATION_NOT_FOUND) }
 *       409: { description: Duplicado (DUPLICATE_ERROR) }
 */

/**
 * @swagger
 * /new-admissions/{id}:
 *   delete:
 *     tags: [NewAdmissions]
 *     summary: Eliminar registro
 *     description: Solo ADMIN.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Registro eliminado
 *         content:
 *           application/json:
 *             schema: { type: object, properties: { message: { type: string } } }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos (FORBIDDEN) }
 *       404: { description: No encontrado (NEW_ADMISSION_NOT_FOUND) }
 */

/**
 * @swagger
 * /new-admissions/{id}/activate:
 *   post:
 *     tags: [NewAdmissions]
 *     summary: Activar registro
 *     description: Solo ADMIN.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Registro activado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/NewAdmission' }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos (FORBIDDEN) }
 *       404: { description: No encontrado (NEW_ADMISSION_NOT_FOUND) }
 */

/**
 * @swagger
 * /new-admissions/{id}/deactivate:
 *   post:
 *     tags: [NewAdmissions]
 *     summary: Desactivar registro
 *     description: Solo ADMIN.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Registro desactivado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/NewAdmission' }
 *       401: { description: No autenticado }
 *       403: { description: Sin permisos (FORBIDDEN) }
 *       404: { description: No encontrado (NEW_ADMISSION_NOT_FOUND) }
 */

/* eslint-disable-next-line no-unused-expressions */
0;
