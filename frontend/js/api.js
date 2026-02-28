// api.js — centralised API client
// MIGRATION NOTE: In Next.js, replace API_BASE with '' and use relative /api/* paths.

import { API_BASE } from './config.js';

function getToken() {
  return localStorage.getItem('bw_token');
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(method, path, body, isFormData = false) {
  const headers = { ...authHeaders() };
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// Auth
export const auth = {
  signup: (name, email, password)   => request('POST', '/auth/signup', { name, email, password }),
  login:  (email, password)          => request('POST', '/auth/login',  { email, password }),
  me:     ()                          => request('GET',  '/auth/me'),
};

// Cards
export const cards = {
  list:       ()                 => request('GET',    '/cards'),
  get:        (id)               => request('GET',    `/cards/${id}`),
  create:     (data)             => request('POST',   '/cards', data),
  update:     (id, data)         => request('PATCH',  `/cards/${id}`, data),
  remove:     (id)               => request('DELETE', `/cards/${id}`),
  uploadLogo: (id, file)         => {
    const fd = new FormData(); fd.append('logo', file);
    return request('POST', `/cards/${id}/logo`, fd, true);
  },
  uploadPhoto: (id, file)        => {
    const fd = new FormData(); fd.append('photo', file);
    return request('POST', `/cards/${id}/photo`, fd, true);
  },
};

// Google Wallet pass
export const passes = {
  generate: (cardId) => request('POST', `/passes/${cardId}/generate`),
};

// QR
export const qr = {
  get: (cardId) => request('GET', `/qr/${cardId}`),
};
