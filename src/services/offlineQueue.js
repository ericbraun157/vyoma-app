import AsyncStorage from '@react-native-async-storage/async-storage';

const QUEUE_KEY = '@vyoma/offlineQueue';

export async function enqueueMutation(mutation) {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  const list = raw ? JSON.parse(raw) : [];
  list.push({ ...mutation, enqueuedAt: new Date().toISOString() });
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(list));
}

export async function drainQueue(processFn) {
  const raw = await AsyncStorage.getItem(QUEUE_KEY);
  const list = raw ? JSON.parse(raw) : [];
  if (!list.length) return { processed: 0 };

  const remaining = [];
  let processed = 0;
  for (const item of list) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await processFn(item);
      processed += 1;
    } catch {
      remaining.push(item);
    }
  }
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  return { processed, remaining: remaining.length };
}

// PHASE 2: Add conflict resolution + idempotency keys for safe replay.

