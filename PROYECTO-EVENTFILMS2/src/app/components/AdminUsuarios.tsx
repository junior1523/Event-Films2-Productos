"use client";

import { useMemo, useState } from "react";
import { Navigate } from "react-router";
import { useAppData } from "../context/AppDataContext";

export function AdminUsuarios() {
  const {
    currentUser,
    users,
    personalList,
    createUser,
    createWorkerAccount,
  } = useAppData();

  const [workerPersonalId, setWorkerPersonalId] = useState<number | undefined>(undefined);
  const [workerUsername, setWorkerUsername] = useState("");
  const [workerPassword, setWorkerPassword] = useState("");
  const [workerMessage, setWorkerMessage] = useState("");

  const [directName, setDirectName] = useState("");
  const [directLastName, setDirectLastName] = useState("");
  const [directEmail, setDirectEmail] = useState("");
  const [directUsername, setDirectUsername] = useState("");
  const [directPassword, setDirectPassword] = useState("");
  const [directRole, setDirectRole] = useState<"admin" | "editor" | "personal">("admin");
  const [directMessage, setDirectMessage] = useState("");

  if (!currentUser || !currentUser.roles.includes("admin")) {
    return <Navigate to="/login" replace />;
  }

  const availablePersonal = useMemo(
    () =>
      personalList.filter(
        (member) => !users.some((user) => user.personalId === member.id)
      ),
    [personalList, users]
  );

  const handleCreateWorker = () => {
    if (!workerPersonalId || !workerUsername || !workerPassword) {
      setWorkerMessage("Completa todos los campos para el trabajador.");
      return;
    }
    const result = createWorkerAccount(workerPersonalId, workerUsername.trim(), workerPassword.trim());
    if (result) {
      setWorkerMessage("Cuenta de trabajador creada con éxito.");
      setWorkerUsername("");
      setWorkerPassword("");
      setWorkerPersonalId(undefined);
    } else {
      setWorkerMessage("No se pudo crear la cuenta; revisa los datos o el usuario ya existe.");
    }
  };

  const handleCreateDirect = () => {
    if (!directName || !directLastName || !directEmail || !directUsername || !directPassword) {
      setDirectMessage("Completa todos los campos para la cuenta directa.");
      return;
    }
    const result = createUser({
      username: directUsername.trim(),
      password: directPassword.trim(),
      roles: [directRole],
      nombres: directName.trim(),
      apellidos: directLastName.trim(),
      email: directEmail.trim(),
      personalId: undefined,
      specialty: directRole === "personal" ? "Personal audiovisual" : undefined,
    });
    if (result) {
      setDirectMessage("Cuenta creada exitosamente.");
      setDirectName("");
      setDirectLastName("");
      setDirectEmail("");
      setDirectUsername("");
      setDirectPassword("");
    } else {
      setDirectMessage("El usuario ya existe o no se pudo crear la cuenta.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Usuarios</h1>
            <p className="mt-2 text-slate-500">Administra las cuentas de administradores, editores y personal audiovisual.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Crear cuenta de trabajador</h2>
          <p className="mt-2 text-sm text-slate-600">Selecciona un trabajador registrado y asocia un usuario y contraseña.</p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm text-slate-700">Trabajador existente</span>
              <select
                value={workerPersonalId ?? ""}
                onChange={(event) => setWorkerPersonalId(Number(event.target.value) || undefined)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none"
              >
                <option value="">Selecciona un trabajador</option>
                {availablePersonal.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.nombres} {member.apellidos} — {member.rol}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-slate-700">Usuario</span>
              <input
                value={workerUsername}
                onChange={(event) => setWorkerUsername(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none"
                placeholder="camarografo1"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700">Contraseña</span>
              <input
                type="password"
                value={workerPassword}
                onChange={(event) => setWorkerPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none"
                placeholder="********"
              />
            </label>
            <button
              type="button"
              onClick={handleCreateWorker}
              className="mt-4 rounded-2xl bg-blue-600 px-5 py-3 text-white transition hover:bg-blue-500"
            >
              Crear cuenta de trabajador
            </button>
            {workerMessage ? (
              <p className="text-sm text-slate-600">{workerMessage}</p>
            ) : null}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Crear cuenta directa</h2>
          <p className="mt-2 text-sm text-slate-600">Elige el rol y completa los datos personales, usuario y contraseña.</p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm text-slate-700">Nombre</span>
              <input
                value={directName}
                onChange={(event) => setDirectName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700">Apellido</span>
              <input
                value={directLastName}
                onChange={(event) => setDirectLastName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700">Correo electrónico</span>
              <input
                type="email"
                value={directEmail}
                onChange={(event) => setDirectEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700">Rol</span>
              <select
                value={directRole}
                onChange={(event) => setDirectRole(event.target.value as "admin" | "editor" | "personal")}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none"
              >
                <option value="admin">Administrador</option>
                <option value="editor">Editor</option>
                <option value="personal">Personal audiovisual</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-slate-700">Usuario</span>
              <input
                value={directUsername}
                onChange={(event) => setDirectUsername(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-700">Contraseña</span>
              <input
                type="password"
                value={directPassword}
                onChange={(event) => setDirectPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none"
              />
            </label>
            <button
              type="button"
              onClick={handleCreateDirect}
              className="mt-4 rounded-2xl bg-slate-900 px-5 py-3 text-white transition hover:bg-slate-700"
            >
              Crear cuenta directa
            </button>
            {directMessage ? (
              <p className="text-sm text-slate-600">{directMessage}</p>
            ) : null}
          </div>
        </section>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Cuentas existentes</h2>
          <span className="rounded-full bg-blue-500 px-3 py-1 text-sm font-semibold text-white">
            {users.length} cuentas
          </span>
        </div>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Especialidad</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-4 text-slate-900">{user.username}</td>
                  <td className="px-4 py-4 text-slate-600">{user.nombres} {user.apellidos}</td>
                  <td className="px-4 py-4 text-slate-600">{user.roles.join(", ")}</td>
                  <td className="px-4 py-4 text-slate-600">{user.specialty ?? "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
