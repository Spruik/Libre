/* Order States */

\c smartfactory

INSERT INTO "order_state" (state, state_options, is_unique, is_init_state, backup_state) VALUES ('planned', ARRAY['ready'], false, true, null);
INSERT INTO "order_state" (state, state_options, is_unique, is_init_state, backup_state) VALUES ('ready', ARRAY['next'], false, false, null);
INSERT INTO "order_state" (state, state_options, is_unique, is_init_state, backup_state) VALUES ('paused', ARRAY['next', 'complete'], false, false, null);
INSERT INTO "order_state" (state, state_options, is_unique, is_init_state, backup_state) VALUES ('complete', ARRAY['closed'], false, false, null);
INSERT INTO "order_state" (state, state_options, is_unique, is_init_state, backup_state) VALUES ('closed', ARRAY[''], false, false, null);
INSERT INTO "order_state" (state, state_options, is_unique, is_init_state, backup_state) VALUES ('next', ARRAY['running'], true, false, 'ready');
INSERT INTO "order_state" (state, state_options, is_unique, is_init_state, backup_state) VALUES ('running', ARRAY['paused', 'complete'], true, false, 'complete');
