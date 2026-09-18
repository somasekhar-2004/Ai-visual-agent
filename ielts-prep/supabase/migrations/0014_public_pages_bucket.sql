-- Public Storage bucket for static, always-rendering pages the app links
-- users out to — currently just supabase/static/email-confirmation.html,
-- the email-confirmation landing page (see services/auth.ts's
-- EMAIL_CONFIRMATION_REDIRECT_URL). A public bucket serves its objects via
-- /storage/v1/object/public/<bucket>/<path> with no auth required and no
-- RLS policy needed on storage.objects for reads, regardless of what
-- policies exist — verified live: a public GET to this bucket's URL
-- returns 200 even from a signed-out request.
--
-- The file itself is not part of this migration (SQL migrations aren't the
-- right place for binary/text asset content) — see README.md's "Auth
-- redirect URL" section for the upload command:
--   npx supabase storage cp --experimental --linked \
--     --content-type "text/html; charset=utf-8" --cache-control "no-cache" \
--     supabase/static/email-confirmation.html ss:///public-pages/email-confirmation.html
insert into storage.buckets (id, name, public)
values ('public-pages', 'public-pages', true)
on conflict (id) do update set public = true;
