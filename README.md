## Books App Monorepo

## TL; DR

- This is a **monorepo** with:
  - **Rails API backend** (auth, books, borrows, dashboard)
  - **React/Vite frontend** in `client-app/`
- **Devbox** is the recommended way to:
  - install toolchain and dependencies (`devbox run install`)
  - setup the database (`devbox run db_setup`)
  - run tests (`devbox run test`)
- Start backend with `rails server` and frontend with `npm run dev` inside `client-app`.

## Overview

This repository is a **monorepo** containing:

- **Rails API backend** (`app`, `config`, `spec`, etc.) that exposes JSON endpoints for:
  - authentication and user registration (with roles: `member`, `librarian`)
  - books catalog (with available copies tracking)
  - borrows (borrow/return flow with due dates)
  - a dashboard endpoint that summarizes library and user stats
- **React + Vite frontend** in `client-app/` that:
  - provides login/registration flows
  - displays a book catalog
  - offers a dashboard showing borrowed books, overdue / due-today items
  - for librarians, shows global stats (total books, borrowed, available) and management views

The backend and frontend are designed to work together but can be developed and tested independently.

---

## Dev environment (Devbox)

Using **Devbox** is highly recommended to get a working environment **fast and consistently**.

Devbox configuration (`devbox.json`) installs:

- `ruby@3.4.5`
- `bundler@2.7.2`
- `nodejs@24`

### 1. Enter a Devbox shell

From the repo root:

```bash
devbox shell
```

You should see `Books Shell` printed when the shell starts.

### 2. Install dependencies

Use the provided Devbox script to install both backend and frontend dependencies:

```bash
devbox run install
```

This runs:

- `bundle install`
- `cd client-app; npm install`

### 3. Setup the database

Within the Devbox shell:

```bash
devbox run db_setup
```

This runs:

- `rails db:create`
- `rails db:migrate`

You can also seed or reset the database using standard Rails tasks if needed:

```bash
rails db:seed
rails db:reset
```

### 4. Running the backend

Still inside the Devbox shell:

```bash
rails server
```

By default this will start the Rails API server on `localhost:3000`.

### 5. Running the frontend (client)

In a second Devbox shell:

```bash
cd client-app
# One time only
cp .example.env .env

npm run dev
```

This starts the Vite development server (typically on `localhost:5173`), which proxies API calls to the Rails backend. This can be configured in `vite.config.ts`.

---

## Tests

From the repo root:

```bash
devbox run test
```

This runs the Rails test suite (inside the Devbox shell):

```bash
rspec spec
```

You can also run RSpec directly or run frontend tests (if added) from `client-app` as needed.

---
