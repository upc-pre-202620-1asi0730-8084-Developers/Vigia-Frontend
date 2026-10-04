# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-09-17

### Added
- **IAM Bounded Context:**
  - Domain layer: `User` entity, `SignInCommand`, and `SignUpCommand`.
  - Application layer: `useIamStore` Pinia store for authentication session management, sign-in, and sign-up workflows.
  - Infrastructure layer: `IamApi` client, `SignInResource`, `SignUpResource`, `UserAssembler`, `SignInAssembler`, `SignUpAssembler`, `iamInterceptor`, and `authenticationGuard`.
  - Presentation layer: `AuthenticationSection`, `SignInForm`, `SignUpForm` views, and route declarations.
- **Documentation:**
  - Architecture Decision Records (`docs/adrs.md`) covering architectural decisions ADR-001 through ADR-008.
  - Requirement Traceability Matrix (RTM) and IAM user stories (`US-013` to `US-016`) in `docs/user-stories.md`.
  - Complete IAM context modeling in `docs/class-diagram.puml`.
  - Reference to ADRs in `README.md`.
- **Configuration & Types:**
  - TypeScript environment variable type definitions in `vite-env.d.ts`.
  - Environment variables for IAM endpoint paths (`VITE_SIGNIN_ENDPOINT_PATH`, `VITE_SIGNUP_ENDPOINT_PATH`, `VITE_USERS_ENDPOINT_PATH`) and Prime UI license key in `.env.development` and `.env.production`.
  - PrimeVue `Tooltip` directive integration in `src/main.js`.

### Changed
- Upgraded core dependencies to latest modern versions (Vue 3.5, PrimeVue 5, Pinia 4, PrimeIcons 8, PrimeFlex 4, Vite 8).
- Refactored `layout.vue`, `home.vue`, `about.vue`, `page-not-found.vue`, and `footer-content.vue` for improved styling and responsive layout.
- Improved `authenticationGuard` navigation logic and store reactivity.
- Standardized JSDoc annotations across domain entities, stores, and infrastructure classes.

## [1.0.0] - 2026-09-01

### Added
- **Domain-Driven Design (DDD) Architecture:**
  - Layered directory structure separating Domain, Application, Infrastructure, and Presentation concerns.
- **Publishing Bounded Context:**
  - Domain models: `Category` and `Tutorial` entities.
  - Application store: `usePublishingStore` for category and tutorial state management and CRUD operations.
  - Infrastructure: `PublishingApi` gateway and `CategoryAssembler`, `TutorialAssembler` for API resource transformation.
  - Presentation: `CategoryList`, `CategoryForm`, `TutorialList`, `TutorialForm` components and view routing.
- **Shared Bounded Context:**
  - Reusable HTTP client `BaseApi` and CRUD abstraction `BaseEndpoint` using Axios.
  - Application layout with header toolbar, drawer navigation, and footer content.
  - Shared views for `Home`, `About`, and `PageNotFound` (404).
- **Internationalization (i18n):**
  - Integrated `vue-i18n` with English (`en`) and Spanish (`es`) translation catalogs.
  - Reusable `LanguageSwitcher` component for dynamic locale switching.
- **UI Framework & Styling:**
  - Integrated PrimeVue with Aura preset theme, PrimeFlex grid system, and PrimeIcons.
  - Toast and Confirmation dialog service plugins.
- **Routing & State Management:**
  - Vue Router single-page navigation with lazy-loaded route components.
  - Pinia store root initialization.
- **Mock Server & Infrastructure:**
  - `json-server` local mock backend setup with mock database (`server/db.json`) and route rewrite rules (`server/routes.json`).
  - Environment configuration for development and production environments.
  - Firebase hosting deployment configuration (`firebase.json`).
- **Initial Documentation & Licensing:**
  - `README.md` with setup guides, architecture overview, and running instructions.
  - `docs/user-stories.md` detailing user stories for category and tutorial management (`US-001` through `US-012`).
  - `docs/class-diagram.puml` modeling Publishing and Shared contexts.
  - `LICENSE.md` (MIT License).
