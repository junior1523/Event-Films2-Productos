"use client";

import { Navigate } from "react-router";
import { useAppData } from "../context/AppDataContext";

export function Profile() {
  const { currentUser, personalList } = useAppData();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const personalMember = currentUser.personalId
    ? personalList.find((member) => member.id === currentUser.personalId)
    : undefined;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.22em] text-blue-600">Perfil</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Información de cuenta</h1>
            <p className="mt-2 text-slate-600">Revisa los datos asociados a tu sesión y tu perfil.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Cuenta</h2>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Usuario</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{currentUser.username}</p>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Rol</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{currentUser.roles.join(", ")}</p>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Email</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{currentUser.email || "No registrado"}</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Datos personales</h2>
          {personalMember ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Nombre completo</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{personalMember.nombres} {personalMember.apellidos}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Especialidades</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{personalMember.especialidades.join(", ")}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Teléfono</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{personalMember.telefono}</p>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl bg-slate-50 p-6 text-slate-600">
              Esta cuenta no está ligada a un trabajador registrado.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
