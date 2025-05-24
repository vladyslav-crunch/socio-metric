// src/hooks/useUser.ts
import { useQuery } from "@tanstack/react-query";

export const fetchUser = async () => {
  const token = localStorage.getItem("token"); // or sessionStorage
  if (!token) throw new Error("No token");

  const res = await fetch("https://your.api/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Unauthorized");
  return res.json(); // expected: { id, name, email, etc. }
};

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    retry: false,
  });
}
