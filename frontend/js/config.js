// Auto-detects whether we're in local dev (two separate servers)
// or in production (backend serves frontend on same origin).
const _isDev = window.location.hostname === 'localhost' && window.location.port === '3000';

export const API_BASE   = _isDev ? 'http://localhost:3001/api' : '/api';
export const MEDIA_BASE = _isDev ? 'http://localhost:3001'     : '';
