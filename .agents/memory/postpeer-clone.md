---
name: PostMVP Architecture
description: First-party social publishing app — Clerk auth, Express backend, React-Vite frontend, PostgreSQL
---

## Stack
- Frontend: artifacts/postpeer-clone (React + Vite, wouter, @clerk/react, framer-motion)
- Backend: artifacts/api-server (Express 5, @clerk/express, Drizzle ORM)
- DB: PostgreSQL via @workspace/db
- Auth: Replit-managed Clerk (provisioned, keys set)

## Key Decisions
- Auth is cookie-based (Clerk session cookies on web) — do NOT add Bearer token handling to browser API calls
- requireAuth middleware in artifacts/api-server/src/lib/auth.ts reads clerkId from getAuth(req).userId
- getOrCreateUser() does JIT provisioning of local user record from Clerk ID
- Platform connections are first-party account records stored in PostMVP's database; provider OAuth adapters can be added later without changing the product boundary
- API keys are hashed (SHA-256) server-side, only full key shown once on creation

## DB Tables
- users: id, clerkId, email, name, plan (free/starter/standard/pro)
- posts: id, userId, content, platforms[], status (draft/scheduled/published/failed), scheduledAt, publishedAt, mediaUrls[]
- connected_platforms: id, userId, platform, accountName, accountHandle, status
- api_keys: id, userId, name, keyPrefix, keyHash, active

## Routes (frontend)
- / → landing (Home.tsx) if signed out → /dashboard if signed in
- /sign-in/*?, /sign-up/*? → Clerk SignIn/SignUp
- /dashboard, /compose, /posts, /platforms, /api-keys, /settings → protected (DashboardLayout)

## Clerk Setup
- setupClerkWhitelabelAuth() already called — keys in CLERK_PUBLISHABLE_KEY, VITE_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
- clerkProxyMiddleware mounted in app.ts before cors/body parsers
- clerkAppearance uses shadcn theme with dark black/white dev-tool palette

**Why:** PostMVP owns the product and should not depend on another social API provider; provider-specific OAuth and delivery can be introduced as independent adapters when each platform's credentials and policies are ready.
