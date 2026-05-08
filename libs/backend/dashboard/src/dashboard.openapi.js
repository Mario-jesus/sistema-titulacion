/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Estadísticas del dashboard (requiere autenticación)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     DashboardStats:
 *       type: object
 *       properties:
 *         totalStudents:
 *           type: integer
 *         activeStudents:
 *           type: integer
 *         inProgress:
 *           type: integer
 *         scheduled:
 *           type: integer
 *         graduatedStudents:
 *           type: integer
 *         egressedStudents:
 *           type: integer
 *         totalAdmissions:
 *           type: integer
 *         totalEgresses:
 *           type: integer
 *         egressRate:
 *           type: number
 *           description: Tasa de egreso en escala 0-100 con 2 decimales
 *         graduationRate:
 *           type: number
 *           description: Tasa de titulación en escala 0-100 con 2 decimales
 *     DashboardIngressEgressByGeneration:
 *       type: object
 *       properties:
 *         generation:
 *           type: string
 *           description: Etiqueta en formato "startYear-endYear"
 *         generationId:
 *           type: string
 *         admissions:
 *           type: integer
 *         egresses:
 *           type: integer
 *     DashboardStatusDistribution:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: "Uno de: Ingreso, Egreso, Titulados"
 *         value:
 *           type: integer
 *     DashboardStudentsByCareer:
 *       type: object
 *       properties:
 *         career:
 *           type: string
 *         careerId:
 *           type: string
 *         students:
 *           type: integer
 *     DashboardRecentStudent:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         fullName:
 *           type: string
 *         career:
 *           type: string
 *         careerId:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     DashboardResponse:
 *       type: object
 *       properties:
 *         stats:
 *           $ref: '#/components/schemas/DashboardStats'
 *         ingressEgressByGeneration:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DashboardIngressEgressByGeneration'
 *         statusDistribution:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DashboardStatusDistribution'
 *         studentsByCareer:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DashboardStudentsByCareer'
 *         recentStudents:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DashboardRecentStudent'
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     tags: [Dashboard]
 *     summary: Estadísticas generales del dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardResponse'
 *       401:
 *         description: No autenticado
 */
