// Central API Service Client with Refresh Interceptor

let accessToken: string | null = localStorage.getItem('procurex_token');

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('procurex_token', token);
  } else {
    localStorage.removeItem('procurex_token');
  }
};

export const getAccessToken = () => accessToken;

export async function apiFetch<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include' // include cookies for refresh endpoint
  };

  let response = await fetch(`/api${endpoint}`, config);

  // Auto Refresh Interceptor
  if (response.status === 401 && endpoint !== '/auth/login' && endpoint !== '/auth/refresh') {
    try {
      const refreshRes = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.token) {
          setAccessToken(refreshData.token);
          headers['Authorization'] = `Bearer ${refreshData.token}`;
          // Retry original request
          response = await fetch(`/api${endpoint}`, { ...options, headers, credentials: 'include' });
        }
      } else {
        setAccessToken(null);
        window.location.href = '/login';
      }
    } catch (err) {
      setAccessToken(null);
      window.location.href = '/login';
    }
  }

  const data = await response.json();

  if (!response.ok || data.success === false) {
    throw new Error(data.message || `API error (${response.status})`);
  }

  return data;
}
