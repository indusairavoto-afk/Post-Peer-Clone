---
name: PostMVP Architecture
description: First-party social publishing app — Clerk auth, Express backend, React-Vite frontend, PostgreSQL, Post Bridge for real social publishing
---

## Stack
- Frontend: artifacts/postpeer-clone (React + Vite, wouter, @clerk/react, framer-motion)
- Backend: artifacts/api-server (Express 5, @clerk/express, Drizzle ORM)
- DB: PostgreSQL via @workspace/db
- Auth: Replit-managed Clerk (provisioned, keys set)
- Social publishing: Post Bridge API (api.post-bridge.com) — handles real OAuth for all 9 platforms

## Key Decisions
- Auth is cookie-based (Clerk session cookies on web) — do NOT add Bearer token handling to browser API calls
- requireAuth middleware in artifacts/api-server/src/lib/auth.ts reads clerkId from getAuth(req).userId
- getOrCreateUser() does JIT provisioning of local user record from Clerk ID
- Platform connections are REAL — proxied from Post Bridge API when user has a key configured
- Post Bridge API key is stored per-user in `post_bridge_api_key` column on users table (never returned to frontend)
- API keys are hashed (SHA-256) server-side, only full key shown once on creation

## Post Bridge Integration
- User adds their `pb_live_xxx` key in Settings → PUT /api/user/settings
- Key is verified against Post Bridge API before saving (invalid key = 400)
- GET /api/platforms/connected proxies to https://api.post-bridge.com/v1/social-accounts
- POST /api/posts with `accountIds` array → publishes via Post Bridge API for real
- Without a Post Bridge key: platforms/connected returns empty list (no fake connections)
- postBridgeApiKey is stripped from all API responses — frontend only sees `hasPostBridgeKey: boolean`
- Post Bridge lib: artifacts/api-server/src/lib/postbridge.ts

## DB Tables
- users: id, clerkId, email, name, plan (free/starter/standard/pro), postBridgeApiKey
- posts: id, userId, content, platforms[], status (draft/scheduled/published/failed), scheduledAt, publishedAt, mediaUrls[]
- connected_platforms: id, userId, platform, accountName, accountHandle, status (legacy, no longer used for active connections)
- api_keys: id, userId, name, keyPrefix, keyHash, active

## Routes (frontend)
- / → landing (Home.tsx) if signed out → /dashboard if signed in
- /sign-in/*?, /sign-up/*? → Clerk SignIn/SignUp
- /dashboard, /compose, /posts, /platforms, /api-keys, /settings → protected (DashboardLayout)

## Clerk Setup
- setupClerkWhitelabelAuth() already called — keys in CLERK_PUBLISHABLE_KEY, VITE_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
- clerkProxyMiddleware mounted in app.ts before cors/body parsers
- clerkAppearance uses shadcn theme with dark black/white dev-tool palette

**Why Post Bridge:** Instead of building per-platform OAuth (Instagram, TikTok, YouTube, X, LinkedIn, Facebook, Pinterest, Threads, Bluesky), Post Bridge handles all OAuth and publishing via a single API key. Users connect accounts once on Post Bridge's dashboard; PostMVP uses those connections.
