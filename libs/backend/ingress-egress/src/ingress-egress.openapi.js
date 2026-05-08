/**
 * @swagger
 * tags:
 *   name: IngressEgress
 *   description: Ingreso y Egreso por generación y carrera (requiere autenticación)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     IngressEgress:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Clave compuesta generationId-careerId
 *         generationId:
 *           type: string
 *         careerId:
 *           type: string
 *         generationName:
 *           type: string
 *           nullable: true
 *         careerName:
 *           type: string
 *         admissionNumber:
 *           type: integer
 *           description: Suma de maleCount + femaleCount de los registros de nuevo ingreso activos
 *         egressNumber:
 *           type: integer
 *           description: Número de estudiantes egresados (isEgressed = true)
 *     IngressEgressPagination:
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
 *         pagingCounter:
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
 *     IngressEgressList:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/IngressEgress'
 *         pagination:
 *           $ref: '#/components/schemas/IngressEgressPagination'
 */

/**
 * @swagger
 * /ingress-egress:
 *   get:
 *     tags: [IngressEgress]
 *     summary: Lista paginada de ingreso y egreso
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página (mínimo 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Registros por página (sin límite máximo para exportación)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda por nombre de carrera o generación
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Alias de search
 *       - in: query
 *         name: careerId
 *         schema:
 *           type: string
 *         description: Filtrar por ID de carrera
 *       - in: query
 *         name: generationId
 *         schema:
 *           type: string
 *         description: Filtrar por ID de generación
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [careerName, generationName, admissionNumber, egressNumber]
 *           default: careerName
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *       - in: query
 *         name: includeInactiveAdmissions
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir registros de nuevo ingreso inactivos en el conteo
 *     responses:
 *       200:
 *         description: Lista obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IngressEgressList'
 *       400:
 *         description: Error de validación (VALIDATION_ERROR)
 *       401:
 *         description: No autenticado
 */

/**
 * @swagger
 * /ingress-egress/{generationId}/{careerId}:
 *   get:
 *     tags: [IngressEgress]
 *     summary: Detalle de ingreso y egreso por generación y carrera
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: generationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la generación
 *       - in: path
 *         name: careerId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la carrera
 *     responses:
 *       200:
 *         description: Detalle obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/IngressEgress'
 *       401:
 *         description: No autenticado
 *       404:
 *         description: GENERATION_NOT_FOUND o CAREER_NOT_FOUND
 */
