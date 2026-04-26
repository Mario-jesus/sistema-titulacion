/**
 * OpenAPI (Swagger) documentation for the Backups module.
 */

/**
 * @swagger
 * tags:
 *   name: Backups
 *   description: Gestión de respaldos del sistema (solo ADMIN)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Backup:
 *       type: object
 *       properties:
 *         id: { type: string }
 *         name: { type: string }
 *         description: { type: string }
 *         status:
 *           type: string
 *           enum: [AVAILABLE, IN_PROGRESS, FAILED, UNAVAILABLE]
 *         size:
 *           type: integer
 *           description: Tamaño en bytes del archivo cifrado
 *         tablesCount: { type: integer }
 *         recordsCount: { type: integer }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *         completedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdBy:
 *           type: string
 *           description: Email del usuario que generó el respaldo
 *         filePath:
 *           type: string
 *           nullable: true
 *         checksum:
 *           type: string
 *           nullable: true
 *           description: SHA-256 hex del payload cifrado
 *     BackupPagination:
 *       type: object
 *       properties:
 *         total: { type: integer }
 *         limit: { type: integer }
 *         totalPages: { type: integer }
 *         page: { type: integer }
 *         pagingCounter: { type: integer }
 *         hasPrevPage: { type: boolean }
 *         hasNextPage: { type: boolean }
 *         prevPage: { type: integer, nullable: true }
 *         nextPage: { type: integer, nullable: true }
 *     BackupListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items: { $ref: '#/components/schemas/Backup' }
 *         pagination: { $ref: '#/components/schemas/BackupPagination' }
 *     CreateBackupRequest:
 *       type: object
 *       required: [name]
 *       properties:
 *         name: { type: string, maxLength: 200 }
 *         description: { type: string, maxLength: 500 }
 */

/**
 * @swagger
 * /backups:
 *   get:
 *     tags: [Backups]
 *     summary: Listar respaldos paginados
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, minimum: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, minimum: 1, maximum: 100 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Lista paginada de respaldos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/BackupListResponse' }
 *       401: { description: No autenticado }
 */

/**
 * @swagger
 * /backups:
 *   post:
 *     tags: [Backups]
 *     summary: Generar un nuevo respaldo
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/CreateBackupRequest' }
 *     responses:
 *       201:
 *         description: Respaldo creado exitosamente
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Backup' }
 *       400: { description: VALIDATION_ERROR }
 *       401: { description: No autenticado }
 *       409: { description: BACKUP_IN_PROGRESS }
 */

/**
 * @swagger
 * /backups/upload:
 *   post:
 *     tags: [Backups]
 *     summary: Subir un archivo de respaldo previamente generado
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *               name:
 *                 type: string
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Respaldo registrado exitosamente
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Backup' }
 *       400: { description: VALIDATION_ERROR o NO_FILE_UPLOADED o INVALID_BACKUP_FILE }
 *       401: { description: No autenticado }
 *       409: { description: DUPLICATE_BACKUP }
 */

/**
 * @swagger
 * /backups/{id}:
 *   get:
 *     tags: [Backups]
 *     summary: Obtener un respaldo por id
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Respaldo encontrado
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Backup' }
 *       401: { description: No autenticado }
 *       404: { description: BACKUP_NOT_FOUND }
 */

/**
 * @swagger
 * /backups/{id}:
 *   delete:
 *     tags: [Backups]
 *     summary: Eliminar un respaldo
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Respaldo eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       401: { description: No autenticado }
 *       404: { description: BACKUP_NOT_FOUND }
 */

/**
 * @swagger
 * /backups/{id}/download:
 *   get:
 *     tags: [Backups]
 *     summary: Descargar el archivo binario del respaldo
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Stream binario del respaldo cifrado
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401: { description: No autenticado }
 *       404: { description: BACKUP_NOT_FOUND o BACKUP_FILE_MISSING }
 *       400: { description: BACKUP_NOT_AVAILABLE }
 */

/**
 * @swagger
 * /backups/{id}/restore:
 *   post:
 *     tags: [Backups]
 *     summary: Restaurar un respaldo previamente generado
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Restauración completada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *       401: { description: No autenticado }
 *       404: { description: BACKUP_NOT_FOUND }
 *       400: { description: BACKUP_NOT_AVAILABLE }
 *       409: { description: RESTORE_IN_PROGRESS }
 */

export {};
