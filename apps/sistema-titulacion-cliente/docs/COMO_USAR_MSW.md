# 🚀 Cómo usar MSW (Mock Service Worker)

## Paso 1: Inicializar el Service Worker

Primero necesitas generar el archivo del service worker que MSW usa para interceptar las requests:

```bash
cd apps/sistema-titulacion-cliente
npm run init-msw
```

O desde la raíz del proyecto:

```bash
node apps/sistema-titulacion-cliente/scripts/init-msw.js
```

Esto creará el archivo `public/mockServiceWorker.js` que es necesario para que MSW funcione.

**⚠️ Solo necesitas hacer esto UNA VEZ** (o cuando actualices MSW).

## Paso 2: Activar MSW

Crea un archivo `.env` en `apps/sistema-titulacion-cliente/` con:

```env
VITE_ENABLE_MOCK_API=true
```

O si ya tienes un `.env`, agrega esa línea.

## Paso 3: Iniciar el servidor de desarrollo

```bash
nx serve sistema-titulacion-cliente
```

O desde la raíz:

```bash
nx serve sistema-titulacion-cliente
```

## Paso 4: Verificar que MSW está activo

Abre la consola del navegador (F12) y deberías ver:

```
✅ MSW habilitado - API Mock activo
```

También verás un ícono de MSW en la esquina inferior derecha del navegador cuando está activo.

## 🔑 Credenciales de Prueba

Ahora puedes usar estas credenciales para hacer login:

### Usuario Administrador

- **Email:** `admin@example.com`
- **Password:** `password123`
- **Rol:** ADMIN

### Usuario Staff

- **Email:** `staff@example.com`
- **Password:** `password123`
- **Rol:** STAFF

## 🧪 Probar el Mock

1. Abre la aplicación en `http://localhost:4200`
2. Intenta hacer login con las credenciales de arriba
3. Deberías poder iniciar sesión exitosamente
4. El dashboard debería mostrar tu información de usuario

## 🔄 Desactivar MSW

Para desactivar MSW y usar el backend real:

1. Cambia en `.env`:

   ```env
   VITE_ENABLE_MOCK_API=false
   ```

2. O elimina la variable completamente

3. Reinicia el servidor de desarrollo

## 📝 Endpoints Mockeados

Los siguientes endpoints están mockeados:

- ✅ `POST /api/v1/auth/login` - Iniciar sesión
- ✅ `POST /api/v1/auth/logout` - Cerrar sesión
- ✅ `GET /api/v1/auth/me` - Obtener usuario actual
- ✅ `POST /api/v1/auth/refresh` - Refrescar token

## 🛠️ Agregar más endpoints

Para agregar más endpoints mock, edita:

`apps/sistema-titulacion-cliente/src/mocks/handlers.ts`

Ejemplo:

```typescript
export const handlers = [
  // ... handlers existentes

  http.get(buildApiUrl('/users'), () => {
    return HttpResponse.json([
      { id: 1, name: 'Usuario 1' },
      { id: 2, name: 'Usuario 2' },
    ]);
  }),
];
```

## ❓ Troubleshooting

### El service worker no se carga

- Verifica que `public/mockServiceWorker.js` existe
- Ejecuta `npm run init-msw` nuevamente
- Limpia el cache del navegador (Ctrl+Shift+R)

### MSW no intercepta las requests

- Verifica que `VITE_ENABLE_MOCK_API=true` en tu `.env`
- Verifica la consola del navegador para errores
- Asegúrate de estar en modo desarrollo

### Errores de CORS

- MSW intercepta las requests antes de que lleguen al servidor, así que no debería haber problemas de CORS
- Si los hay, verifica que MSW esté correctamente inicializado
