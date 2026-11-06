-- RestockWire: events this site records itself (its own fast lane) take ids from 5,000,000,000 up (0015), past the
-- range of a 32-bit integer. notifications.event_id was still "integer", so every alert for a restock the fast lane
-- confirmed failed with "value 5000000001 is out of range for type integer" (2026-11-06 19:52 UTC, R055) and only
-- the relay's mirrored copy of the same restock delivered it. Widen it to bigint; idempotent, safe to re-run.
ALTER TABLE "notifications" ALTER COLUMN "event_id" TYPE bigint;
