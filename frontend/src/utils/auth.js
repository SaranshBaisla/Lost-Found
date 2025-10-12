export const isLoggedIn = () => !!localStorage.getItem("token");
export const getUser = () => JSON.parse(localStorage.getItem("user"));
export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
