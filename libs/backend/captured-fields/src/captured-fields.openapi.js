/**
 * @swagger
 * tags:
 *   name: CapturedFields
 *   description: Campos capturados por estudiante (requiere autenticación)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CapturedFields:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         studentId: { type: string }
 *         processDate: { type: string, description: Fecha YYYY-MM-DD }
 *         projectName: { type: string }
 *         company: { type: string }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     CreateCapturedFieldsBody:
 *       type: object
 *       required: [studentId, processDate, projectName, company]
 *       properties:
 *         studentId: { type: string }
 *         processDate: { type: string, format: date }
 *         projectName: { type: string }
 *         company: { type: string }
 *     UpdateCapturedFieldsBody:
 *       type: object
 *       properties:
 *         studentId: { type: string }
 *         processDate: { type: string, format: date }
 *         projectName: { type: string }
 *         company: { type: string }
 */

/**
 * @swagger
 * /captured-fields/student/{id}:
 *   get:
 *     tags: [CapturedFields]
 *     summary: Obtener campos capturados por studentId
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Registro encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CapturedFields' }
 *       401: { description: No autenticado }
 *       404: { description: CAPTURED_FIELDS_NOT_FOUND }
 */

/**
 * @swagger
 * /captured-fields:
 *   post:
 *     tags: [CapturedFields]
 *     summary: Crear campos capturados
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateCapturedFieldsBody' }
 *     responses:
 *       201:
 *         description: Creado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CapturedFields' }
 *       400: { description: VALIDATION_ERROR o INVALID_STUDENT_STATUS }
 *       401: { description: No autenticado }
 *       404: { description: STUDENT_NOT_FOUND }
 *       409: { description: DUPLICATE_ERROR }
 */

/**
 * @swagger
 * /captured-fields/student/{id}:
 *   put:
 *     tags: [CapturedFields]
 *     summary: Actualizar campos capturados por studentId
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
 *           schema: { $ref: '#/components/schemas/UpdateCapturedFieldsBody' }
 *     responses:
 *       200:
 *         description: Actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CapturedFields' }
 *       400: { description: VALIDATION_ERROR o INVALID_STUDENT_STATUS }
 *       401: { description: No autenticado }
 *       404: { description: CAPTURED_FIELDS_NOT_FOUND o STUDENT_NOT_FOUND }
 *       409: { description: DUPLICATE_ERROR }
 */

/**
 * @swagger
 * /captured-fields/student/{id}:
 *   patch:
 *     tags: [CapturedFields]
 *     summary: Actualización parcial por studentId
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
 *           schema: { $ref: '#/components/schemas/UpdateCapturedFieldsBody' }
 *     responses:
 *       200:
 *         description: Actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/CapturedFields' }
 *       400: { description: VALIDATION_ERROR o INVALID_STUDENT_STATUS }
 *       401: { description: No autenticado }
 *       404: { description: CAPTURED_FIELDS_NOT_FOUND o STUDENT_NOT_FOUND }
 *       409: { description: DUPLICATE_ERROR }
 */

/**
 * @swagger
 * /captured-fields/student/{id}:
 *   delete:
 *     tags: [CapturedFields]
 *     summary: Eliminar por studentId
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Eliminado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       401: { description: No autenticado }
 *       404: { description: CAPTURED_FIELDS_NOT_FOUND }
 */

/* eslint-disable-next-line @typescript-eslint/no-unused-expressions */
0;
