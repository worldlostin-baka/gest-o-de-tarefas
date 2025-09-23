const API_URL = import.meta.env.VITE_API_URL;

// Garante que não duplica barras
function makeUrl(path) {
  if (path.startsWith("http")) return path;
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh");
  if (!refresh) return null;

  const resp = await fetch(makeUrl("/auth/token/refresh/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!resp.ok) {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    return null;
  }

  const data = await resp.json();
  localStorage.setItem("access", data.access);
  return data.access;
}

async function apiFetch(url, options = {}) {
  let access = localStorage.getItem("access");
  const headers = options.headers ? { ...options.headers } : {};

  if (access) {
    headers["Authorization"] = `Bearer ${access}`;
  }

  const fullUrl = makeUrl(url);
  let resp = await fetch(fullUrl, { ...options, headers });

  if (resp.status === 401) {
    // tenta renovar token
    access = await refreshAccessToken();
    if (access) {
      headers["Authorization"] = `Bearer ${access}`;
      resp = await fetch(fullUrl, { ...options, headers });
    }
  }

  return resp;
}

// ----------------------
// API functions
// ----------------------

export async function login(username, password) {
  const resp = await fetch(makeUrl("/auth/token/"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await resp.json();
  if (!resp.ok) throw new Error(data.detail || "Erro ao fazer login");
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
  return data;
}

export async function getSalas() {
  const resp = await apiFetch("/salas/");
  return resp.json();
}

export async function getReservas() {
  const resp = await apiFetch("/reservas/");
  return resp.json();
}

export async function criarReserva(reserva) {
  const resp = await apiFetch("/reservas/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reserva),
  });
  return resp.json();
}
