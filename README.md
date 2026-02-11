# Mirfa Secure Transaction Vault

A secure, full-stack application for encrypting and decrypting sensitive transaction data using AES-256-GCM.

## Features
- **Crypto Brain:** A dedicated workspace package (`@repo/crypto`) for standardized encryption logic.
- **Secure API:** A Fastify backend that stores encrypted "envelopes" (IV + Auth Tag + Ciphertext).
- **Modern UI:** A Next.js frontend with a dark-mode interface for depositing and retrieving secrets.
- **Monorepo:** Built with TurboRepo for efficient build and development management.

## Tech Stack
- **Monorepo:** TurboRepo + pnpm
- **Backend:** Node.js, Fastify, TypeScript
- **Frontend:** Next.js, Tailwind CSS, Axios
- **Encryption:** Node.js native `crypto` module (AES-256-GCM)

---

## How to Run

### 1. Prerequisites
- Node.js (v18 or higher)
- pnpm (Install via `npm install -g pnpm`)

### 2. Installation
Install all dependencies for the frontend, backend, and shared packages:
```bash
pnpm install
