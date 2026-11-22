# AGENTS.md - Master Architecture & Agentic Guidelines

> Single Source of Truth for all AI coding agents (Claude, Cursor, Copilot, Antigravity) working in this repository.
> All agents must read and strictly obey this unified document.

---

## 1. Project Role & Stack Matrix

### Mission & Operational Mandate
This repository enforces deterministic, production-grade engineering practices. All code modifications must be complete, syntactically valid, and strictly typed. Placeholders and stub implementations are strictly banned.

### Package Manager Exclusivity
- **pnpm exclusively**: Run all commands via `pnpm` (never `npm` or `yarn`).
- CLI tool execution: Use `pnpm dlx <package>` instead of `npx`.
- Maintain `pnpm-lock.yaml` consistency with zero drift.

### Active Stack Matrix
| Layer | Selection | Description |
|---|---|---|
| `framework` | **Next.js App Router** | Enforces App Router, Server Components by default, leaf-node "use client", Zod-validated Server Actions, and pnpm. |
| `styling` | **Tailwind CSS v4** | Mobile-first breakpoints, semantic CSS tokens, zero arbitrary magic pixel values, and primitive composition. |

---

## 2. Repository Architecture & Directory Tree

The repository adheres to the following structural convention (`src/` directory layout):

```
project-root/
├── AGENTS.md                      # [MASTER] Single Source of Truth (loaded automatically)
├── CLAUDE.md                      # [SHIM] "Read and strictly obey ./AGENTS.md"
├── .cursor/
│   └── rules/
│       └── base.mdc               # [SHIM] Cursor-native rule pointing to ./AGENTS.md
├── .github/
│   └── copilot-instructions.md    # [SHIM] Copilot rule pointing to ./AGENTS.md
├── public/
├── src/
│   └── app/
│       ├── globals.css            # Tailwind CSS styling tokens
│       ├── layout.tsx             # Root layout (Server Component)
│       └── page.tsx               # Root page (Server Component)
├── package.json
└── tsconfig.json
```

---

## Core Architectural Guardrails & Quality Standards

### 1. Anti-Slop & Zero Placeholder Rule
- **No Incomplete Implementations**: Never emit placeholder comments such as `// TODO`, `// implement later`, `// remaining code unchanged`, or stub methods that throw "Not implemented".
- **Full Operational Code**: Every file generated or edited must be completely implemented, syntactically valid, and ready to execute immediately.
- **Defensive Engineering**: Implement explicit error handling, validating edge cases, boundary conditions, and null/undefined values.

### 2. Package Manager Mandate (pnpm Exclusively)
- Exclusively use `pnpm` for package installation, script execution, and dependency management.
- NEVER run `npm` or `yarn`.
- Use `pnpm dlx` for one-off CLI execution instead of `npx`.
- Preserve `pnpm-lock.yaml` integrity on every package modification.

### 3. Strict TypeScript Discipline
- **Strict Mode Enforced**: Strict typing enabled (`noImplicitAny: true`, `strictNullChecks: true`).
- **No `any`**: Ban the use of `any` and arbitrary type casting (`as any`). Prefer `unknown` with type narrowing, discriminating unions, and explicit type guards.
- **Explicit Signatures**: Provide explicit return types and parameter types for all exported functions and API boundaries.

### 4. Post-Generation Verification Loop
- After writing or modifying code, immediately execute the verification suite:
  ```bash
  pnpm tsc --noEmit && pnpm lint
  ```
- You must resolve all compiler errors, type mismatches, and ESLint warnings before marking any task as complete.

---

## Next.js App Router Architectural Rules

### 1. Server vs. Client Component Boundaries
- **Server Components by Default**: All components in `app/` (layouts, pages, data containers) must be React Server Components (RSC) unless interactivity is required.
- **Leaf-Node Client Components**: Push the `'use client'` directive down strictly to the leaves of the component tree.
- **Interactivity Boundary Isolation**: Only mark components with `'use client'` if they require browser APIs, DOM event listeners (`onClick`, `onChange`), or React state/lifecycle hooks (`useState`, `useEffect`, `useTransition`).
- **Data Flow**: Fetch data inside Server Components and pass serializable data down to Client Components as props. Never fetch data client-side when it can be fetched on the server.

### 2. Server Actions & Mutations
- **Dedicated Actions Module**: Place Server Actions in dedicated action files marked with `'use server'` at the file header (e.g., `actions/items.ts`).
- **Zod Input Validation**: Every Server Action MUST parse its arguments with a strict Zod schema before performing any database or external operation:
  ```typescript
  'use server';

  import { z } from 'zod';

  const ActionInputSchema = z.object({
    id: z.string().cuid(),
    title: z.string().min(1).max(100),
  });

  export async function updateItemAction(rawInput: unknown) {
    const result = ActionInputSchema.safeParse(rawInput);
    if (!result.success) {
      return { success: false, error: result.error.flatten() };
    }
    // Perform authorized mutation...
    return { success: true, data: result.data };
  }
  ```
- **Typed Result Return**: Always return typed outcome objects (`{ success: true, data }` or `{ success: false, error }`) instead of throwing unhandled exceptions across the network boundary.
- **Cache Revalidation**: Call `revalidatePath` or `revalidateTag` explicitly after successful data mutations to refresh stale cached views.

### 3. File System Routing Conventions
- Follow standard App Router filenames: `layout.tsx`, `page.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, and `route.ts`.
- Keep route handlers (`route.ts`) focused purely on REST/webhook integrations; use Server Actions for UI data mutations.

---

## Tailwind CSS v4 UI Styling Guidelines

### 1. Mobile-First Responsive Rules
- Always build layout and styles mobile-first.
- Write default utility classes for the base mobile viewport, layering breakpoint prefixes progressively:
  - Base: Mobile (< 640px)
  - `sm:`: Small tablets & landscape phones (>= 640px)
  - `md:`: Tablets (>= 768px)
  - `lg:`: Desktops / Laptops (>= 1024px)
  - `xl:`: Large screens (>= 1280px)
  - `2xl:`: Ultra-wide screens (>= 1536px)
- Never override desktop styles down to mobile using inverse logic.

### 2. Semantic CSS Tokens & Theming
- Always use semantic design tokens and CSS variable-backed classes for color, background, and borders:
  - `bg-background`, `bg-card`, `bg-popover`, `bg-primary`, `bg-secondary`, `bg-muted`
  - `text-foreground`, `text-primary-foreground`, `text-muted-foreground`
  - `border-border`, `border-input`, `ring-ring`
- Never hardcode raw hex codes or arbitrary palette colors (`bg-[#1a1a1a]`, `text-blue-500`) when a theme token exists.

### 3. Zero Arbitrary Magic Pixel Values
- Strictly avoid arbitrary one-off pixel values:
  - BANNED: `w-[347px]`, `h-[43px]`, `p-[13px]`, `top-[7px]`, `text-[15px]`.
- Use the standard Tailwind spacing scale (`p-2`, `p-4`, `gap-3`, `h-10`, `w-full`, `max-w-md`).
- If an exact dimension is structurally required by an external embed, define a reusable named design token in your theme CSS instead of littering arbitrary brackets.

### 4. Clean Primitive Composition
- Use the `cn()` utility (`clsx` + `tailwind-merge`) to safely merge conditional classes and component prop overrides:
  ```typescript
  import { clsx, type ClassValue } from 'clsx';
  import { twMerge } from 'tailwind-merge';

  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  ```
- Keep component markup readable and cleanly split complex conditional styles.
