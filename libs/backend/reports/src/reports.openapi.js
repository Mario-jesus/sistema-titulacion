/**
 * OpenAPI (Swagger) documentation for the Reports module.
 */

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Generación de reportes de titulación (requiere autenticación, no disponible para STAFF)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GenerateReportRequest:
 *       type: object
 *       required: [graduationRateDenominator, includeOtherValue, reportType]
 *       properties:
 *         reportType:
 *           type: string
 *           enum: [por-generaciones, por-carreras]
 *         graduationRateDenominator:
 *           type: string
 *           enum: [ingreso, egreso]
 *         includeOtherValue:
 *           type: boolean
 *         sex:
 *           type: string
 *           enum: [general, MASCULINO, FEMENINO]
 *         dateRange:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [general, specific]
 *             startYear:
 *               type: integer
 *             endYear:
 *               type: integer
 *         careers:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [general, specific]
 *             selected:
 *               type: array
 *               items: { type: string }
 *         startYear:
 *           type: integer
 *           description: Compatibilidad con formato anterior
 *         endYear:
 *           type: integer
 *           description: Compatibilidad con formato anterior
 *         careerIds:
 *           type: array
 *           items: { type: string }
 *           description: Compatibilidad con formato anterior
 *     ReportTotals:
 *       type: object
 *       properties:
 *         titulados: { type: integer }
 *         porcentaje: { type: number }
 *         ingreso:
 *           type: integer
 *           description: Presente si graduationRateDenominator es ingreso o includeOtherValue es true
 *         egreso:
 *           type: integer
 *           description: Presente si graduationRateDenominator es egreso o includeOtherValue es true
 *     ReportErrorResponse:
 *       type: object
 *       properties:
 *         error: { type: string }
 *         code:
 *           type: string
 *           enum: [FORBIDDEN_REPORTS, REPORT_TYPE_NOT_SUPPORTED, NO_CAREERS_FOUND, NO_GENERATIONS_FOUND, CAREERS_REQUIRED, VALIDATION_ERROR]
 */

/**
 * @swagger
 * /reports/generate:
 *   post:
 *     tags: [Reports]
 *     summary: Generar reporte de titulación
 *     description: |
 *       Genera un reporte según el tipo solicitado. Requiere rol ADMIN o COORDINATOR.
 *       El rol STAFF recibe 403 FORBIDDEN_REPORTS.
 *
 *       Variantes de respuesta según parámetros:
 *       - `tableType: summary` — sin filtros de año ni carrera
 *       - `tableType: table` — con filtro de año (por-generaciones) o carrera (por-carreras)
 *       - `tableType: grouped` — por-generaciones con carreras específicas
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/GenerateReportRequest' }
 *           examples:
 *             summary:
 *               summary: Resumen general
 *               value:
 *                 reportType: por-generaciones
 *                 dateRange: { type: general }
 *                 careers: { type: general }
 *                 graduationRateDenominator: ingreso
 *                 includeOtherValue: false
 *             tableByGenerations:
 *               summary: Tabla por generaciones (rango específico)
 *               value:
 *                 reportType: por-generaciones
 *                 dateRange: { type: specific, startYear: 2018, endYear: 2022 }
 *                 careers: { type: general }
 *                 graduationRateDenominator: ingreso
 *                 includeOtherValue: true
 *             tableByCareers:
 *               summary: Tabla por carreras
 *               value:
 *                 reportType: por-carreras
 *                 dateRange: { type: specific, startYear: 2020, endYear: 2023 }
 *                 careers: { type: general }
 *                 graduationRateDenominator: egreso
 *                 includeOtherValue: false
 *             grouped:
 *               summary: Agrupado por generaciones con carreras específicas
 *               value:
 *                 reportType: por-generaciones
 *                 dateRange: { type: specific, startYear: 2019, endYear: 2022 }
 *                 careers: { type: specific, selected: ["career-id-1", "career-id-2"] }
 *                 graduationRateDenominator: ingreso
 *                 includeOtherValue: false
 *     responses:
 *       200:
 *         description: Reporte generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 type:
 *                   type: string
 *                   enum: [por-generaciones, por-carreras]
 *                 tableType:
 *                   type: string
 *                   enum: [summary, table, grouped]
 *                 metadata:
 *                   type: object
 *                 data:
 *                   oneOf:
 *                     - type: object
 *                     - type: array
 *       400:
 *         description: Error de validación o parámetros inválidos
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ReportErrorResponse' }
 *       401: { description: No autenticado }
 *       403:
 *         description: Sin permisos para reportes (rol STAFF)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ReportErrorResponse' }
 */

export {};
