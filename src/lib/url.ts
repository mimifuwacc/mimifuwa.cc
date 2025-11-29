export function currentUrl() {
  const isDevelopment = process.env.NODE_ENV === "development";

  if (isDevelopment) {
    return "http://localhost:3000";
  }

  return "https://mimifuwa.cc";
}
