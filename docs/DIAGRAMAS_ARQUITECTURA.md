# Diagramas Mermaid — Arquitectura Frontend (Nx + FSD)

Este documento consolida los diagramas Mermaid y árboles de carpetas solicitados para el frontend del monorepo **Nx**.

**Fuentes principales (repo):**

- `docs/ARQUITECTURA_FRONTEND.md`
- `docs/API_DOCUMENTATION.md`
- `apps/sistema-titulacion-cliente/src/main.tsx` (bootstrap + MSW)
- `apps/sistema-titulacion-cliente/src/app/providers/redux/store.ts` (Redux store + middleware)
- `libs/frontend/shared/src/api/apiClient.ts` (API client + Authorization header)
- `apps/sistema-titulacion-cliente/src/mocks/handlers/auth.handlers.ts` (login/refresh/me/logout en MSW)
- `libs/frontend/features/src/auth/*` (hook + thunks + slices + service)

---

## 1) Arquitectura general: `sistema-titulacion-cliente` + librerías en Nx

```mermaid
flowchart TB
  subgraph APP["apps/sistema-titulacion-cliente"]
    app_main["main.tsx"]
    app_theme["initializeTheme()"]
    app_msw["enableMocking() / MSW worker.start()"]
    app_root["App (Providers)"]
    app_store["Redux Store (configureStore)"]
    app_router["AppRouter (react-router-dom)"]

    app_main --> app_theme
    app_main --> app_msw
    app_main --> app_root
    app_root --> app_store
    app_root --> app_router
  end

  subgraph LIBS["libs/frontend (FSD)"]
    direction TB
    lib_pages["pages"]
    lib_features["features"]
    lib_widgets["widgets"]
    lib_entities["entities"]
    lib_shared["shared"]
  end

  app_router --> lib_pages
  lib_pages --> lib_features
  lib_features --> lib_widgets
  lib_features --> lib_entities
  lib_features --> lib_shared
  lib_widgets --> lib_entities
  lib_widgets --> lib_shared
  lib_entities --> lib_shared
```

---

## 2) Estructuras de carpetas de las capas (simplificadas)

### shared

```text
libs/frontend/shared/src/
├── index.ts
├── api/
├── config/
├── lib/
└── ui/
```

### entities

```text
libs/frontend/entities/src/
├── index.ts
├── user/
├── career/
├── student/
├── generation/
├── modality/
├── graduation-option/
├── new-admission/
├── graduation/
├── ingress-egress/
├── captured-fields/
└── ...
```

### widgets

```text
libs/frontend/widgets/src/
├── index.ts
├── Header/
├── PageHeader/
└── Sidebar/
```

### features

```text
libs/frontend/features/src/
├── index.ts
├── auth/
├── students/
├── careers/
├── users/
├── generations/
├── modalities/
├── graduation-options/
├── new-admissions/
├── graduations/
├── captured-fields/
├── ingress-egress/
├── dashboard/
├── backups/
├── reports/
└── ...
```

### pages

```text
libs/frontend/pages/src/
├── index.ts
├── LoginPage/
├── DashboardPage/
├── StudentsPage/
├── CareersPage/
├── UsersPage/
├── GenerationsPage/
├── ModalitiesPage/
├── GraduationOptionsPage/
├── NewAdmissionsPage/
├── ReportsPage/
├── BackupsPage/
├── ComingSoonPage/
└── ...
```

### Estructura detallada (ejemplo: feature `students`)

Único módulo con subdirectorios expandidos para referencia.

```text
libs/frontend/features/src/students/
├── index.ts
├── api/
│   ├── index.ts
│   ├── studentsService.ts
│   ├── careersHelper.ts
│   └── generationsHelper.ts
├── model/
│   ├── index.ts
│   ├── studentsSlice.ts
│   ├── studentsThunks.ts
│   └── types.ts
├── lib/
│   ├── index.ts
│   └── useStudents.ts
└── ui/
    ├── index.ts
    ├── StudentsList/
    ├── StudentForm/
    ├── StudentsInProgressList/
    ├── StudentsScheduledList/
    └── StudentsGraduatedList/
```

---

## 3) Grafo de dependencias acíclico (Nx) entre `shared`, `entities`, `widgets`, `features` y `pages`

```mermaid
flowchart LR
  shared["@sistema-titulacion/shared"]
  entities["@sistema-titulacion/entities"]
  widgets["@sistema-titulacion/widgets"]
  features["@sistema-titulacion/features"]
  pages["@sistema-titulacion/pages"]

  widgets --> shared
  widgets --> entities

  features --> shared
  features --> entities
  features --> widgets

  pages --> features
```

---

## 4) Diagrama de secuencia del flujo de datos: UI → Hook → Thunk → API Client → MSW Interceptor

```mermaid
sequenceDiagram
  participant UI as UI Component
  participant Hook as useFeature() hook
  participant Thunk as createAsyncThunk
  participant Service as Feature service (api/)
  participant Client as @shared/apiClient
  participant Fetch as fetch()
  participant SW as Service Worker (MSW)
  participant Handler as MSW handler
  participant Data as Mock data
  participant API as Real Backend API

  UI->>Hook: user action (load/submit)
  Hook->>Thunk: dispatch(thunk(params))
  Thunk->>Service: call service function
  Service->>Client: client.get/post(endpoint)
  Client->>Fetch: fetch(fullUrl + headers)

  alt MSW enabled (dev + mock)
    Fetch->>SW: intercepted request
    SW->>Handler: match method + URL
    Handler->>Data: read/mutate mock data
    Data-->>Handler: payload
    Handler-->>SW: HttpResponse.json(payload)
    SW-->>Fetch: mocked Response
  else MSW disabled
    Fetch->>API: network request
    API-->>Fetch: Response (JSON)
  end

  Fetch-->>Client: Response
  Client-->>Service: parsed JSON / error
  Service-->>Thunk: return data
  Thunk-->>UI: fulfilled/rejected → UI updates via selectors
```

---

## 5) Diagrama del árbol de estado global (Redux Store) mostrando la jerarquía de slices

```mermaid
flowchart TB
  Root["RootState (Redux Store)"]

  Root --> user["user"]
  Root --> login["login"]
  Root --> auth["auth"]
  Root --> users["users"]
  Root --> generations["generations"]
  Root --> graduationOptions["graduationOptions"]
  Root --> careers["careers"]
  Root --> modalities["modalities"]
  Root --> newAdmissions["newAdmissions"]
  Root --> ingressEgress["ingressEgress"]
  Root --> students["students"]
  Root --> capturedFields["capturedFields"]
  Root --> graduations["graduations"]
  Root --> backups["backups"]
  Root --> reports["reports"]

  user --> user_currentUser["currentUser"]
  user --> user_isAuthenticated["isAuthenticated"]

  auth --> auth_isLoading["isLoading"]
  auth --> auth_isCheckingAuth["isCheckingAuth"]
  auth --> auth_error["error"]

  login --> login_email["email"]
  login --> login_password["password"]
  login --> login_isLoading["isLoading"]
  login --> login_submitError["submitError"]
  login --> login_fieldErrors["fieldErrors"]
```

---

## 6) Diagrama de secuencia: UI → Disparador (Dispatch) → Thunk → API → Reducer → Actualización de UI

```mermaid
sequenceDiagram
  participant UI as UI Component
  participant Store as Redux Store
  participant Thunk as createAsyncThunk
  participant Service as Feature service
  participant Client as @shared/apiClient
  participant Reducer as Slice reducer (extraReducers)

  UI->>Store: dispatch(thunk(params))
  Store->>Thunk: execute thunk
  Thunk->>Store: dispatch(pending)
  Store->>Reducer: reduce(pending)
  Reducer-->>Store: state.isLoading=true
  Store-->>UI: selectors emit → render loading

  Thunk->>Service: call service
  Service->>Client: client.get/post(...)
  Client-->>Service: data OR throws error

  alt success
    Service-->>Thunk: payload
    Thunk->>Store: dispatch(fulfilled(payload))
    Store->>Reducer: reduce(fulfilled)
    Reducer-->>Store: state updated with payload
    Store-->>UI: selectors emit → re-render
  else error
    Service-->>Thunk: rejectWithValue(message)
    Thunk->>Store: dispatch(rejected(message))
    Store->>Reducer: reduce(rejected)
    Reducer-->>Store: state.error=message, state.isLoading=false
    Store-->>UI: selectors emit → render error
  end
```

---

## 7) Diagrama de flujo de intercepción de red: App → Service Worker → MSW Handlers → Mock Data

```mermaid
flowchart TB
  App["App (Browser)"] --> Client["@shared/apiClient"] --> Fetch["fetch()"]

  Fetch --> Enabled{"MSW enabled?<br/>(env.enableMockApi && env.appEnv == 'development')"}

  Enabled -- "Yes" --> SW["Service Worker<br/>(mockServiceWorker.js)"]
  SW --> MSW["MSW (setupWorker)"]
  MSW --> Handlers["mocks/handlers/*.handlers.ts"]
  Handlers --> Data["mocks/data/*.ts"]
  Data --> Handlers --> MSW --> SW --> Fetch

  Enabled -- "No" --> API["Real Backend API"] --> Fetch

  Fetch --> Client --> App
```

---

## 8) Diagrama de flujo del proceso de Login y validación de JWT

> Nota: en **dev** con MSW, el “JWT” es un token mock (`mock-token-*`). En **prod**, el backend emitiría JWT real; el cliente solo asume `Bearer <token>` y consume `/auth/me`.

```mermaid
flowchart TB
  subgraph Login["Login (POST /auth/login)"]
    L1["Email + Password"] --> L2["dispatch(loginThunk)"]
    L2 --> L3["authService.login()"]
    L3 --> L4["@shared/apiClient.post(/auth/login)"]
  end

  L4 --> Env{"MSW enabled?"}

  Env -- "Yes (dev)" --> MSWLogin["MSW auth.handlers.ts<br/>- rate limit<br/>- validate credentials<br/>- isActive<br/>- rotate refresh token<br/>- issue mock token"]
  Env -- "No (prod)" --> APILogin["Backend /auth/login<br/>- validate credentials<br/>- issue JWT + refresh token"]

  MSWLogin --> Resp["{ user, token, refreshToken, expiresIn }"]
  APILogin --> Resp

  Resp --> LS["localStorage: token + refreshToken"]
  LS --> Fulfilled["loginThunk.fulfilled (returns User)"]
  Fulfilled --> SyncUser["store middleware: dispatch(setUser(user))"]
  SyncUser --> UserState["user slice: currentUser + isAuthenticated=true"]

  subgraph Validate["Validación de sesión (GET /auth/me)"]
    V1["AuthProvider mount"] --> V2["dispatch(checkAuthThunk)"]
    V2 --> HasToken{"token exists?"}
    HasToken -- "Yes" --> V3["@shared/apiClient.get(/auth/me)<br/>Authorization: Bearer &lt;token&gt;"]
    HasToken -- "No" --> ClearUser["middleware: clearUser()"]

    V3 --> Valid{"token valid?"}
    Valid -- "Yes" --> VOk["200 { user }"] --> SyncUser2["middleware: setUser(user)"]
    Valid -- "No" --> VErr["401 UNAUTHORIZED"] --> ClearTokens["remove token/refreshToken"] --> ClearUser
  end

  %% Optional (available, not automatic)
  ClearTokens -. "Optional manual flow" .-> Refresh["dispatch(refreshTokenThunk)<br/>POST /auth/refresh<br/>(update tokens)"]
```
