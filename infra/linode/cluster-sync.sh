#!/usr/bin/env bash
# RestockWire cluster record follower (restockwire-cluster-sync.timer, every 15 s), on linode-1 and linode-4.
#
# The site, the relay and the fast lanes reach the restockwire databases through FailoverPool (src/lib/db): every
# query goes to the database that is writable AND whose poller_state 'cluster' record names its own host
# (restockwire.host), highest epoch first. That record is PickupChecker's: when linode-4 takes over, PickupChecker's
# poller writes {primary: linode-4, epoch: n+1} into its own database there. Nothing else would carry it into the
# restockwire databases on that host (the relay only writes through the pool, which still refuses linode-4), so
# without this the site would stay read-only after a takeover. Only the writable host copies; a host in recovery
# gets the record by replication. An old primary that comes back still carries the lower epoch, so it loses.
set -uo pipefail
# The unit runs it as postgres (no sudo line in the journal every 15 s); by hand as root it switches user.
if [ "$(id -u)" = 0 ]; then P=(sudo -u postgres psql -X -qAt -v ON_ERROR_STOP=1); else P=(psql -X -qAt -v ON_ERROR_STOP=1); fi
[ "$("${P[@]}" -d pickupchecker -c 'select pg_is_in_recovery()' 2>/dev/null)" = "f" ] || exit 0
v=$("${P[@]}" -d pickupchecker -c "select value::text from poller_state where key = 'cluster'") || exit 1
[ -n "$v" ] || exit 0
for db in restockwire restockwire_preview; do
  printf '%s\n' "insert into poller_state (key, value, updated_at) values ('cluster', :'v'::jsonb, now())
    on conflict (key) do update set value = excluded.value, updated_at = now()
    where poller_state.value is distinct from excluded.value
    returning 'updated ' || current_database() || ' -> ' || value::text;" | "${P[@]}" -d "$db" -v v="$v" || echo "sync failed for $db" >&2
done
