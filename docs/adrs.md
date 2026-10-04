# Architecture Decision Records (ADRs)

## Overview
This document records key architectural decisions made for the ACME Learning Center frontend application. Each record follows standard Architecture Decision Record (ADR) practices (incorporating Michael Nygard and MADR conventions) to provide context, rationale, and consequences for architectural choices.

---

## Table of Contents
- [ADR-001: Adoption of Domain-Driven Design (DDD) Layered Architecture with Bounded Contexts](#adr-001-adoption-of-domain-driven-design-ddd-layered-architecture-with-bounded-contexts)
- [ADR-002: Core Frontend Framework Selection: Vue 3 with Composition API and Vite](#adr-002-core-frontend-framework-selection-vue-3-with-composition-api-and-vite)
- [ADR-003: State Management with Pinia for Application Store Orchestration](#adr-003-state-management-with-pinia-for-application-store-orchestration)
- [ADR-004: UI Component Framework Selection: PrimeVue with PrimeFlex and PrimeIcons](#adr-004-ui-component-framework-selection-primevue-with-primeflex-and-primeicons)
- [ADR-005: API Gateway and Data Transformation via Assembler Pattern](#adr-005-api-gateway-and-data-transformation-via-assembler-pattern)
- [ADR-006: Centralized HTTP Client, Interceptors, and Endpoint Abstraction](#adr-006-centralized-http-client-interceptors-and-endpoint-abstraction)
- [ADR-007: Route Protection and Navigation Control via Vue Router Guards](#adr-007-route-protection-and-navigation-control-via-vue-router-guards)
- [ADR-008: Internationalization and Localization Architecture with Vue I18n](#adr-008-internationalization-and-localization-architecture-with-vue-i18n)

---

## ADR-001: Adoption of Domain-Driven Design (DDD) Layered Architecture with Bounded Contexts

### Status
Accepted

### Context
The application needs to support multiple business-bounded-contexts (such as Content/Publishing and Identity & Access Management – IAM) while remaining scalable, maintainable, and understandable as complexity increases. A traditional flat component or type-based directory structure (`/components`, `/views`, `/services`) often leads to tight coupling, leaky business logic in UI views, and difficulty in isolating feature changes.

### Decision
Structure the codebase around explicit **Bounded Contexts** (`publishing`, `iam`, `shared`) and enforce four distinct architectural layers within each context:
1. **Domain Layer**: Plain JavaScript classes for entities (`Category`, `Tutorial`, `User`) and commands (`SignInCommand`, `SignUpCommand`). Framework-agnostic with no UI or HTTP dependencies.
2. **Application Layer**: State orchestration and use-case coordination using Pinia stores (`PublishingStore`, `IamStore`).
3. **Infrastructure Layer**: API gateways (`PublishingApi`, `IamApi`), assemblers (`CategoryAssembler`, `UserAssembler`), guards (`authenticationGuard`), and interceptors (`iamInterceptor`).
4. **Presentation Layer**: Views, components, and route modules (`CategoryList`, `SignInForm`, `AuthenticationSection`).

### Consequences
- **Positive:**
  - High cohesion within bounded contexts and low coupling between contexts.
  - Clear separation of concerns making features testable and maintainable.
  - Reusable infrastructure and presentation elements centralized in `shared`.
- **Negative:**
  - Additional boilerplate code (assemblers, commands, entity classes) compared to direct API-to-template bindings.
  - Requires developers to understand DDD concepts and maintain layer boundaries.

---

## ADR-002: Core Frontend Framework Selection: Vue 3 with Composition API and Vite

### Status
Accepted

### Context
We required a modern, reactive web framework that offers high developer velocity, fast build tooling, excellent TypeScript/JavaScript tooling support, and lightweight bundle sizes for building single-page applications.

### Decision
Use **Vue 3** (Single-File Components with Composition API `<script setup>`) built and bundled with **Vite**.

### Consequences
- **Positive:**
  - Fast Hot Module Replacement (HMR) and rapid build times via Vite ES modules.
  - Composition API enables composable logic and clean integration with Pinia stores.
  - Flexible reactivity system compatible with standard JavaScript classes and reactive refs.
- **Negative:**
  - Requires maintaining the build pipeline and plugin configurations in `vite.config.js`.

---

## ADR-003: State Management with Pinia for Application Store Orchestration

### Status
Accepted

### Context
The application requires a state management solution that coordinates asynchronous data fetching, manages reactive domain state across views, handles error tracking, and integrates seamlessly with Vue 3.

### Decision
Adopt **Pinia** (`defineStore`) as the official state management library. Each bounded context provides a dedicated store (e.g., `usePublishingStore`, `useIamStore`) that acts as the application layer orchestrator between UI components and infrastructure APIs.

### Consequences
- **Positive:**
  - Native Vue 3 Composition API compatibility and full reactivity without mutations.
  - Context isolation: each bounded context manages its own store without monolithic global state pollution.
  - Clean error and loading state tracking per context.
- **Negative:**
  - Store actions must be called in UI components, requiring disciplined separation between UI state and application state.

---

## ADR-004: UI Component Framework Selection: PrimeVue with PrimeFlex and PrimeIcons

### Status
Accepted

### Context
To deliver a responsive, accessible, and polished user interface with minimal development overhead, the project requires a comprehensive UI component library providing data tables, forms, buttons, dialogs, responsive layout grids, and icons.

### Decision
Adopt **PrimeVue** (v4) with **PrimeFlex** utility classes and **PrimeIcons** for UI presentation. Configure `Aura` as the design preset in unstyled/themed mode with toast and confirmation services enabled.

### Consequences
- **Positive:**
  - Rich collection of accessible UI components (`pv-data-table`, `pv-button`, `pv-input-text`, `pv-card`, `pv-toast`, `pv-dialog`).
  - Standardized utility styling via PrimeFlex grid classes (`flex`, `grid`, `col-12`, `p-fluid`).
  - Built-in notification and dialog management across presentation components.
- **Negative:**
  - Vendor lock-in to PrimeVue's component API and DOM structure.
  - Theme customization requires conforming to the PrimeVue design token system.

---

## ADR-005: API Gateway and Data Transformation via Assembler Pattern

### Status
Accepted

### Context
Backend API payloads and external contracts often differ from internal frontend domain entities or change independently over time. Binding HTTP response payloads directly to UI components creates tight coupling and makes the frontend fragile to API schema changes.

### Decision
Implement the **Assembler Pattern** in the Infrastructure layer (`CategoryAssembler`, `TutorialAssembler`, `UserAssembler`, `SignInAssembler`, `SignUpAssembler`). Assemblers convert raw HTTP response resources/DTOs into strongly typed domain entities and vice versa.

### Consequences
- **Positive:**
  - Decouples domain and presentation layers from backend API schema changes (Anti-Corruption Layer).
  - Centralizes mapping and validation logic in dedicated, testable static assembler classes.
  - Clean the transformation between command inputs, transfer resources, and domain models.
- **Negative:**
  - Requires explicit mapping methods (`toEntityFromResource`, `toEntitiesFromResponse`, `toResourceFromResponse`) for every entity and endpoint.

---

## ADR-006: Centralized HTTP Client, Interceptors, and Endpoint Abstraction

### Status
Accepted

### Context
Making raw `fetch` or `axios` calls directly from stores or views leads to duplicated base URL configurations, fragmented error handling, inconsistent header injection (e.g., Bearer authentication tokens), and duplicated CRUD operations.

### Decision
1. Implement a centralized `BaseApi` extending Axios with global configuration and request interceptors.
2. Provide a reusable `BaseEndpoint` class encapsulating standard RESTful CRUD operations (`getAll`, `getById`, `create`, `update`, `delete`).
3. Inject the `iamInterceptor` into the Axios instance to automatically attach the `Authorization: Bearer <token>` header from `IamStore` to outgoing requests when an active session token exists.

### Consequences
- **Positive:**
  - Consistent HTTP configuration across all bounded context APIs (`PublishingApi`, `IamApi`).
  - Automatic authorization header injection without manual intervention per request.
  - Elimination of boilerplate CRUD endpoint implementations.
- **Negative:**
  - Subclasses are tied to RESTful endpoint conventions provided by `BaseEndpoint`.

---

## ADR-007: Route Protection and Navigation Control via Vue Router Guards

### Status
Accepted

### Context
The application contains both public routes (Sign In, Sign Up, About) and restricted routes (Publishing management, Home) that require authenticated user sessions. Unauthenticated access must be prevented, and unauthenticated users must be redirected to sign in.

### Decision
Implement an `authenticationGuard` navigation guard in the IAM infrastructure layer and wire it into the Vue Router (`router.beforeEach`). The guard checks `IamStore.isSignedIn` (and local storage token persistence) against the target route's path and metadata, redirecting unauthenticated requests to `/sign-in` and redirecting authenticated users away from auth pages.

### Consequences
- **Positive:**
  - Centralized security check preventing unauthorized route navigation.
  - Clean UX with automatic redirects to sign-in route and back to intended destinations.
  - Route metadata controls authentication requirements declaratively.
- **Negative:**
  - Client-side navigation guards provide UI security only; backend APIs must independently enforce JWT token validation.

---

## ADR-008: Internationalization and Localization Architecture with Vue I18n

### Status
Accepted

### Context
The application is required to support multiple languages (English and Spanish) across all views, menus, forms, table headers, and error messages, with dynamic runtime language switching.

### Decision
Integrate **Vue I18n** (v9/v10) with localized message bundles (`en.json`, `es.json`) registered in `src/i18n.js`. Encapsulate language switching within a shared `LanguageSwitcher` component embedded in the global layout header and toolbar.

### Consequences
- **Positive:**
  - Seamless multi-language support with reactive `$t()` translation bindings in templates.
  - Centralized translation dictionary files keeping copy out of component templates.
  - The shared language switcher component is accessible on all pages.
- **Negative:**
  - Missing keys can result in fallback keys or untranslated labels if translation catalogs are not maintained in sync.
