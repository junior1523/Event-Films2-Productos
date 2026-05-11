import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Eye,
  Edit,
  Trash2,
  UserCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useAppData } from "../context/AppDataContext";

interface Evento {
  id: number;
  titulo: string;
  cliente: string;
  tipo: string;
  startTime: string;
  endTime: string;
  duracion: string;
  ubicacion: string;
  descripcion?: string;
  personal: string[];
  color: string;
}

interface EventoFormState {
  id: number;
  titulo: string;
  cliente: string;
  tipo: string;
  ubicacion: string;
  date: string;
  startHour: string;
  startMinute: string;
  startPeriod: string;
  endHour: string;
  endMinute: string;
  endPeriod: string;
  personal: string[];
  color: string;
}



const timeOptions = {
  hours: Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")),
  minutes: ["00", "15", "30", "45"],
  periods: ["AM", "PM"],
};

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

const defaultEventoForm: EventoFormState = {
  id: 0,
  titulo: "",
  cliente: "",
  tipo: "",
  ubicacion: "",
  date: dateKey(new Date()),
  startHour: "08",
  startMinute: "00",
  startPeriod: "AM",
  endHour: "05",
  endMinute: "00",
  endPeriod: "PM",
  personal: [],
  color: "bg-blue-500",
};

const parseDateFromISO = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const computeDuration = (startTime: string, endTime: string) => {
  const parse = (value: string) => {
    const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return null;
    const [, hourText, minuteText, periodText] = match;
    const hour = Number(hourText);
    const minute = Number(minuteText);
    const period = periodText.toUpperCase();
    const totalMinutes = (hour % 12 + (period === "PM" ? 12 : 0)) * 60 + minute;
    return { totalMinutes, hour, minute, period };
  };

  const start = parse(startTime);
  const end = parse(endTime);
  if (!start || !end) return "Por definir";

  let diff = end.totalMinutes - start.totalMinutes;
  if (diff < 0) {
    if (start.period === "PM" && end.period === "PM" && end.hour <= 8) {
      const endAsNextDayAM = (end.hour % 12) * 60 + end.minute;
      diff = endAsNextDayAM + 24 * 60 - start.totalMinutes;
    } else {
      diff += 24 * 60;
    }
  }

  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return `${hours} hrs${minutes ? ` ${minutes} min` : ""}`;
};

export function Horarios() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // April 2026
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const [selectedExistingEventId, setSelectedExistingEventId] = useState<number | null>(null);
  const [eventoForm, setEventoForm] = useState<EventoFormState>(defaultEventoForm);
  const { horarioEventos, setHorarioEventos, setEdiciones, personalList } = useAppData();
  const eventos = horarioEventos as Record<string, Evento[]>;
  const availablePersonal = personalList.map((member) => `${member.nombres} ${member.apellidos}`);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const getEventosForDate = (date: Date): Evento[] => {
    return eventos[dateKey(date)] || [];
  };

  const hasEvents = (day: number): boolean => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    return getEventosForDate(date).length > 0;
  };

  const openDialogForDate = (date: Date, evento?: Evento) => {
    setSelectedDate(date);
    if (evento) {
      setEditingEvento(evento);
      setSelectedExistingEventId(evento.id);
      const [, startHours, startMins, startPeriod] = evento.startTime.match(/(\d{2}):(\d{2})\s(AM|PM)/)!;
      const [, endHours, endMins, endPeriod] = evento.endTime.match(/(\d{2}):(\d{2})\s(AM|PM)/)!;
      setEventoForm({
        id: evento.id,
        titulo: evento.titulo,
        cliente: evento.cliente,
        tipo: evento.tipo,
        ubicacion: evento.ubicacion,
        date: dateKey(date),
        startHour: startHours,
        startMinute: startMins,
        startPeriod,
        endHour: endHours,
        endMinute: endMins,
        endPeriod,
        personal: evento.personal,
        color: evento.color,
      });
    } else {
      setEditingEvento(null);
      setSelectedExistingEventId(null);
      setEventoForm({ ...defaultEventoForm, date: dateKey(date) });
    }
    setIsDialogOpen(true);
  };

  const handleDateClick = (day: number) => {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    );
    setSelectedDate(date);
  };

  const handleSelectExistingEvent = (evento: Evento) => {
    setSelectedExistingEventId(evento.id);
    setEventoForm((prev) => ({
      ...prev,
      id: evento.id,
      titulo: evento.titulo,
      cliente: evento.cliente,
      tipo: evento.tipo || prev.tipo,
      ubicacion: evento.ubicacion,
      personal: evento.personal,
      startHour: evento.startTime.slice(0, 2),
      startMinute: evento.startTime.slice(3, 5),
      startPeriod: evento.startTime.slice(6),
      endHour: evento.endTime.slice(0, 2),
      endMinute: evento.endTime.slice(3, 5),
      endPeriod: evento.endTime.slice(6),
    }));
  };

  const selectedDateEvents = selectedDate ? getEventosForDate(selectedDate) : [];
  const formDateEvents = getEventosForDate(parseDateFromISO(eventoForm.date));
  const selectedExistingEvent = formDateEvents.find(
    (evento) => evento.id === selectedExistingEventId
  );
  const totalEventos = Object.values(eventos).flat().length;

  const saveEvento = () => {
    const selectedDateValue = parseDateFromISO(eventoForm.date);
    if (isNaN(selectedDateValue.getTime())) return;

    const startTime = `${eventoForm.startHour}:${eventoForm.startMinute} ${eventoForm.startPeriod}`;
    const endTime = `${eventoForm.endHour}:${eventoForm.endMinute} ${eventoForm.endPeriod}`;
    const duracion = computeDuration(startTime, endTime);

    const nuevoEvento: Evento = {
      id: eventoForm.id || (Math.max(0, ...Object.values(horarioEventos).flat().map((e) => (e as Evento).id)) + 1),
      titulo: eventoForm.titulo,
      cliente: eventoForm.cliente,
      tipo: eventoForm.tipo,
      startTime,
      endTime,
      duracion,
      ubicacion: eventoForm.ubicacion,
      personal: eventoForm.personal,
      color: eventoForm.color,
    };

    setHorarioEventos((prev) => {
      const newKey = dateKey(selectedDateValue);
      const currentKey = selectedDate ? dateKey(selectedDate) : newKey;
      const nextState = { ...prev };

      if (currentKey !== newKey) {
        nextState[currentKey] = (prev[currentKey] ?? []).filter(
          (evento) => evento.id !== nuevoEvento.id,
        );
      }

      nextState[newKey] = [
        ...((prev[newKey] ?? []).filter((evento) => evento.id !== nuevoEvento.id)),
        nuevoEvento,
      ];

      return nextState;
    });

    setEdiciones((prev) => {
      const updatedEdicion: typeof prev[number] = {
        id: nuevoEvento.id,
        evento: nuevoEvento.titulo,
        cliente: nuevoEvento.cliente,
        editor: "Equipo de filmación A",
        fechaInicio: dateKey(selectedDateValue),
        fechaEntrega: dateKey(selectedDateValue),
        progreso: 0,
        estado: "Sin Iniciar",
        prioridad: "Media",
        duracionEstimada: nuevoEvento.duracion,
      };

      if (
        prev.some(
          (edicion) =>
            edicion.id === nuevoEvento.id || edicion.evento === nuevoEvento.titulo,
        )
      ) {
        return prev.map((edicion) =>
          edicion.id === nuevoEvento.id || edicion.evento === nuevoEvento.titulo
            ? { ...edicion, ...updatedEdicion }
            : edicion,
        );
      }

      return [...prev, updatedEdicion];
    });

    setSelectedDate(selectedDateValue);
    setEventoForm({ ...defaultEventoForm, date: dateKey(selectedDateValue) });
    setEditingEvento(null);
    setSelectedExistingEventId(null);
    setIsDialogOpen(false);
  };

  const getCurrentDialogDate = () => {
    const date = parseDateFromISO(eventoForm.date);
    return isNaN(date.getTime()) ? selectedDate || currentDate : date;
  };

  const deleteEvento = (eventoId: number) => {
    if (!selectedDate) return;
    setHorarioEventos((prev) => {
      const key = dateKey(selectedDate);
      return {
        ...prev,
        [key]: prev[key].filter((evento) => evento.id !== eventoId),
      };
    });
    setIsDialogOpen(false);
  };

  const togglePersonal = (nombre: string) => {
    setEventoForm((current) => ({
      ...current,
      personal: current.personal.includes(nombre)
        ? current.personal.filter((item) => item !== nombre)
        : [...current.personal, nombre],
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Horarios</h1>
          <p className="mt-1 text-gray-600">
            Calendario de eventos y disponibilidad del personal
          </p>
        </div>
        <Button onClick={() => openDialogForDate(selectedDate || currentDate)}>
          <Plus className="w-5 h-5 mr-2" />
          Designar Personal
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="text-sm text-gray-600">Eventos Este Mes</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{totalEventos}</div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="text-sm text-gray-600">Próximo Evento</div>
          <div className="text-lg font-bold text-blue-600 mt-1">5 de Abril</div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="text-sm text-gray-600">Personal Disponible</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{availablePersonal.length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={previousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Days of week */}
            {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-gray-600 py-2"
              >
                {day}
              </div>
            ))}

            {/* Empty cells for days before month starts */}
            {Array.from({ length: firstDayOfMonth }, (_, i) => (
              <div key={`empty-${i}`} className="aspect-square"></div>
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }, (_, i) => {
              const day = i + 1;
              const date = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                day
              );
              const eventosDelDia = getEventosForDate(date);
              const isSelected =
                selectedDate?.getDate() === day &&
                selectedDate?.getMonth() === currentDate.getMonth();

              return (
                <button
                  key={day}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square p-2 rounded-lg transition-colors relative ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : eventosDelDia.length
                      ? "bg-blue-50 hover:bg-blue-100 text-gray-900"
                      : "hover:bg-gray-100 text-gray-900"
                  }`}
                >
                  <span className="text-sm font-medium">{day}</span>
                  {eventosDelDia.length > 0 && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                      {eventosDelDia.slice(0, 3).map((evento, idx) => (
                        <div
                          key={idx}
                          className={`w-1 h-1 rounded-full ${
                            isSelected ? "bg-white" : evento.color
                          }`}
                        ></div>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Event Details Sidebar */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            {selectedDate
              ? `${selectedDate.getDate()} ${
                  monthNames[selectedDate.getMonth()]
                }`
              : "Selecciona una fecha"}
          </h3>

          {selectedDateEvents.length > 0 ? (
            <div className="space-y-4">
              {selectedDateEvents.map((evento) => (
                <div
                  key={evento.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <span className={`w-2 h-2 rounded-full ${evento.color}`}></span>
                        <span>{evento.tipo}</span>
                      </div>
                      <h4 className="font-semibold text-gray-900">{evento.titulo}</h4>
                      <p className="text-sm text-gray-600">{evento.cliente}</p>
                      <p className="text-sm text-gray-600 mt-3">
                        <span className="font-medium">Horario:</span> {evento.startTime} - {evento.endTime}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Lugar:</span> {evento.ubicacion}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Duración:</span> {evento.duracion}
                      </p>
                      <div className="mt-3 text-sm text-gray-600">
                        <span className="font-medium">Personal:</span>
                        <div className="mt-1 space-y-1 text-xs">
                          {evento.personal.map((persona, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                              <UserCircle className="w-3.5 h-3.5 text-gray-400" />
                              <span>{persona}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openDialogForDate(selectedDate!, evento)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => deleteEvento(evento.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Borrar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {selectedDate
                ? "No hay eventos programados para este día"
                : "Haz clic en una fecha del calendario para ver eventos"}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvento ? "Editar evento" : "Designar personal"}
            </DialogTitle>
            <DialogDescription>
              Asigna el personal y define los horarios para {eventoForm.date ? new Date(eventoForm.date).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }) : "la fecha seleccionada"}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="fechaEvento">Fecha del evento</Label>
              <Input
                id="fechaEvento"
                type="date"
                value={eventoForm.date}
                onChange={(event) => {
                  const nextDate = event.target.value;
                  setEventoForm((prev) => ({ ...prev, date: nextDate }));
                  setSelectedDate(new Date(nextDate));
                }}
              />
            </div>
            {formDateEvents.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-slate-50 p-4">
                <div className="text-sm font-semibold text-gray-900 mb-2">
                  Eventos existentes ese día
                </div>
                <div className="max-h-56 overflow-y-auto space-y-2 text-sm text-gray-700">
                  {formDateEvents.map((evento) => (
                    <button
                      key={evento.id}
                      type="button"
                      onClick={() => handleSelectExistingEvent(evento)}
                      className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                        selectedExistingEventId === evento.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-transparent hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-gray-900">{evento.titulo}</span>
                        <span className="text-xs text-gray-500">{evento.startTime}</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {evento.tipo} · {evento.ubicacion}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {selectedExistingEvent && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-blue-900">
                      {selectedExistingEvent.titulo}
                    </div>
                    <div className="text-xs text-blue-700">
                      {selectedExistingEvent.tipo} · {selectedExistingEvent.ubicacion}
                    </div>
                  </div>
                  <span className="text-xs text-blue-700">
                    {selectedExistingEvent.startTime} - {selectedExistingEvent.endTime}
                  </span>
                </div>
                <p className="mt-3 text-sm text-blue-800">
                  {selectedExistingEvent.descripcion}
                </p>
                <div className="mt-3 text-sm text-blue-800">
                  <span className="font-semibold">Personal asignado:</span>
                  <ul className="mt-2 space-y-1 text-xs">
                    {selectedExistingEvent.personal.map((persona) => (
                      <li key={persona}>• {persona}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="titulo">Título del evento</Label>
              <Input
                id="titulo"
                value={eventoForm.titulo}
                onChange={(event) =>
                  setEventoForm((prev) => ({ ...prev, titulo: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="cliente">Cliente</Label>
              <Input
                id="cliente"
                value={eventoForm.cliente}
                onChange={(event) =>
                  setEventoForm((prev) => ({ ...prev, cliente: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="tipo">Tipo de evento</Label>
              <Input
                id="tipo"
                value={eventoForm.tipo}
                onChange={(event) =>
                  setEventoForm((prev) => ({ ...prev, tipo: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ubicacion">Ubicación</Label>
              <Input
                id="ubicacion"
                value={eventoForm.ubicacion}
                onChange={(event) =>
                  setEventoForm((prev) => ({ ...prev, ubicacion: event.target.value }))
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Hora de inicio</Label>
                <div className="flex gap-2">
                  <select
                    className="rounded-lg border px-3 py-2"
                    value={eventoForm.startHour}
                    onChange={(event) =>
                      setEventoForm((prev) => ({ ...prev, startHour: event.target.value }))
                    }
                  >
                    {timeOptions.hours.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </select>
                  <select
                    className="rounded-lg border px-3 py-2"
                    value={eventoForm.startMinute}
                    onChange={(event) =>
                      setEventoForm((prev) => ({ ...prev, startMinute: event.target.value }))
                    }
                  >
                    {timeOptions.minutes.map((minute) => (
                      <option key={minute} value={minute}>
                        {minute}
                      </option>
                    ))}
                  </select>
                  <select
                    className="rounded-lg border px-3 py-2"
                    value={eventoForm.startPeriod}
                    onChange={(event) =>
                      setEventoForm((prev) => ({ ...prev, startPeriod: event.target.value }))
                    }
                  >
                    {timeOptions.periods.map((period) => (
                      <option key={period} value={period}>
                        {period}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">Hora de fin</Label>
                <div className="flex gap-2">
                  <select
                    className="rounded-lg border px-3 py-2"
                    value={eventoForm.endHour}
                    onChange={(event) =>
                      setEventoForm((prev) => ({ ...prev, endHour: event.target.value }))
                    }
                  >
                    {timeOptions.hours.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}
                      </option>
                    ))}
                  </select>
                  <select
                    className="rounded-lg border px-3 py-2"
                    value={eventoForm.endMinute}
                    onChange={(event) =>
                      setEventoForm((prev) => ({ ...prev, endMinute: event.target.value }))
                    }
                  >
                    {timeOptions.minutes.map((minute) => (
                      <option key={minute} value={minute}>
                        {minute}
                      </option>
                    ))}
                  </select>
                  <select
                    className="rounded-lg border px-3 py-2"
                    value={eventoForm.endPeriod}
                    onChange={(event) =>
                      setEventoForm((prev) => ({ ...prev, endPeriod: event.target.value }))
                    }
                  >
                    {timeOptions.periods.map((period) => (
                      <option key={period} value={period}>
                        {period}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Personal asignado</Label>
              <div className="grid gap-2">
                {availablePersonal.map((nombre) => (
                  <button
                    key={nombre}
                    type="button"
                    onClick={() => togglePersonal(nombre)}
                    className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                      eventoForm.personal.includes(nombre)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {nombre}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            {editingEvento && (
              <Button
                variant="outline"
                className="border-red-500 text-red-600 hover:bg-red-50"
                onClick={() => deleteEvento(editingEvento.id)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar
              </Button>
            )}
            <DialogClose asChild>
              <Button variant="ghost">Cancelar</Button>
            </DialogClose>
            <Button onClick={saveEvento}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
