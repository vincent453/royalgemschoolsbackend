export const loginAdmin = async (form) => {
  const res = await fetch("http://localhost:5000/api/admin/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(form),
  });

  const data = await res.json();

  // 🔥 IMPORTANT: force proper error handling
  if (!res.ok) {
    return {
      success: false,
      message: data.message || "Login failed",
    };
  }

  return data;
};