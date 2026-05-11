"use client";

import { useEffect } from "react";
import { useNavigate, Navigate } from "react-router";
import { useAppData } from "../context/AppDataContext";

export function RoleSelector() {
  const navigate = useNavigate();
  const { currentUser } = useAppData();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login", { replace: true });
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const spec = (currentUser.specialty || "").toLowerCase();
  const canEditor = spec.includes("editor");
  const canPersonal = spec.replace(/editor/g, "").replace(/[^a-z]/g, "").length > 0;

  if (!canEditor && canPersonal) {
    return <Navigate to="/trabajador" replace />;
  }

  if (canEditor && !canPersonal) {
    return <Navigate to="/ediciones" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-600">Selección de vista</p>
              <h1 className="mt-4 text-3xl font-semibold text-slate-900">Elige tu perfil de trabajo</h1>
              <p className="mt-2 text-slate-500">Tu cuenta tiene permisos para editor y personal audiovisual. Selecciona la vista que deseas usar.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => navigate("/ediciones")}
                className="rounded-3xl border border-slate-200 bg-slate-950 px-6 py-8 text-left text-white transition hover:border-blue-500 hover:bg-blue-950"
              >
                <p className="text-lg font-semibold">Editor</p>
                <p className="mt-2 text-sm text-slate-300">Accede a la pantalla de ediciones con todos los controles y proyectos.</p>
              </button>
              <button
                type="button"
                onClick={() => navigate("/trabajador")}
                className="rounded-3xl border border-slate-200 bg-white px-6 py-8 text-left text-slate-900 transition hover:border-blue-500 hover:bg-slate-50"
              >
                <p className="text-lg font-semibold">Personal audiovisual</p>
                <p className="mt-2 text-sm text-slate-500">Revisa tu calendario, eventos asignados y datos personales.</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
