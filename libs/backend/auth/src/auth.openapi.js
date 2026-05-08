/**
 * OpenAPI (Swagger) documentation for the Auth module.
 * Used by swagger-jsdoc to generate the API spec.
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación (login, refresh, me, logout)
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     LoginBody:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *     RefreshBody:
 *       type: object
 *       required: [refreshToken]
 *       properties:
 *         refreshToken:
 *           type: string
 *     LogoutBody:
 *       type: object
 *       properties:
 *         refreshToken:
 *           type: string
 *     AuthUser:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         avatar:
 *           type: string
 *           nullable: true
 *         role:
 *           type: string
 *           enum: [ADMIN, STAFF]
 *         isActive:
 *           type: boolean
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     LoginResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/AuthUser'
 *         token:
 *           type: string
 *         refreshToken:
 *           type: string
 *         expiresIn:
 *           type: integer
 *     RefreshResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *         refreshToken:
 *           type: string
 *         expiresIn:
 *           type: integer
 *     MeResponse:
 *       type: object
 *       properties:
 *         user:
 *           $ref: '#/components/schemas/AuthUser'
 *     LogoutResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Iniciar sesión
 *     description: Rate limit 5 intentos / 15 min. Devuelve user, token, refreshToken y expiresIn.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginBody' }
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/LoginResponse' }
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string }
 *                 code: { type: string }
 *       403:
 *         description: Cuenta desactivada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string }
 *                 code: { example: ACCOUNT_DISABLED }
 *       429:
 *         description: Demasiados intentos (rate limit)
 */

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Renovar tokens
 *     description: Rate limit 10 intentos / 15 min. Invalida el refresh token usado (rotación).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RefreshBody' }
 *     responses:
 *       200:
 *         description: Tokens renovados
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/RefreshResponse' }
 *       400:
 *         description: refreshToken faltante
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error: { type: string }
 *                 code: { example: MISSING_REFRESH_TOKEN }
 *       401:
 *         description: Refresh token inválido
 *       403:
 *         description: Cuenta desactivada
 *       429:
 *         description: Demasiados intentos (rate limit)
 */

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Usuario actual
 *     description: Requiere Authorization Bearer token.
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Usuario autenticado (con avatar)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MeResponse' }
 *       401:
 *         description: No autenticado
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Cerrar sesión
 *     description: No requiere token válido. Opcional refreshToken en body para invalidarlo.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LogoutBody' }
 *     responses:
 *       200:
 *         description: Logout exitoso
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/LogoutResponse' }
 */

/* eslint-disable-next-line no-unused-expressions */
0;
