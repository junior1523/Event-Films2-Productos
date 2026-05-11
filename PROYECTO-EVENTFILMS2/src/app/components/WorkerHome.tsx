"use client";

import { useMemo } from "react";
import { Navigate } from "react-router";
import { useAppData } from "../context/AppDataContext";

export function WorkerHome() {
  const { currentUser, personalList, horarioEventos } = useAppData();

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!currentUser.roles.includes("personal")) {
    return <Navigate to="/ediciones" replace />;
  }

  const assignedMember = personalList.find(
    (member) => member.id === currentUser.personalId
  );

  const allEvents = useMemo(
    () => Object.values(horarioEventos).flat(),
    [horarioEventos]
  );

  const assignedEvents = useMemo(() => {
    if (!assignedMember) return allEvents;
    const matches = allEvents.filter((event) =>
      event.personal.some((person) =>
        person.toLowerCase().includes(assignedMember.nombres.toLowerCase()) ||
        person.toLowerCase().includes(assignedMember.apellidos.toLowerCase())
      )
    );
    return matches.length > 0 ? matches : allEvents;
  }, [allEvents, assignedMember]);

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">Personal audiovisual</p>
            <h1 className="mt-3 text-3xl font-semibold text-slate-900">Panel de trabajador</h1>
            <p className="mt-2 text-slate-600">Aquí puedes revisar tu información, calendario y próximos eventos.</p>
          </div>
          <div className="rounded-3xl bg-slate-950 px-6 py-4 text-white shadow-sm">
            <p className="text-sm text-slate-300">Rol asignado</p>
            <p className="mt-1 text-2xl font-semibold text-white">{currentUser.specialty ?? "Personal audiovisual"}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_0.95fr]">
        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Tus datos</h2>
          {assignedMember ? (
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Nombre</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">{assignedMember.nombres} {assignedMember.apellidos}</p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Especialidad</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">{assignedMember.rol}</p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Disponibilidad</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">{assignedMember.disponibilidad}</p>
              </div>
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Eventos asignados</p>
                <p className="mt-3 text-lg font-semibold text-slate-900">{assignedMember.eventosAsignados}</p>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-slate-600">No hay información de personal registrada para esta cuenta.</p>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Tus eventos asignados</h2>
          <p className="mt-2 text-sm text-slate-500">Los eventos programados para tu equipo.</p>
          <div className="mt-6 space-y-4">
            {assignedEvents.length > 0 ? (
              assignedEvents.slice(0, 6).map((event) => (
                <article key={event.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-500">{event.tipo}</p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-900">{event.titulo}</h3>
                      <p className="mt-1 text-sm text-slate-600">Cliente: {event.cliente}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500">Horario</p>
                      <p className="mt-1 text-lg font-semibold text-slate-900">{event.startTime} – {event.endTime}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
                    <span className="rounded-full bg-slate-100 px-3 py-1">Lugar: {event.ubicacion || "Por definir"}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1">Duración: {event.duracion}</span>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
                No se encontraron eventos asignados. Revisa tu calendario para ver próximas fechas.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
