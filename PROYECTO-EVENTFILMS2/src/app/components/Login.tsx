"use client";

import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAppData } from "../context/AppDataContext";

export function Login() {
  const navigate = useNavigate();
  const { currentUser, login } = useAppData();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const getRedirectPath = (user: any) => {
    if (user.roles.includes("admin")) return "/";
    if (user.roles.includes("personal")) {
      const spec = (user.specialty || "").toLowerCase();
      const isEditor = spec.includes("editor");
      const isOther = spec.replace(/editor/g, "").replace(/[^a-z]/g, "").length > 0;
      
      if (isEditor && isOther) return "/seleccionar-rol";
      if (isEditor) return "/ediciones";
      return "/trabajador";
    }
    return "/";
  };

  useEffect(() => {
    if (currentUser) {
      navigate(getRedirectPath(currentUser), { replace: true });
    }
  }, [currentUser, navigate]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const user = login(username.trim(), password.trim());
    if (!user) {
      setError("Usuario o contraseña incorrectos.");
      return;
    }
    navigate(getRedirectPath(user), { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-slate-900/95 border border-slate-700 rounded-3xl shadow-2xl p-8 backdrop-blur-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
            E
          </div>
          <h1 className="text-3xl font-semibold">Iniciar sesión</h1>
          <p className="mt-2 text-slate-400">
            Ingresa tu usuario y contraseña para continuar.
          </p>
        </div>

        <div className="space-y-4">
          {error ? (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm text-slate-300">Usuario</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                placeholder="Usuario"
                autoComplete="username"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-300">Contraseña</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-blue-500"
                placeholder="Contraseña"
                autoComplete="current-password"
              />
            </label>
            <button
              type="submit"
              className="w-full rounded-2xl bg-blue-500 px-4 py-3 text-base font-semibold text-white transition hover:bg-blue-400"
            >
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
