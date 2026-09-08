-- Adds 'ai_chat' to activity_type so an AI Coach message can be logged to
-- test_history the same way reading/listening/writing/speaking attempts
-- already are — this is what the free-tier daily message limit
-- (lib/entitlements.ts) counts against.
alter type activity_type add value if not exists 'ai_chat';
