import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL || "/api";
export const API_URL = rawApiUrl.endsWith("/") ? rawApiUrl.slice(0, -1) : rawApiUrl;

export const BACKEND_BASE_URL = (() => {
  const configuredBackend = import.meta.env.VITE_BACKEND_URL;
  if (configuredBackend) return configuredBackend.replace(/\/$/, "");

  if (/^https?:\/\//i.test(API_URL)) {
    return API_URL.replace(/\/api\/?$/, "").replace(/\/$/, "");
  }

  const currentOrigin = window.location.origin.replace(/\/$/, "");
  if (/localhost|127\.0\.0\.1/i.test(currentOrigin)) {
    return "http://localhost:5000";
  }

  return currentOrigin;
})();

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Keep successful GET responses available while users move between routes.
// Any write clears the cache so the next view gets current backend data.
const getCache = new Map();
const pendingGets = new Map();

const serializeParams = (params) => {
  if (!params) return "";
  if (typeof params.toString === "function" && params instanceof URLSearchParams) {
    return params.toString();
  }
  return JSON.stringify(
    Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {}),
  );
};

const getCacheKey = (url, config = {}) => {
  const token = localStorage.getItem("token") || "guest";
  return `${token}:${config.baseURL || API_URL}:${url}:${serializeParams(config.params)}`;
};

const clearGetCache = () => {
  getCache.clear();
  pendingGets.clear();
};

// Add token automatically and preserve FormData headers
api.interceptors.request.use(
  (config) => {
    // Always read token fresh from localStorage before each request
    const token = localStorage.getItem("token");
    
    if (token && token.trim()) {
      config.headers.Authorization = `Bearer ${token}`;
      // Debug log (remove in production if needed)
      if (import.meta.env.DEV) {
        console.log(`[API] Sending request to ${config.url} with token (length: ${token.length})`);
      }
    } else {
      if (import.meta.env.DEV) {
        console.warn(`[API] No token found for ${config.url}. User may not be authenticated.`);
      }
    }
    
    if (config.data instanceof FormData) {
      // Let axios set the multipart/form-data boundary header automatically
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token might have expired or user not authenticated
      console.error("[API] 401 Unauthorized - Clearing stored token");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Optionally redirect to login - you can implement this based on your routing
    }
    return Promise.reject(error);
  }
);

const originalGet = api.get.bind(api);
const originalPost = api.post.bind(api);
const originalPut = api.put.bind(api);
const originalPatch = api.patch.bind(api);
const originalDelete = api.delete.bind(api);

api.get = (url, config = {}) => {
  if (config.skipCache) {
    const nextConfig = { ...config };
    delete nextConfig.skipCache;
    return originalGet(url, nextConfig);
  }

  const cacheKey = getCacheKey(url, config);
  if (getCache.has(cacheKey)) return Promise.resolve(getCache.get(cacheKey));
  if (pendingGets.has(cacheKey)) return pendingGets.get(cacheKey);

  const requestConfig = { ...config };
  delete requestConfig.skipCache;
  const request = originalGet(url, requestConfig)
    .then((response) => {
      getCache.set(cacheKey, response);
      return response;
    })
    .finally(() => pendingGets.delete(cacheKey));

  pendingGets.set(cacheKey, request);
  return request;
};

const wrapMutation = (request) => (...args) => {
  clearGetCache();
  return request(...args);
};

api.post = wrapMutation(originalPost);
api.put = wrapMutation(originalPut);
api.patch = wrapMutation(originalPatch);
api.delete = wrapMutation(originalDelete);

export default api;