"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password: pass }),
    });
    if (res.ok) {
      router.push("/");
    } else {
      const { message } = await res.json();
      setError(message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-8">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm"
      >
        <h1 className="text-2xl mb-6 text-center font-bold">Admin Login</h1>
        {error && (
          <p className="text-red-600 mb-4 text-center">{error}</p>
        )}
        <label className="block mb-2">
          <span className="text-sm font-medium">Username</span>
          <input
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
            required
          />
        </label>
        <label className="block mb-4">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="mt-1 block w-full border rounded px-3 py-2"
            required
          />
        </label>
        <button
          type="submit"
          className="w-full bg-black text-white py-2 rounded hover:opacity-80"
        >
          Sign In
        </button>
      </form>
    </div>
  );
}
