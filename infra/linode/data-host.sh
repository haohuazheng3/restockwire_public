#!/usr/bin/env bash
# RestockWire data host (Linode Nanode, Ubuntu 24.04): the site's Postgres 17 and the relay that mirrors the stock
# tables of the source database (the poller cluster) into it and sends this site's alerts. Run as root on the host
# after infra/linode/data-host cloud-init (or any bare Ubuntu 24.04 with Node 24 under /usr/local):
#
#   scp infra/linode/{data-host.sh,postgres.sh,db-maintenance.sh} root@HOST:/root/ && ssh root@HOST \
#     HOST_LABEL=rw-1 SOURCE_DATABASE_URL='postgres://…' SOURCE_DATABASE_CA_B64='…' REPO=haohuazheng3/restockwire_private \
#     DEPLOY_KEY_B64='…' bash /root/data-host.sh
#
# Idempotent. Leaves, root-only: /root/pg-secrets/*.url (see postgres.sh), /root/pg-ca/ca.crt (the site pins it as
# DATABASE_CA), /opt/restockwire/relay.env (the relay's settings; secrets such as RESEND_API_KEY and VAPID keys are
# appended by the operator, never by this script).
set -euo pipefail
HOST_LABEL=${HOST_LABEL:-rw-1}
REPO=${REPO:-haohuazheng3/restockwire_private}
APP=/opt/restockwire/app
ENVF=/opt/restockwire/relay.env

# 1. Postgres 17 (own CA, TLS, roles restockwire / restockwire_preview / poller) — postgres.sh is idempotent.
HOST_LABEL="$HOST_LABEL" ROLE=primary bash /root/postgres.sh
install -m 755 /root/db-maintenance.sh /opt/restockwire/db-maintenance.sh 2>/dev/null || true

# 2. Repo checkout with the read-only deploy key (private half arrives base64 in DEPLOY_KEY_B64, once).
install -d -m 700 /root/.ssh
if [ -n "${DEPLOY_KEY_B64:-}" ]; then
  (umask 077; echo "$DEPLOY_KEY_B64" | base64 -d > /root/.ssh/id_restockwire)
fi
cat > /root/.ssh/config <<'CFG'
Host github.com
  IdentityFile /root/.ssh/id_restockwire
  IdentitiesOnly yes
  StrictHostKeyChecking accept-new
CFG
chmod 600 /root/.ssh/config
HOME=/root git config --global --add safe.directory "$APP" 2>/dev/null || true
if [ ! -d "$APP/.git" ]; then
  git clone -q --depth 1 -b main "git@github.com:$REPO.git" "$APP"
fi

# 3. The relay's environment. DATABASE_URL = this host's database over loopback as the `poller` role (reserved
#    connection slots); SOURCE_DATABASE_URL = the poller cluster's database, read-only role, TLS pinned to its CA.
if [ ! -f "$ENVF" ]; then
  (umask 077; cat > "$ENVF" <<ENV
NODE_ENV=production
HOST_LABEL=$HOST_LABEL
DATABASE_URL=$(cat /root/pg-secrets/poller-local.url)
DATABASE_POOL_MAX=8
SITE_URL=https://restockwire.com
ALERTS_FROM="RestockWire <alerts@restockwire.com>"
VAPID_SUBJECT=mailto:alerts@restockwire.com
OWNER_EMAIL=${OWNER_EMAIL:-owner@example.com}
ENV
  )
fi
upsert() { if grep -q "^$1=" "$ENVF"; then sed -i "s|^$1=.*|$1=$2|" "$ENVF"; else echo "$1=$2" >> "$ENVF"; fi; }
[ -n "${SOURCE_DATABASE_URL:-}" ] && upsert SOURCE_DATABASE_URL "$SOURCE_DATABASE_URL"
if [ -n "${SOURCE_DATABASE_CA_B64:-}" ]; then
  install -d -m 700 /root/pg-ca
  echo "$SOURCE_DATABASE_CA_B64" | base64 -d > /root/pg-ca/source-ca.crt
  upsert SOURCE_DATABASE_CA_FILE /root/pg-ca/source-ca.crt
fi
chown poller:poller "$ENVF"; chmod 600 "$ENVF"
chmod 644 /root/pg-ca/source-ca.crt 2>/dev/null || true
chmod 711 /root /root/pg-ca 2>/dev/null || true

# 4. systemd: the relay (restarts forever), the nightly dump, daily maintenance, the update script.
cat > /etc/systemd/system/restockwire-relay.service <<'UNIT'
[Unit]
Description=RestockWire relay (mirrors the source stock tables, sends this site's alerts)
After=network-online.target postgresql.service
Wants=network-online.target
StartLimitIntervalSec=0
[Service]
User=poller
WorkingDirectory=/opt/restockwire/app
EnvironmentFile=/opt/restockwire/relay.env
ExecStart=/usr/local/bin/node --import tsx poller/relay.ts
Restart=always
RestartSec=2
LimitNOFILE=65536
OOMScoreAdjust=500
MemoryHigh=300M
MemoryMax=400M
[Install]
WantedBy=multi-user.target
UNIT
cat > /opt/restockwire/update.sh <<'SH'
#!/bin/bash
# Check out main (or the commit given), install, restart the relay. Run by root.
set -euo pipefail
APP=/opt/restockwire/app
cd "$APP"
git fetch -q origin main && git reset -q --hard "${1:-origin/main}"
/usr/local/bin/npm ci --no-audit --no-fund --omit=dev --ignore-scripts >/dev/null
/usr/local/bin/npm install --no-save --no-audit --no-fund tsx >/dev/null
chown -R poller:poller "$APP"
systemctl restart restockwire-relay
echo "relay on $(git rev-parse --short HEAD)"
SH
chmod 755 /opt/restockwire/update.sh
cat > /opt/restockwire/autoupdate.sh <<'SH'
#!/bin/bash
# Keeps the relay on the commit the site was built from (every 10 min): /api/health names the deployed commit.
set -uo pipefail
APP=/opt/restockwire/app; LAST=/opt/restockwire/.autoupdate-last
cd "$APP" || exit 0
target=$(curl -fsS -m 20 "https://restockwire.com/api/health?shallow=1" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("commit") or "-")') || exit 0
[ "$target" != "-" ] || exit 0
[ "$(git rev-parse HEAD)" = "$target" ] && exit 0
[ "$(cat "$LAST" 2>/dev/null)" = "$target" ] && exit 0
git fetch -q origin main || exit 0
git cat-file -e "${target}^{commit}" 2>/dev/null || exit 0
echo "$target" > "$LAST"
exec /opt/restockwire/update.sh "$target"
SH
chmod 755 /opt/restockwire/autoupdate.sh
cat > /etc/systemd/system/restockwire-autoupdate.service <<'UNIT'
[Unit]
Description=Update the relay when the site was deployed from a newer commit
[Service]
Type=oneshot
Environment=HOME=/root
ExecStart=/opt/restockwire/autoupdate.sh
UNIT
cat > /etc/systemd/system/restockwire-autoupdate.timer <<'UNIT'
[Unit]
Description=Check for relay code changes every 10 minutes
[Timer]
OnBootSec=10min
OnUnitActiveSec=10min
[Install]
WantedBy=timers.target
UNIT
install -d /var/backups/restockwire
cat > /etc/systemd/system/restockwire-pgdump.service <<'UNIT'
[Unit]
Description=Nightly RestockWire database dump (7 rotating copies)
[Service]
Type=oneshot
ExecStart=/bin/bash -c 'sudo -u postgres pg_dump -Fc restockwire > /var/backups/restockwire/restockwire-$(date -u +%%u).dump'
UNIT
cat > /etc/systemd/system/restockwire-pgdump.timer <<'UNIT'
[Unit]
Description=Nightly database dump
[Timer]
OnCalendar=*-*-* 09:30:00 UTC
Persistent=true
[Install]
WantedBy=timers.target
UNIT
cat > /etc/systemd/system/restockwire-db-maintenance.service <<'UNIT'
[Unit]
Description=Daily RestockWire database maintenance
[Service]
Type=oneshot
ExecStart=/opt/restockwire/db-maintenance.sh
UNIT
cat > /etc/systemd/system/restockwire-db-maintenance.timer <<'UNIT'
[Unit]
Description=Daily database maintenance
[Timer]
OnCalendar=*-*-* 10:00:00 UTC
Persistent=true
[Install]
WantedBy=timers.target
UNIT
systemctl daemon-reload
systemctl enable --now restockwire-pgdump.timer restockwire-db-maintenance.timer restockwire-autoupdate.timer >/dev/null
echo "data host ready: $(hostname) label=$HOST_LABEL node=$(/usr/local/bin/node -v) pg=$(sudo -u postgres psql -tAc 'show server_version')"
echo "next: /opt/restockwire/update.sh (installs + starts the relay once poller/relay.ts exists on main)"
