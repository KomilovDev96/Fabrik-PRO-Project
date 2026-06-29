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

nginx serves on **port 8081** (`http://<server-ip>:8081`). `/api/v1/*` is proxied
to `http://46.225.154.145`, keeping the prefix (same as the dev Vite proxy), so
`VITE_API_BASE_URL` stays empty in prod.

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
| `VITE_API_BASE_URL` | empty | leave empty to use the nginx `/api` proxy |
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
