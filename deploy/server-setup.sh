#!/usr/bin/env bash
#
# One-time server bootstrap for Fabrik PRO static deploys.
# Run ONCE as root on the deploy server:
#
#     sudo bash server-setup.sh
#
# It is idempotent — safe to re-run. It does NOT touch any existing nginx site
# (hamyon / daysworkfix); it only adds an isolated "fabrik" site on port 8081.
#
set -euo pipefail

DEPLOY_USER="deploy"
BASE="/var/www/fabrik"

# Public half of the dedicated GitHub Actions deploy key. The private half lives
# only in the repo's GitHub Secret SSH_PRIVATE_KEY.
PUBKEY='ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIA8Ls/2EmOeOlyJ5gzVaYD6+aUxGdTxo5omoFSzS5l52 github-actions-fabrik-deploy'

if [ "$(id -u)" -ne 0 ]; then
  echo "Run as root: sudo bash server-setup.sh" >&2
  exit 1
fi

echo "==> 1/5 deploy user"
id "$DEPLOY_USER" >/dev/null 2>&1 || useradd -m -s /bin/bash "$DEPLOY_USER"
install -d -m 700 -o "$DEPLOY_USER" -g "$DEPLOY_USER" "/home/${DEPLOY_USER}/.ssh"

echo "==> 2/5 authorized_keys"
AK="/home/${DEPLOY_USER}/.ssh/authorized_keys"
grep -qsF "$PUBKEY" "$AK" 2>/dev/null || echo "$PUBKEY" >> "$AK"
chmod 600 "$AK"
chown "${DEPLOY_USER}:${DEPLOY_USER}" "$AK"

echo "==> 3/5 release dirs + placeholder"
mkdir -p "${BASE}/releases/initial"
cat > "${BASE}/releases/initial/index.html" <<'HTML'
<!doctype html><html lang="ru"><head><meta charset="utf-8">
<title>Fabrik PRO</title><meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:system-ui,sans-serif;display:grid;place-items:center;height:100vh;margin:0;background:#0f172a;color:#e2e8f0}div{text-align:center}</style>
</head><body><div><h1>Fabrik PRO</h1><p>Сервер готов. Ожидается первый деплой из CI/CD…</p></div></body></html>
HTML
ln -sfn "${BASE}/releases/initial" "${BASE}/current"
chown -R "${DEPLOY_USER}:${DEPLOY_USER}" "$BASE"

echo "==> 4/5 nginx site (port 8081)"
cat > /etc/nginx/sites-available/fabrik <<'NGINX'
server {
    listen 8081;
    server_name _;

    root /var/www/fabrik/current;
    index index.html;
    client_max_body_size 50M;

    location /api/ {
        proxy_pass http://46.225.154.145;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }
}
NGINX
ln -sfn /etc/nginx/sites-available/fabrik /etc/nginx/sites-enabled/fabrik

echo "==> 5/5 nginx test + reload"
nginx -t
systemctl reload nginx

IP="$(hostname -I | awk '{print $1}')"
echo
echo "✓ Done. Fabrik PRO will be served on  http://${IP}:8081  after the first CI/CD deploy."
echo "  (right now it shows the placeholder page)"
