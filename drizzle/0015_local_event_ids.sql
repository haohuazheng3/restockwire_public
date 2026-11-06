-- RestockWire: events this site records itself (its own fast lane, poller/fast.ts) take ids from 5,000,000,000 up,
-- far above the ids mirrored from the poller cluster's database (poller/relay.ts copies those ids as they are).
SELECT setval('availability_events_id_seq', GREATEST(5000000000, (SELECT last_value FROM availability_events_id_seq)), true);
