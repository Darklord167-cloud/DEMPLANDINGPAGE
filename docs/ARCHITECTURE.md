# Dark Empire Platform Architecture & Data Ownership Model

## 1. Executive Summary & Security Separation

The Dark Empire platform employs a strict separation of concerns across authentication identity, relational transactional state, on-chain telemetry, and cryptographic credential vaults.

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Browser                         │
│  (Next.js 15 App Router / Dark Cyber-Imperial UI / Solana)   │
└──────────────┬───────────────────────────────┬──────────────┘
               │ (Bearer ID Token / Nonces)     │ (Signed Trx)
               ▼                               ▼
┌─────────────────────────────┐   ┌───────────────────────────┐
│     Firebase Identity       │   │    Solana Edge RPC Pool   │
│  • Google OAuth / Email Auth │   │  • Helius / Alchemy       │
│  • Firebase UID Issuance    │   │  • QuickNode / Mainnet    │
└──────────────┬──────────────┘   └────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│             Next.js Backend API Layer (/api)                │
│  • Cryptographic Nonce Validation (Ed25519)                 │
│  • Fail-Closed Admin Auth (x-relay-secret-key)              │
│  • Stripe Webhook Signature Verification                    │
│  • Gemini 2.5 Pro/Flash AI Oracle Orchestrator              │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
               ▼                               ▼
┌─────────────────────────────┐   ┌───────────────────────────┐
│ PostgreSQL (Neon Serverless)│   │  Zero-Knowledge Key Vault │
│  • Users & Credit Ledger    │   │  • AES-256-GCM Enclave    │
│  • Stripe Idempotency Ledger│   │  • Write-Only Injection   │
│  • Auth Challenges & Nonces │   │  • Masked Metadata UI     │
│  • VIP On-Chain Records     │   │  • Server-Side Execution  │
│  • Audit & Webhook Logs     │   └───────────────────────────┘
└─────────────────────────────┘
```

---

## 2. Component Ownership Boundaries

### A. Firebase Auth (Identity & Authentication)
- **Primary Responsibility:** User identity, Google OAuth, Email login, JWT token issuance.
- **Storage Scope:** `uid`, `email`, `displayName`, `authProvider`.
- **Security Rule:** The browser client authenticates with Firebase and receives a signed ID token. All privileged API requests transmit this token as an `Authorization: Bearer <id_token>` header.

### B. PostgreSQL via Neon (Transactional State & Application Data)
- **Primary Responsibility:** System of record for all mutable business data, financial transactions, and cryptographic verification logs.
- **Tables & Schemas:**
  1. `users`: Profile metadata, linked Solana wallet address, current credit balance, VIP tier status.
  2. `credit_ledger`: Transactional immutable double-entry ledger for credit purchases, deductions, refunds, and admin grants.
  3. `stripe_events`: Persistent idempotency ledger storing processed Stripe event IDs (`evt_...`) to prevent duplicate fulfillment across serverless executions.
  4. `auth_challenges`: Domain-bound and action-bound cryptographic nonces (TTL: 5 minutes) consumed atomically during signature verification.
  5. `vip_verifications`: Historical on-chain Solana balance verification snapshots.
  6. `webhook_events`: Idempotency tracking and replay prevention for Telegram, Helius, Discord, and HQ webhooks.
  7. `audit_logs`: Immutable security log tracking admin operations, credential rotations, and logins.
  8. `trading_credentials_metadata`: Safe UI indicators (configured/unconfigured, masked API key preview, rotation timestamp).

### C. Zero-Knowledge Key Vault (Credential Storage)
- **Primary Responsibility:** Encrypted storage of exchange API keys and Solana execution keys.
- **Encryption Algorithm:** AES-256-GCM authenticated encryption (`enc:v1:<iv_hex>:<tag_hex>:<ciphertext_hex>`).
- **Zero-Knowledge Principle:** 
  - The client browser is strictly **write-only**. It can inject new keys to be encrypted by the server.
  - The browser **NEVER** receives decrypted private keys, API secrets, or passphrases back over the network.
  - The browser only receives safe metadata (e.g. `Configured (Gy37...qqTH)`).
  - Decryption occurs only in ephemeral server memory when executing authorized automated trades.

---

## 3. Concurrency & Replay Protection

1. **Credit Deductions**: Atomic SQL execution guarantees that credits cannot be double-spent through concurrent requests:
   ```sql
   UPDATE users 
   SET credits = credits - :amount 
   WHERE id = :id AND credits >= :amount
   RETURNING *;
   ```
2. **Stripe Payment Idempotency**:
   Every incoming webhook checks the `stripe_events` table before executing credit awards. If an event ID already exists, the webhook immediately returns `{ received: true, duplicate: true }`.
3. **Wallet Nonce Flow**:
   Every wallet-signed action requires a server-issued challenge nonce (`POST /api/auth/challenge`). During verification, the nonce is atomically marked `consumed = true`. Any attempt to reuse the same nonce is rejected.
