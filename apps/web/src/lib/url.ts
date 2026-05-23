export function currentUrl() {
  const isDevelopment = import.meta.env.DEV;
  if (isDevelopment) {
    return "http://localhost:5173";
  }
  return "https://mimifuwa.cc";
}
