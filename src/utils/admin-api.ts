// Mock API Data for demonstration purposes

const BASE_URL = import.meta.env.VITE_API_URL || 'https://ambigo.in/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'wss://ambigo.in/ws';
export const LIVE_MEDIA_URL = import.meta.env.VITE_MEDIA_URL || 'https://ambigo.in';

export function getMediaUrl(url: string | undefined | null) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('data:image')) return url;
  if (url.startsWith('/9j/') || url.startsWith('iVBORw0KGgo') || url.length > 500) {
    return `data:image/jpeg;base64,${url}`;
  }
  return `${LIVE_MEDIA_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export function getHeaders() {
  const token = localStorage.getItem('admin_token') || '';
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-API-Key': 'fnw4ua8bdueu5vckkhg56jaq8xy9m8' // Correct backend API_KEY
  };
}

export async function sendAdminOTP(mobile: string) {
  const res = await fetch(`${BASE_URL}/admin/auth/login/mobile`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': 'fnw4ua8bdueu5vckkhg56jaq8xy9m8' },
    body: JSON.stringify({ mobile })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to send OTP');
  }
  return await res.json();
}

export async function verifyAdminOTP(mobile: string, otp: string) {
  const res = await fetch(`${BASE_URL}/admin/auth/login/mobile/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': 'fnw4ua8bdueu5vckkhg56jaq8xy9m8' },
    body: JSON.stringify({ mobile, otp })
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Invalid OTP');
  }
  return await res.json();
}

export async function listOngoingRides() {
  const res = await fetch(`${BASE_URL}/admin/rides/ongoing/list`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch ongoing rides');
  return await res.json();
}

export async function listCompletedRides() {
  const res = await fetch(`${BASE_URL}/admin/rides/completed/list`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch completed rides');
  return await res.json();
}

export async function listDrivers(skip: number = 0) {
  const res = await fetch(`${BASE_URL}/admin/driver/list`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ skip })
  });
  if (!res.ok) throw new Error('Failed to fetch drivers');
  return await res.json(); // Returns { total: X, data: [...] }
}

export async function listUnverifiedDrivers() {
  const res = await fetch(`${BASE_URL}/admin/driver/unverified/list`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch unverified drivers');
  return await res.json();
}

export async function fetchUnverifiedDriver(id: string) {
  const res = await fetch(`${BASE_URL}/admin/driver/unverified/fetch`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ id })
  });
  if (!res.ok) throw new Error('Failed to fetch unverified driver details');
  return await res.json();
}

export async function acceptDriver(driverData: any) {
  const res = await fetch(`${BASE_URL}/admin/driver/unverified/accept`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(driverData)
  });
  if (!res.ok) throw new Error('Failed to accept driver');
  return await res.json();
}

export async function rejectDriver(id: string, reason: string) {
  const res = await fetch(`${BASE_URL}/admin/driver/unverified/reject`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ id, reason })
  });
  if (!res.ok) throw new Error('Failed to reject driver');
  return await res.json();
}

export async function listUsers() {
  const res = await fetch(`${BASE_URL}/admin/user/list`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return await res.json();
}

export async function listAmbulanceTypes() {
  const res = await fetch(`${BASE_URL}/data/ambulance/types/list`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch ambulance types');
  return await res.json();
}

export async function listHospitals() {
  const res = await fetch(`${BASE_URL}/data/hospitals/list`, {
    method: 'POST',
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch hospitals');
  return await res.json();
}

export function createFleetWebSocket(onMessage: (data: any) => void, onError: (error: any) => void) {
  const token = localStorage.getItem('admin_token') || '';
  const apiKey = 'fnw4ua8bdueu5vckkhg56jaq8xy9m8'; // Correct backend setup
  const ws = new WebSocket(`${WS_URL}/admin/fleet/live?api_key=${apiKey}&token=${token}`);
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      console.error("Failed to parse websocket message", e);
    }
  };
  ws.onerror = onError;
  
  return ws;
}
