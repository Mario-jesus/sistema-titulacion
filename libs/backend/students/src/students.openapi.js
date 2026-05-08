/**
 * @swagger
 * tags:
 *   name: Students
 *   description: Gestión de estudiantes (requiere autenticación)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         careerId:
 *           type: string
 *         generationId:
 *           type: string
 *         controlNumber:
 *           type: string
 *         firstName:
 *           type: string
 *         paternalLastName:
 *           type: string
 *         maternalLastName:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         email:
 *           type: string
 *         birthDate:
 *           type: string
 *           format: date-time
 *         sex:
 *           type: string
 *           enum: [MASCULINO, FEMENINO]
 *         isEgressed:
 *           type: boolean
 *         status:
 *           type: string
 *           enum: [ACTIVO, PAUSADO, CANCELADO]
 *         processStatus:
 *           type: string
 *           enum: [NOT_STARTED, IN_PROCESS, SCHEDULED, GRADUATED]
 *         hasIdCard:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateStudentBody:
 *       type: object
 *       required: [careerId, generationId, controlNumber, firstName, paternalLastName, email, birthDate, sex]
 *       properties:
 *         careerId:
 *           type: string
 *         generationId:
 *           type: string
 *         controlNumber:
 *           type: string
 *         firstName:
 *           type: string
 *         paternalLastName:
 *           type: string
 *         maternalLastName:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         email:
 *           type: string
 *         birthDate:
 *           type: string
 *           format: date
 *         sex:
 *           type: string
 *           enum: [MASCULINO, FEMENINO]
 *         isEgressed:
 *           type: boolean
 *           default: false
 *         status:
 *           type: string
 *           enum: [ACTIVO, PAUSADO, CANCELADO]
 *           default: ACTIVO
 *         processStatus:
 *           type: string
 *           enum: [NOT_STARTED, IN_PROCESS, SCHEDULED, GRADUATED]
 *           default: NOT_STARTED
 *         hasIdCard:
 *           type: boolean
 *           default: false
 *     UpdateStudentBody:
 *       type: object
 *       properties:
 *         careerId:
 *           type: string
 *         generationId:
 *           type: string
 *         controlNumber:
 *           type: string
 *         firstName:
 *           type: string
 *         paternalLastName:
 *           type: string
 *         maternalLastName:
 *           type: string
 *         phoneNumber:
 *           type: string
 *         email:
 *           type: string
 *         birthDate:
 *           type: string
 *           format: date
 *         sex:
 *           type: string
 *           enum: [MASCULINO, FEMENINO]
 *         isEgressed:
 *           type: boolean
 *         status:
 *           type: string
 *           enum: [ACTIVO, PAUSADO, CANCELADO]
 *         processStatus:
 *           type: string
 *           enum: [NOT_STARTED, IN_PROCESS, SCHEDULED, GRADUATED]
 *         hasIdCard:
 *           type: boolean
 *     ChangeStatusBody:
 *       type: object
 *       required: [status]
 *       properties:
 *         status:
 *           type: string
 *           enum: [ACTIVO, PAUSADO, CANCELADO]
 *     ProcessStatusBody:
 *       type: object
 *       required: [processStatus]
 *       properties:
 *         processStatus:
 *           type: string
 *           enum: [NOT_STARTED, IN_PROCESS, SCHEDULED, GRADUATED]
 *         hasIdCard:
 *           type: boolean
 *         scheduledDate:
 *           type: string
 *           format: date
 *         graduationDate:
 *           type: string
 *           format: date
 *         idCardNumber:
 *           type: string
 *         idCardIssueDate:
 *           type: string
 *           format: date
 */

/**
 * @swagger
 * /students:
 *   get:
 *     tags: [Students]
 *     summary: Listar estudiantes
 *     description: Lista paginada de estudiantes con filtros.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: careerId
 *         schema: { type: string }
 *         description: Filtrar por carrera
 *       - in: query
 *         name: generationId
 *         schema: { type: string }
 *         description: Filtrar por generación
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [ACTIVO, PAUSADO, CANCELADO] }
 *       - in: query
 *         name: processStatus
 *         schema: { type: string, enum: [NOT_STARTED, IN_PROCESS, SCHEDULED, GRADUATED] }
 *       - in: query
 *         name: isEgressed
 *         schema: { type: string, enum: ['true', 'false'] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Búsqueda por nombre o número de control
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Alias de search
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, default: paternalLastName }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: asc }
 *     responses:
 *       200:
 *         description: Lista paginada de estudiantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/Student' } }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *       401: { description: No autenticado }
 */

/**
 * @swagger
 * /students/in-progress:
 *   get:
 *     tags: [Students]
 *     summary: Listar estudiantes en proceso
 *     description: Estudiantes con processStatus = IN_PROCESS.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: careerId
 *         schema: { type: string }
 *       - in: query
 *         name: generationId
 *         schema: { type: string }
 *       - in: query
 *         name: sex
 *         schema: { type: string, enum: [MASCULINO, FEMENINO] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Alias de search
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, default: paternalLastName }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: asc }
 *     responses:
 *       200:
 *         description: Lista paginada de estudiantes en proceso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/Student' } }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *       401: { description: No autenticado }
 */

/**
 * @swagger
 * /students/scheduled:
 *   get:
 *     tags: [Students]
 *     summary: Listar estudiantes programados
 *     description: Estudiantes con processStatus = SCHEDULED.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: careerId
 *         schema: { type: string }
 *       - in: query
 *         name: generationId
 *         schema: { type: string }
 *       - in: query
 *         name: sex
 *         schema: { type: string, enum: [MASCULINO, FEMENINO] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Alias de search
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, default: paternalLastName }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: asc }
 *     responses:
 *       200:
 *         description: Lista paginada de estudiantes programados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/Student' } }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *       401: { description: No autenticado }
 */

/**
 * @swagger
 * /students/graduated:
 *   get:
 *     tags: [Students]
 *     summary: Listar estudiantes titulados
 *     description: Estudiantes con processStatus = GRADUATED.
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100, default: 10 }
 *       - in: query
 *         name: careerId
 *         schema: { type: string }
 *       - in: query
 *         name: generationId
 *         schema: { type: string }
 *       - in: query
 *         name: sex
 *         schema: { type: string, enum: [MASCULINO, FEMENINO] }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Alias de search
 *       - in: query
 *         name: sortBy
 *         schema: { type: string, default: paternalLastName }
 *       - in: query
 *         name: sortOrder
 *         schema: { type: string, enum: [asc, desc], default: asc }
 *     responses:
 *       200:
 *         description: Lista paginada de estudiantes titulados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { type: array, items: { $ref: '#/components/schemas/Student' } }
 *                 pagination: { $ref: '#/components/schemas/Pagination' }
 *       401: { description: No autenticado }
 */

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     tags: [Students]
 *     summary: Detalle de estudiante
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Estudiante con datos poblados
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Student' }
 *       401: { description: No autenticado }
 *       404: { description: Estudiante no encontrado (STUDENT_NOT_FOUND) }
 */

/**
 * @swagger
 * /students:
 *   post:
 *     tags: [Students]
 *     summary: Crear estudiante
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateStudentBody' }
 *     responses:
 *       201:
 *         description: Estudiante creado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Student' }
 *       400: { description: Error de validación (VALIDATION_ERROR) }
 *       401: { description: No autenticado }
 *       409: { description: controlNumber o email duplicado (DUPLICATE_ERROR) }
 */

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     tags: [Students]
 *     summary: Actualizar estudiante (completo)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateStudentBody' }
 *     responses:
 *       200:
 *         description: Estudiante actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Student' }
 *       400: { description: Error de validación (VALIDATION_ERROR) }
 *       401: { description: No autenticado }
 *       404: { description: Estudiante no encontrado (STUDENT_NOT_FOUND) }
 *       409: { description: controlNumber o email duplicado (DUPLICATE_ERROR) }
 */

/**
 * @swagger
 * /students/{id}:
 *   patch:
 *     tags: [Students]
 *     summary: Actualizar estudiante (parcial)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/UpdateStudentBody' }
 *     responses:
 *       200:
 *         description: Estudiante actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Student' }
 *       400: { description: Error de validación (VALIDATION_ERROR) }
 *       401: { description: No autenticado }
 *       404: { description: Estudiante no encontrado (STUDENT_NOT_FOUND) }
 *       409: { description: controlNumber o email duplicado (DUPLICATE_ERROR) }
 */

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     tags: [Students]
 *     summary: Eliminar estudiante
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Estudiante eliminado
 *         content:
 *           application/json:
 *             schema: { type: object, properties: { message: { type: string } } }
 *       401: { description: No autenticado }
 *       404: { description: Estudiante no encontrado (STUDENT_NOT_FOUND) }
 */

/**
 * @swagger
 * /students/{id}/status:
 *   post:
 *     tags: [Students]
 *     summary: Cambiar estatus del estudiante
 *     description: Cambia entre ACTIVO, PAUSADO y CANCELADO.
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
 *           schema: { $ref: '#/components/schemas/ChangeStatusBody' }
 *     responses:
 *       200:
 *         description: Estatus actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Student' }
 *       400: { description: Error de validación (VALIDATION_ERROR) }
 *       401: { description: No autenticado }
 *       404: { description: Estudiante no encontrado (STUDENT_NOT_FOUND) }
 */

/**
 * @swagger
 * /students/{id}/egress:
 *   post:
 *     tags: [Students]
 *     summary: Marcar estudiante como egresado
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Estudiante marcado como egresado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Student' }
 *       401: { description: No autenticado }
 *       404: { description: Estudiante no encontrado (STUDENT_NOT_FOUND) }
 */

/**
 * @swagger
 * /students/{id}/unegress:
 *   post:
 *     tags: [Students]
 *     summary: Desmarcar estudiante como egresado
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Estudiante desmarcado como egresado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Student' }
 *       401: { description: No autenticado }
 *       404: { description: Estudiante no encontrado (STUDENT_NOT_FOUND) }
 */

/**
 * @swagger
 * /students/{id}/process-status:
 *   post:
 *     tags: [Students]
 *     summary: Actualizar estatus de proceso de titulación
 *     description: Cambia processStatus y campos relacionados (scheduledDate, graduationDate, idCard, etc.).
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
 *           schema: { $ref: '#/components/schemas/ProcessStatusBody' }
 *     responses:
 *       200:
 *         description: Estatus de proceso actualizado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Student' }
 *       400: { description: Error de validación (VALIDATION_ERROR) }
 *       401: { description: No autenticado }
 *       404: { description: Estudiante no encontrado (STUDENT_NOT_FOUND) }
 */

/* eslint-disable-next-line @typescript-eslint/no-unused-expressions */
0;
