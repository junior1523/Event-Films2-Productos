"use client";

import { useMemo, useState } from "react";
import { Navigate } from "react-router";
import { useAppData } from "../context/AppDataContext";
import { ChevronLeft, ChevronRight, UserCircle } from "lucide-react";

export function WorkerHome() {
  const { currentUser, personalList, horarioEventos } = useAppData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

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
    if (!assignedMember) return [];
    
    const fullName = `${assignedMember.nombres} ${assignedMember.apellidos}`.trim().toLowerCase();
    
    const matches = allEvents.filter((event) =>
      event.personal.some((person) =>
        person.trim().toLowerCase() === fullName
      )
    );

    const uniqueMatches: typeof allEvents = [];
    const seenIds = new Set<number>();
    for (const match of matches) {
      if (!seenIds.has(match.id)) {
        seenIds.add(match.id);
        uniqueMatches.push(match);
      }
    }
    return uniqueMatches;
  }, [allEvents, assignedMember]);

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getEventosForDate = (dateToMatch: Date) => {
    return assignedEvents.filter((e) => {
      const dateKey = `${dateToMatch.getFullYear()}-${String(dateToMatch.getMonth() + 1).padStart(2, "0")}-${String(dateToMatch.getDate()).padStart(2, "0")}`;
      const eventsOnDay = horarioEventos[dateKey] || [];
      return eventsOnDay.some(dayEvent => dayEvent.id === e.id);
    });
  };

  return (
    <div className="space-y-8">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 p-8 shadow-2xl shadow-slate-900/10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Panel de trabajador</p>
            <h1 className="mt-4 text-4xl font-semibold text-white sm:text-5xl">Bienvenido de nuevo, {assignedMember?.nombres || currentUser.username}</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-300">Accede rápidamente a tu información, calendario y eventos asignados desde un espacio limpio, moderno y enfocado en tus tareas.</p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-700 bg-slate-950/90 px-6 py-5 text-white shadow-xl shadow-slate-950/20 backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Rol asignado</p>
            <p className="mt-3 text-2xl font-semibold text-white">{currentUser.specialty ?? "Personal audiovisual"}</p>
            <p className="mt-2 text-sm text-slate-400">{assignedMember ? assignedMember.disponibilidad : "Disponibilidad no registrada"}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_0.95fr]">
        <section className="rounded-[2rem] border border-slate-200 bg-slate-50 p-6 shadow-lg shadow-slate-900/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Tu perfil</h2>
              <p className="mt-1 text-sm text-slate-500">Información personal y estado de asignación.</p>
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm border border-slate-200">Activo</div>
          </div>
          {assignedMember ? (
            <div className="mt-8 space-y-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="relative flex-shrink-0">
                  {assignedMember.foto ? (
                    <img
                      src={assignedMember.foto}
                      alt={`${assignedMember.nombres} ${assignedMember.apellidos}`}
                      className="h-24 w-24 rounded-[1.5rem] object-cover shadow-xl ring-2 ring-white"
                    />
                  ) : (
                    <div
                      className="flex h-24 w-24 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-slate-800 to-slate-700 text-3xl font-bold text-white shadow-xl ring-2 ring-white"
                    >
                      <span className="text-2xl font-bold text-white select-none">
                        {assignedMember.nombres.charAt(0)}{assignedMember.apellidos.charAt(0)}
                      </span>
                    </div>
                  )}
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white bg-green-400 shadow" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">
                    {assignedMember.nombres} {assignedMember.apellidos}
                  </p>
                  <p className="text-sm text-slate-500">{assignedMember.rol}</p>
                </div>
              </div>

              {/* Datos en grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] bg-white p-5 shadow-sm border border-slate-200">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Eventos asignados</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-900">{assignedEvents.length}</p>
                </div>
                <div className="rounded-[1.5rem] bg-white p-5 shadow-sm border border-slate-200">
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Próximo evento</p>
                  <p className="mt-4 text-lg font-semibold text-slate-900">{assignedEvents[0]?.titulo ?? "Sin evento próximo"}</p>
                  {assignedEvents[0] && <p className="mt-2 text-sm text-slate-600">{assignedEvents[0].fechaInicio ?? "Fecha no definida"}</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-slate-600">No hay información de personal registrada para esta cuenta.</p>
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Mi calendario</h2>
              <p className="mt-1 text-sm text-slate-500">Revisa tus días ocupados y próximos compromisos.</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              <span className="font-semibold text-slate-900">{monthNames[currentDate.getMonth()]}</span>
              <span>{currentDate.getFullYear()}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 shadow-sm">
              <button onClick={previousMonth} className="rounded-full p-2 transition-colors hover:bg-slate-100">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="font-medium text-slate-800">Cambiar mes</span>
              <button onClick={nextMonth} className="rounded-full p-2 transition-colors hover:bg-slate-100">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            <div className="text-sm text-slate-500">Selecciona un día para ver tus eventos.</div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-600 py-2 uppercase">
                {day}
              </div>
            ))}
            {Array.from({ length: firstDayOfMonth }, (_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              const eventosDelDia = getEventosForDate(date);
              const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === currentDate.getMonth() && selectedDate?.getFullYear() === currentDate.getFullYear();

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(date)}
                  className={`aspect-square p-2 rounded-lg transition-colors relative flex items-start justify-center ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : eventosDelDia.length
                      ? "bg-blue-50 hover:bg-blue-100 text-gray-900 border border-blue-200"
                      : "hover:bg-gray-100 text-gray-900"
                  }`}
                >
                  <span className="text-sm font-medium">{day}</span>
                  {eventosDelDia.length > 0 && (
                    <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                      {eventosDelDia.slice(0, 3).map((evento, idx) => (
                        <div key={idx} className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : evento.color}`}></div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div className="grid gap-6">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Tus eventos asignados</h2>
              <p className="mt-1 text-sm text-slate-500">Los eventos programados para tu equipo.</p>
            </div>
            <div className="rounded-full bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 border border-slate-200">Total {assignedEvents.length}</div>
          </div>
          <div className="mt-6 space-y-4">
            {assignedEvents.length > 0 ? (
              assignedEvents.map((event) => (
                <article key={event.id} className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{event.tipo}</p>
                    <h3 className="mt-2 text-lg font-semibold text-slate-900">{event.titulo}</h3>
                    <p className="mt-1 text-sm text-slate-600">Cliente: {event.cliente}</p>
                  </div>
                  <div className="text-right sm:text-right text-left">
                    <p className="text-sm text-slate-500">Horario</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{event.startTime} – {event.endTime}</p>
                  </div>
                  <div className="mt-4 sm:mt-0 flex flex-wrap gap-2 text-sm text-slate-600 sm:justify-end">
                    <span className="rounded-full bg-slate-100 px-3 py-1 border border-slate-200">Lugar: {event.ubicacion || "Por definir"}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 border border-slate-200">Duración: {event.duracion}</span>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-slate-600 text-center py-12">
                No tienes eventos asignados en este momento. Revisa tu calendario para actualizaciones futuras.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
