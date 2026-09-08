/** expo-router's useLocalSearchParams can return a string[] instead of a
 * string when a query key appears more than once in the URL — which can
 * happen when chaining `router.replace(nextHref)` calls through several
 * screens that all accept a param of the same name (mockAttemptId,
 * nextHref, etc.), since the outgoing screen's own params and the target
 * href's params both land in the same query string. Always normalize
 * through this before using such a param for navigation or persistence. */
export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
