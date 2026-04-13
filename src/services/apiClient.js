import { Platform } from 'react-native';

const LOCAL_BASE_URL = 'http://localhost:4000/api/v1';
const ANDROID_EMULATOR_BASE_URL = 'http://10.0.2.2:4000/api/v1';
const ENV_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
const DEFAULT_BASE_URL =
  ENV_BASE_URL ||
  (Platform.OS === 'android' ? ANDROID_EMULATOR_BASE_URL : LOCAL_BASE_URL);

async function request(method, path, body, opts) {
  const baseUrl = opts?.baseUrl || DEFAULT_BASE_URL;
  const headers = {
    'Content-Type': 'application/json',
    ...(opts?.accessToken ? { Authorization: `Bearer ${opts.accessToken}` } : {}),
  };

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message = data?.message || `HTTP ${res.status}`;
    const err = new Error(typeof message === 'string' ? message : 'Request failed');
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data;
}

export const api = {
  get: (path, opts) => request('GET', path, null, opts),
  post: (path, body, opts) => request('POST', path, body, opts),
  patch: (path, body, opts) => request('PATCH', path, body, opts),
  del: (path, opts) => request('DELETE', path, null, opts),
};

// PHASE 2: Add request correlation IDs + retries/backoff on transient errors.
