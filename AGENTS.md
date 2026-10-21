<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Project structure

The project uses the Next.js **Pages Router** (not the App Router) with the `src/` directory. Next.js requires `pages` and `app` to live in the same folder, so both are inside `src/` and the project root has no `pages` folder.

- `src/app/` — all the project code (the `@/*` alias points here, so `@/api/intercept` is `src/app/api/intercept.ts`). Inside it:
  - `pages/` — the real page files. The file path is the route: `src/app/pages/product/all-products.tsx` is served at `/product/all-products`. `pages/_app.tsx` mounts the global providers (theme, i18n, TanStack Query) and `pages/_document.tsx` holds the HTML shell.
  - `component/` — shared components (`ui/` for shadcn/ui, `base/` for our own Base components); page-specific components do not belong here
  - `features/` — page-specific components, grouped in one folder per page
  - other folders: `api`, `composable`, `constants`, `layouts`, `lib`, `locales`, `middleware`, `plugins`, `rest`, `store`, `types`, `utils`, `validate`
- `src/pages/` — only one-line re-export files required by Next.js, which discovers routes only in `src/pages`. Each one mirrors a file in `src/app/pages/`, for example `src/pages/product/all-products.tsx` contains `export { default } from "@/pages/product/all-products";`. When you add, rename or delete a page in `src/app/pages/`, do the same for its re-export file in `src/pages/`. Never put real code there (the only exception is `import "@/globals.css"` in `src/pages/_app.tsx`, because Next.js allows global CSS only in the Custom App file).
- `public/` — static assets.

Never create files in the project root folders other than `src/` and `public/`, and never create a `pages` folder in the project root. Do not add `page.tsx`, `layout.tsx` or `route.ts` files inside `src/app/`, otherwise Next.js starts treating it as an App Router directory.

## Features

- `src/app/features/` holds the components of pages. Each page gets its own folder named after the page, and the page's components live inside it.
- Page-specific components are never written in `src/app/component/`; pages import them from `src/app/features/<page>/`.
- Example: the product page has a `createOrUpdate` component, so it is created as `src/app/features/product/CreateOrUpdate.tsx` and imported by the product page from there.
- A component that is reused across several pages is not a feature component: it becomes a `Base<Name>` component in `src/app/component/base/`.

## Routing and navigation

- Use `useRouter` from `next/router` (`router.pathname`, `router.asPath`, `router.push`, `router.replace`). Do not import from `next/navigation`, `next/headers` or `next-intl/server`; they belong to the App Router.
- Global CSS (`src/app/globals.css`) is imported only in `src/pages/_app.tsx`.
- Page files in `src/app/pages/` stay thin: they render a feature component from `src/app/features/<page>/` and set `getLayout`.
- There are no Server Actions or Server Components. Data comes from the backend through `src/app/rest/`.

## Layouts

- `src/app/layouts/` holds the layout components of the app, for example `AuthLayout` and `DefaultLayout`.
- Every layout is its own file named `<Name>Layout.tsx`: `src/app/layouts/AuthLayout.tsx`, `src/app/layouts/DefaultLayout.tsx`.
- A layout only provides the shared frame (header, sidebar, wrapper, etc.) and renders `children`. Page content and page-specific logic do not belong in it.
- Pages choose the layout they need with `getLayout`, so each page can use a different layout (for example, auth pages use `AuthLayout`, the rest use `DefaultLayout`).
- Parts of a layout (header, footer, etc.) live in `src/app/layouts/<name>/` next to it, for example `src/app/layouts/default/DefaultHeader.tsx` and `DefaultFooter.tsx`.
- `DefaultLayout` fills exactly the screen height (`h-dvh`): the header and footer stay fixed at the top and bottom, and the `main` area never scrolls the page. Anything that needs to scroll inside the content area scrolls in its own `overflow-auto` container, so give content `min-h-0` and `flex-1`.
- The main menu is dynamic: modules (header tabs, each linking to its first page) and their pages (a sub-navigation bar shown under the header by `DefaultSubNav` when the active module has more than one page) come from `GET /auth/me`, are normalized in `src/app/utils/menu.ts` and rendered by `src/app/layouts/default/DefaultNav.tsx`. Names come localized as `{ uz, ru, uz_cryl }`; icons are SVG files served from `/files/serve/<icon.id>` and rendered with `BaseIconMask`. Never hardcode menu items.
- Layouts are applied per page with the Pages Router `getLayout` pattern: a page assigns `Page.getLayout = getDefaultLayout` (or `getAuthLayout`), exported next to the layout in `src/app/layouts/`. `src/app/pages/_app.tsx` calls `Component.getLayout`. This keeps the layout mounted between navigations, so the header and menu state are preserved. Use the `NextPageWithLayout` type from `src/app/types/page.types.ts`.

## Base components

- `src/app/component/ui/` holds raw shadcn/ui components. Add them with `npx shadcn@latest add <name>`; do not hand-edit them for app-specific behavior.
- `src/app/component/base/` holds our own reusable components built on top of shadcn/ui.
- Inside `base/`, group by topic in a folder (for example `input/`, `button/`, `select/`). Every component in the folder is named with the `Base` prefix: `base/input/BaseInputDate.tsx`, `base/input/BaseInputSomething.tsx`.
- Whenever a task asks for a reusable or shared component, create it as a `Base<Name>` component in the matching topic folder and use that component in pages and features instead of using shadcn/ui directly.
- Base components work only through props and emits. Data and configuration come in via props; every outgoing event is an emit, which in React is a callback prop named `on<Event>` (for example `onChange`, `onSelect`, `onClear`).
- Base components stay presentational and controlled: they do not fetch data, read the store, or navigate on their own. The parent passes the value in and handles the emitted events.

## Select options

- Every select in the project (`BaseSelect`, pagination limit, currency select inside `BaseInputAddon`, any new one) shows its dropdown options the same way. The look lives in `SelectItem` of `src/app/component/ui/select.tsx`, so never restyle options per select.
- The dropdown as a whole has one visible border (`border-border`). Individual options have no visible border, only the surrounding dropdown does.
- The selected option is highlighted with `border-primary`, `bg-primary/10` and `text-primary`, the same look as an active filter select. There is no check icon.
- A select with no selected value (for example an empty warehouse or shelf) still shows the dropdown with its border and plain options.

## Tables

- Every table in the project is built from the base table components in `src/app/component/base/table/`. Never write raw `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`, `<colgroup>` or `<col>` in pages or features.
- For a normal list (header row plus one row per item) use `BaseTable`. It gets `columns` (`key`, `header`, `cell(row)`, optional `headerClassName` and `cellClassName`), `rows`, `getRowKey`, and optional `emptyLabel`, `loading` and `minWidthClassName`. It already provides the scroll container, sticky header, borders and the empty state. Column and table prop types are `BaseTableColumn` and `BaseTableProps` in `src/app/types/common.types.ts`.
- For a table that needs custom structure (expandable sub-rows, a `colgroup` with set widths, row animations) use the unstyled parts from `BaseTableParts.tsx`: `BaseTableRoot`, `BaseTableColGroup`, `BaseTableCol`, `BaseTableHead`, `BaseTableBody`, `BaseTableRow`, `BaseTableHeadCell`, `BaseTableCell`. They render the same HTML element and pass every prop through, so all styling stays in the caller's `className`.
- Cell content that is interactive (inline edit, radio, buttons) is returned from the column's `cell` function; the table itself stays presentational and does not fetch data.
- Moving an existing table to the base components must not change how it looks or works.

## Rest and plugins

- Server state is managed with TanStack Query (`@tanstack/react-query`). The query client and provider are configured in `src/app/plugins/tanstack-query.tsx` and mounted once in `src/app/pages/_app.tsx`.
- `src/app/rest/` is the only place that talks to the backend. It has two folders: `service/` and `query/`.
- `src/app/rest/service/` holds the endpoint functions. They use `http` from `src/app/api/intercept.ts` (pass `{ auth: false }` for endpoints that need no token).
- `src/app/rest/query/` holds the TanStack Query hooks (`useQuery`, `useMutation`). Queries never call the backend directly; they always work through a service.
- Both folders are grouped by topic, with one folder per topic and the same topic name on both sides. Example for the product API: `src/app/rest/service/product/product.service.ts` and `src/app/rest/query/product/product.query.ts`.
- Third-party library setup and configuration (query client, providers, etc.) lives in `src/app/plugins/`.

## Composables

- `src/app/composable/` holds reusable stateful logic, written as React custom hooks (this is also the shadcn `hooks` alias).
- One composable per file, named with the `use` prefix: `src/app/composable/useDebounce.ts`, `src/app/composable/useOrders.ts`.
- Composables contain logic only: no JSX and no styling. Components and pages call them; they do not render anything.
- Composables that need backend data use the hooks from `src/app/rest/query/` and never call `fetch` or services directly.
- Logic that is specific to a single feature lives in that feature's folder (`src/app/features/<name>/`); only shared logic goes to `src/app/composable/`.

## Constants

- `src/app/constants/` holds all static data (constant values, option lists, table column definitions, etc.). Do not declare static data inside pages or components.
- Constants are grouped per page: every page that uses static data gets its own folder in `src/app/constants/`, with a file named `<page>.constants.ts` inside it.
- Example: if a file used by the product page (such as `createOrUpdate`) needs static data, put it in `src/app/constants/product/product.constants.ts` and import it from there.
- Static data shared by several pages goes to a folder named after the shared topic (for example `src/app/constants/common/common.constants.ts`).

## Types

- `src/app/types/` holds every `type` and `interface` of the project. Do not declare them inside pages, components, services or queries; import them from `src/app/types/`.
- Types are grouped by topic, like features and constants, but `src/app/types/` has no subfolders: each topic is a single file named `<topic>.types.ts`.
- Example: product types go to `src/app/types/product.types.ts` and are imported as `@/types/product.types`.

## Forms and validation

- Forms use `react-hook-form`. Use the `useZodForm(schema, options)` hook from `src/app/plugins/react-hook-form.ts`: it wires the zod resolver and the default form options (`mode`, `reValidateMode`, `shouldFocusError`) in one place.
- Zod schemas live in `src/app/validate/` and nowhere else. Do not declare schemas inside pages or components.
- Schemas are grouped per topic: `src/app/validate/<topic>/` folder, with one file per form named `<formName>.zod.ts`.
- Example: the create or update form of the product page has its schema in `src/app/validate/product/createOrUpdate.zod.ts`.
- Form value types are derived from the schema with `z.infer` and exported from the topic's file in `src/app/types/`.

## Localization (i18n)

- The project uses `next-intl` for all text, without locale URL prefixes. The active locale is stored in the `locale` cookie.
- Any static text that is shown to the user (labels, titles, buttons, placeholders, validation messages, empty states, etc.) must come from the translations and is never hardcoded in pages or components.
- Every text must exist in all 3 languages: `uz` (Uzbek, Latin, default), `ru` (Russian) and `uz_cryl` (Uzbek, Cyrillic). Never add a key to only one or two of them. When adding or changing a text, update all 3 files in the same change.
- Translations live in `src/app/locales/uz.json`, `src/app/locales/ru.json` and `src/app/locales/uz_cryl.json`. Keys are grouped by topic at the top level (`common`, `product`, etc.), mirroring the topic names used in `constants`, `types` and `validate`. `uz.json` is the source of truth for key types, so `ru.json` and `uz_cryl.json` must have exactly the same keys.
- Locale list, default locale and cookie name are in `src/app/constants/i18n/i18n.constants.ts`; the `AppLocale` type is in `src/app/types/i18n.types.ts`.
- Setup lives in `src/app/plugins/i18n.tsx` (provider with all 3 message files, mounted in `src/app/pages/_app.tsx`). The locale is read from the `locale` cookie in `MyApp.getInitialProps` (on the server from the request, on the client from `document.cookie`) and passed to the provider.
- Always use `useTranslations("<topic>")` from `next-intl` in components. There are no server components in the Pages Router, so `next-intl/server` is not used.
- To change the language call `setLocale(locale)` from `src/app/lib/locale.ts` (it writes the cookie), then `router.replace(router.asPath)` so `getInitialProps` runs again.
- Static data in `src/app/constants/` should hold translation keys, not final text; translate them where they are rendered.

## Theme

- The app supports light, dark and system modes using `next-themes` (class strategy, `.dark` on `<html>`). The provider is in `src/app/plugins/next-themes.tsx` and is mounted in `src/app/pages/_app.tsx`.
- Colors come only from the shadcn CSS variables in `src/app/globals.css` (`bg-background`, `text-foreground`, `bg-primary`, `border-border`, etc.). Never hardcode colors in pages or components, and never use `dark:` with literal colors.
- The chosen palette is "Monochrome": neutral zinc grays, a near-black primary in light mode and a near-white primary in dark mode, `0.5rem` base radius. To change the look, edit the variables in `src/app/globals.css`.
- Read or change the mode with `useThemeMode()` from `src/app/composable/useThemeMode.ts`; the switcher UI is `BaseThemeToggle` in `src/app/component/base/button/`.

## Responsive design

- Every page, component and detail must be responsive. Nothing is considered done until it works from a phone (about 360px wide) up to a large desktop.
- Build mobile-first with Tailwind: write the base styles for small screens and add `sm:`, `md:`, `lg:`, `xl:` modifiers for larger ones.
- Layouts use flex or grid and wrap or stack on small screens. Avoid fixed pixel widths and heights; use `max-w-*`, `w-full`, `min-w-0` and fluid units instead.
- The page body never scrolls horizontally. Wide content (tables, code) scrolls inside its own `overflow-x-auto` container.
- Keep a side gutter of at least 16px on every screen size.
- Interactive elements must be comfortable to tap on touch screens (about 40px minimum height) and keep a visible focus state.
- Long text, translated strings (`ru` and `uz_cryl` are often longer than `uz`) and large numbers must wrap or truncate cleanly and never break the layout.

## Code style

- Do not write comments in pages and components. Only add a comment where the user explicitly asks for one.
