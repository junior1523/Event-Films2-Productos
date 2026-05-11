"use client";

import { useMemo, useState } from "react";
import { Navigate } from "react-router";
import { useAppData } from "../context/AppDataContext";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
                <p className="mt-3 text-lg font-semibold text-slate-900">{assignedEvents.length}</p>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-slate-600">No hay información de personal registrada para esta cuenta.</p>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Mi calendario</h2>
          
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 capitalize">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex gap-2">
              <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
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
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Tus eventos asignados</h2>
          <p className="mt-2 text-sm text-slate-500">Los eventos programados para tu equipo.</p>
          <div className="mt-6 space-y-4">
            {assignedEvents.length > 0 ? (
              assignedEvents.map((event) => (
                <article key={event.id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between hover:border-blue-300 transition">
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
