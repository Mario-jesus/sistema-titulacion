/**
 * @swagger
 * tags:
 *   name: Graduations
 *   description: Titulaciones por estudiante (requiere autenticación)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Graduation:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         studentId: { type: string }
 *         graduationOptionId: { type: string, nullable: true }
 *         graduationDate: { type: string, format: date-time, nullable: true }
 *         scheduledDate: { type: string, format: date-time, nullable: true }
 *         president: { type: string }
 *         secretary: { type: string }
 *         vocal: { type: string }
 *         substituteVocal: { type: string }
 *         notes: { type: string, nullable: true }
 *         idCardNumber: { type: string, nullable: true }
 *         idCardIssueDate: { type: string, format: date-time, nullable: true }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     CreateGraduationBody:
 *       type: object
 *       required:
 *         [studentId, president, secretary, vocal, substituteVocal]
 *       properties:
 *         studentId: { type: string }
 *         graduationOptionId: { type: string, nullable: true }
 *         graduationDate: { type: string, format: date-time }
 *         scheduledDate: { type: string, format: date-time }
 *         president: { type: string }
 *         secretary: { type: string }
 *         vocal: { type: string }
 *         substituteVocal: { type: string }
 *         notes: { type: string, nullable: true }
 *         idCardNumber: { type: string }
 *         idCardIssueDate: { type: string, format: date-time }
 *     UpdateGraduationBody:
 *       type: object
 *       properties:
 *         studentId: { type: string }
 *         graduationOptionId: { type: string, nullable: true }
 *         graduationDate: { type: string, format: date-time }
 *         scheduledDate: { type: string, format: date-time }
 *         president: { type: string }
 *         secretary: { type: string }
 *         vocal: { type: string }
 *         substituteVocal: { type: string }
 *         notes: { type: string, nullable: true }
 *         idCardNumber: { type: string }
 *         idCardIssueDate: { type: string, format: date-time }
 */

/**
 * @swagger
 * /graduations/student/{id}:
 *   get:
 *     tags: [Graduations]
 *     summary: Obtener titulación por studentId
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
 *             schema: { $ref: '#/components/schemas/Graduation' }
 *       401: { description: No autenticado }
 *       404: { description: GRADUATION_NOT_FOUND }
 */

/**
 * @swagger
 * /graduations:
 *   post:
 *     tags: [Graduations]
 *     summary: Crear titulación
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateGraduationBody' }
 *     responses:
 *       201:
 *         description: Creado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Graduation' }
 *       400: { description: VALIDATION_ERROR, INVALID_GRADUATION_DATE }
 *       401: { description: No autenticado }
 *       404: { description: STUDENT_NOT_FOUND, GRADUATION_OPTION_NOT_FOUND }
 *       409: { description: DUPLICATE_ERROR }
 */

/**
 * @swagger
 * /graduations/student/{id}:
 *   put:
 *     tags: [Graduations]
 *     summary: Actualizar titulación por studentId
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
 *           schema: { $ref: '#/components/schemas/UpdateGraduationBody' }
 *     responses:
 *       200:
 *         description: Actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Graduation' }
 *       400: { description: VALIDATION_ERROR, INVALID_GRADUATION_DATE }
 *       401: { description: No autenticado }
 *       404: { description: GRADUATION_NOT_FOUND, STUDENT_NOT_FOUND, GRADUATION_OPTION_NOT_FOUND }
 *       409: { description: DUPLICATE_ERROR }
 *   patch:
 *     tags: [Graduations]
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
 *           schema: { $ref: '#/components/schemas/UpdateGraduationBody' }
 *     responses:
 *       200:
 *         description: Actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Graduation' }
 *       400: { description: VALIDATION_ERROR, INVALID_GRADUATION_DATE }
 *       401: { description: No autenticado }
 *       404: { description: GRADUATION_NOT_FOUND, STUDENT_NOT_FOUND, GRADUATION_OPTION_NOT_FOUND }
 *       409: { description: DUPLICATE_ERROR }
 *   delete:
 *     tags: [Graduations]
 *     summary: Eliminar titulación por studentId
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Eliminado
 *       401: { description: No autenticado }
 *       404: { description: GRADUATION_NOT_FOUND }
 */

/**
 * @swagger
 * /graduations/{studentId}/graduate:
 *   post:
 *     tags: [Graduations]
 *     summary: Marcar estudiante como graduado
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Graduation' }
 *       400: { description: VALIDATION_ERROR, INVALID_STUDENT_STATUS, INVALID_GRADUATION_DATE }
 *       401: { description: No autenticado }
 *       404: { description: GRADUATION_NOT_FOUND, STUDENT_NOT_FOUND }
 */

/**
 * @swagger
 * /graduations/{studentId}/ungraduate:
 *   post:
 *     tags: [Graduations]
 *     summary: Desmarcar como graduado
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Graduation' }
 *       401: { description: No autenticado }
 *       404: { description: GRADUATION_NOT_FOUND }
 */
