# CI/CD — Fabrik PRO

GitHub Actions builds the SPA on every push/PR and deploys it to the server on
push to `main`. The server (nginx) serves the static `dist/` and proxies `/api`
to the Fabrik backend — no Docker, no pm2 (this is a static frontend).

## Flow

```
push → main
  ├─ build:  npm ci → type-check → lint → vite build → upload dist artifact
  └─ deploy: rsync dist/ → server release dir → atomic symlink swap → keep last 3
```

PRs and `workflow_dispatch` run **build only** (no deploy).

- Workflow: [.github/workflows/deploy.yml](../.github/workflows/deploy.yml)
- Deploy script (runs on the runner): [scripts/deploy.sh](../scripts/deploy.sh)
- nginx site (reference): [deploy/nginx/fabrik.conf](nginx/fabrik.conf)
- One-time server bootstrap: [deploy/server-setup.sh](../deploy/server-setup.sh)

## Server layout

```
/var/www/fabrik/
  releases/
    20260629...-<sha>/   ← each deploy (last 3 kept)
  current  → releases/<latest>   ← nginx root points here
```

nginx serves the static SPA on **port 8081** (`http://<server-ip>:8081`).

**API in prod:** the browser talks to the backend **directly** at
`http://46.225.154.145` (baked into the build via `VITE_API_BASE_URL`). The
backend sends `Access-Control-Allow-Origin: *`, so CORS is fine. We do **not**
use the nginx `/api` proxy: the UZ DPI filter blocks plain-HTTP `/api` on the
server→backend hop (returns an `ogohlantirish.uz` block page). The `location
/api/` block is kept in the nginx config but unused — it becomes useful again
once the backend is reachable over HTTPS.

> Caveat: this works while the frontend is served over **HTTP**. When the
> frontend moves to HTTPS, calling an HTTP backend = mixed-content blocked — at
> that point put the backend behind HTTPS (a domain + cert) and point
> `VITE_API_BASE_URL` at it (or revive the nginx proxy over HTTPS).

## One-time setup

### 1. Bootstrap the server (run once, as root)

```bash
scp deploy/server-setup.sh root@<server-ip>:/root/
ssh root@<server-ip> 'bash /root/server-setup.sh'
```

Creates the `deploy` user, installs the deploy public key, the release dirs, and
the nginx site on :8081. Idempotent; does not touch other sites.

### 2. GitHub Secrets

Repo → Settings → Secrets and variables → Actions → **Secrets**:

| Secret | Value |
| --- | --- |
| `SSH_PRIVATE_KEY` | the deploy **private** key (full PEM, incl. BEGIN/END lines) |
| `DEPLOY_HOST` | server IP |
| `DEPLOY_USER` | `deploy` |
| `DEPLOY_SSH_PORT` | `22` (optional; omit to default) |
| `VITE_YANDEX_MAPS_API_KEY` | Yandex Maps JS API key |

Optional **Variables** (same screen → *Variables* tab) — only if you need to
override the build defaults:

| Variable | Default | Notes |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `http://46.225.154.145` | browser calls the backend directly; set to an HTTPS API origin when you have one |
| `VITE_DEFAULT_LOCALE` | `ru` | |
| `VITE_APP_NAME` | `Fabric PRO` | |

### 3. Environment protection (optional)

The `deploy` job uses the `production` environment. In repo → Settings →
Environments → `production` you can add required reviewers so deploys wait for a
manual approval.

## Deploy

Push to `main` (or run the workflow manually for a build-only check). Rollback =
point `current` at a previous release on the server:

```bash
ssh deploy@<server-ip> 'ln -sfn /var/www/fabrik/releases/<older> /var/www/fabrik/current'
```

## Adding a domain + HTTPS later

`certbot` is already installed on the server. Once DNS points at it:

```bash
# edit /etc/nginx/sites-available/fabrik: server_name app.example.uz; listen 80;
sudo certbot --nginx -d app.example.uz
```
