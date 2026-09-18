// Unit tests for the account-deletion logic in delete-account/index.ts.
// Run with (from supabase/functions/):
//   deno test --allow-env --allow-read --node-modules-dir=none _shared/deleteAccount.test.ts
import { strict as assert } from 'node:assert';

import { performAccountDeletion } from './deleteAccount.ts';

/** A minimal fake admin client covering exactly the two calls
 * performAccountDeletion makes: `.from('revenuecat_webhook_events').delete().eq(...)`
 * and `.auth.admin.deleteUser(userId)`. */
function makeFakeAdmin(opts: { webhookCleanupError?: { message: string } | null; deleteUserError?: { message: string } | null } = {}) {
  const calls = { webhookDeleteEq: [] as [string, unknown][], deleteUserIds: [] as string[] };
  const client = {
    from(_table: string) {
      return {
        delete() {
          return {
            async eq(col: string, val: unknown) {
              calls.webhookDeleteEq.push([col, val]);
              return { error: opts.webhookCleanupError ?? null };
            },
          };
        },
      };
    },
    auth: {
      admin: {
        async deleteUser(userId: string) {
          calls.deleteUserIds.push(userId);
          return { error: opts.deleteUserError ?? null };
        },
      },
    },
    // deno-lint-ignore no-explicit-any
  } as any;
  return { client, calls };
}

Deno.test('performAccountDeletion: a successful deletion cleans up webhook events and deletes exactly the given user id', async () => {
  const { client, calls } = makeFakeAdmin();
  const result = await performAccountDeletion(client, 'user-1');
  assert.deepEqual(result, { ok: true });
  assert.deepEqual(calls.webhookDeleteEq, [['app_user_id', 'user-1']]);
  assert.deepEqual(calls.deleteUserIds, ['user-1']);
});

Deno.test('performAccountDeletion: never deletes any user id other than the one it was given — proving "cannot delete another user" structurally', async () => {
  const { client, calls } = makeFakeAdmin();
  await performAccountDeletion(client, 'the-real-caller');
  assert.equal(calls.deleteUserIds.length, 1);
  assert.equal(calls.deleteUserIds[0], 'the-real-caller');
  assert.notEqual(calls.deleteUserIds[0], 'someone-else');
});

Deno.test('performAccountDeletion: a webhook-cleanup failure does not block the actual account deletion', async () => {
  const { client, calls } = makeFakeAdmin({ webhookCleanupError: { message: 'connection reset' } });
  const result = await performAccountDeletion(client, 'user-1');
  assert.deepEqual(result, { ok: true });
  assert.deepEqual(calls.deleteUserIds, ['user-1']);
});

Deno.test('performAccountDeletion: is idempotent — retrying after the user is already deleted (GoTrue "not found") is still reported as success', async () => {
  const { client } = makeFakeAdmin({ deleteUserError: { message: 'User not found' } });
  const result = await performAccountDeletion(client, 'user-1');
  assert.deepEqual(result, { ok: true });
});

Deno.test('performAccountDeletion: a genuine deletion failure is surfaced cleanly, not swallowed', async () => {
  const { client } = makeFakeAdmin({ deleteUserError: { message: 'internal server error' } });
  const result = await performAccountDeletion(client, 'user-1');
  assert.equal(result.ok, false);
  assert.equal(result.error, 'internal server error');
});
