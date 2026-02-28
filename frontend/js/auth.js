import { auth } from './api.js';

export function saveSession(token, user) {
  localStorage.setItem('bw_token', token);
  localStorage.setItem('bw_user', JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem('bw_token');
  localStorage.removeItem('bw_user');
}

export function getUser() {
  try { return JSON.parse(localStorage.getItem('bw_user')); }
  catch { return null; }
}

export function isLoggedIn() {
  return !!localStorage.getItem('bw_token');
}

// Redirects to login if not authenticated
export function requireLogin() {
  if (!isLoggedIn()) window.location.href = '/pages/login.html';
}

// Redirects to dashboard if already logged in
export function redirectIfLoggedIn() {
  if (isLoggedIn()) window.location.href = '/pages/dashboard.html';
}

// Handle login form
export async function handleLogin(email, password) {
  const { token, user } = await auth.login(email, password);
  saveSession(token, user);
  window.location.href = '/pages/dashboard.html';
}

// Handle signup form
export async function handleSignup(name, email, password) {
  const { token, user } = await auth.signup(name, email, password);
  saveSession(token, user);
  window.location.href = '/pages/dashboard.html';
}

export function logout() {
  clearSession();
  window.location.href = '/pages/login.html';
}
