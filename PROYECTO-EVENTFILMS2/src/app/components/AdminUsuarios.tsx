"use client";

import { useMemo, useState } from "react";
import { Navigate } from "react-router";
import { useAppData } from "../context/AppDataContext";
import { Edit, KeyRound, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";

export function AdminUsuarios() {
  const {
    currentUser,
    users,
    personalList,
    createUser,
    createWorkerAccount,
    updateUser,
    deleteUser,
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
  const [directRole, setDirectRole] = useState<"admin" | "personal">("admin");
  const [directSpecialty, setDirectSpecialty] = useState("");
  const [directMessage, setDirectMessage] = useState("");

  const [editingUser, setEditingUser] = useState<any>(null);
  const [editUsername, setEditUsername] = useState("");
  
  const [resettingUser, setResettingUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");

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

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setEditUsername(user.username);
  };

  const saveEditUser = () => {
    if (editingUser && editUsername.trim() !== "") {
      updateUser(editingUser.id, { username: editUsername.trim() });
      setEditingUser(null);
    }
  };

  const handleResetPassword = (user: any) => {
    setResettingUser(user);
    setNewPassword("");
  };

  const saveResetPassword = () => {
    if (resettingUser && newPassword.trim() !== "") {
      updateUser(resettingUser.id, { password: newPassword.trim() });
      setResettingUser(null);
    }
  };

  const handleDeleteUser = (user: any) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar la cuenta de ${user.username}?`)) {
      deleteUser(user.id);
    }
  };

  const handleCreateWorker = () => {
    if (!workerPersonalId || !workerUsername || !workerPassword) {
      setWorkerMessage("Completa todos los campos para el personal.");
      return;
    }
    const result = createWorkerAccount(workerPersonalId, workerUsername.trim(), workerPassword.trim());
    if (result) {
      setWorkerMessage("Cuenta de personal creada con éxito.");
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
      specialty: directRole === "personal" ? directSpecialty.trim() : undefined,
    });
    if (result) {
      setDirectMessage("Cuenta creada exitosamente.");
      setDirectName("");
      setDirectLastName("");
      setDirectEmail("");
      setDirectUsername("");
      setDirectPassword("");
      setDirectSpecialty("");
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
          <h2 className="text-xl font-semibold text-slate-900">Crear cuenta para personal</h2>
          <p className="mt-2 text-sm text-slate-600">Selecciona un personal registrado y asocia un usuario y contraseña.</p>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-sm text-slate-700">Personal existente</span>
              <select
                value={workerPersonalId ?? ""}
                onChange={(event) => setWorkerPersonalId(Number(event.target.value) || undefined)}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none"
              >
                <option value="">Selecciona un personal</option>
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
              Crear cuenta de personal
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
                onChange={(event) => setDirectRole(event.target.value as "admin" | "personal")}
                className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none"
              >
                <option value="admin">Administrador</option>
                <option value="personal">Personal</option>
              </select>
            </label>
            {directRole === "personal" && (
              <label className="block">
                <span className="text-sm text-slate-700">Especialidad (Ej: Editor, Camarógrafo)</span>
                <input
                  value={directSpecialty}
                  onChange={(event) => setDirectSpecialty(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 outline-none"
                />
              </label>
            )}
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
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-4 py-4 text-slate-900">{user.username}</td>
                  <td className="px-4 py-4 text-slate-600">{user.nombres} {user.apellidos}</td>
                  <td className="px-4 py-4 text-slate-600">{user.roles.join(", ")}</td>
                  <td className="px-4 py-4 text-slate-600">{user.specialty ?? "N/A"}</td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="rounded-md p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition"
                        title="Editar usuario"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleResetPassword(user)}
                        className="rounded-md p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition"
                        title="Resetear contraseña"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="rounded-md p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica el nombre de usuario para la cuenta de {editingUser?.nombres}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm text-slate-700 mb-2">Nuevo nombre de usuario</label>
            <input
              value={editUsername}
              onChange={(e) => setEditUsername(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none"
              placeholder="Ej. nuevo_usuario"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <button className="rounded-2xl px-4 py-2 text-slate-600 hover:bg-slate-100 transition">
                Cancelar
              </button>
            </DialogClose>
            <button
              onClick={saveEditUser}
              className="rounded-2xl bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-500"
            >
              Guardar cambios
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={!!resettingUser} onOpenChange={(open) => !open && setResettingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resetear Contraseña</DialogTitle>
            <DialogDescription>
              Ingresa una nueva contraseña segura para el usuario {resettingUser?.username}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="block text-sm text-slate-700 mb-2">Nueva contraseña</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none"
              placeholder="********"
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <button className="rounded-2xl px-4 py-2 text-slate-600 hover:bg-slate-100 transition">
                Cancelar
              </button>
            </DialogClose>
            <button
              onClick={saveResetPassword}
              className="rounded-2xl bg-amber-500 px-5 py-2 text-white transition hover:bg-amber-400"
            >
              Actualizar contraseña
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
