"use client";

import { createContext, useContext, useState, useEffect, type ReactNode, type Dispatch, type SetStateAction } from "react";

export interface RangoFilmacion {
  dia: string;
  horaInicio: string;
  horaFin: string;
}

export interface Cuota {
  numero: number;
  monto: number;
  fecha: string;
  pagado: boolean;
}

export interface Contrato {
  id: number;
  apellidosNombres: string;
  dni: string;
  telefono: string;
  tipoEvento: string;
  tipoEventoOtro?: string;
  nombreEvento: string;
  direccion?: string;
  fechaInicio: string;
  fechaFin: string;
  rangoFilmacion: RangoFilmacion[];
  planPagos: Cuota[];
  observaciones: string;
  estado: "Activo" | "Pendiente" | "Completado" | "Cancelado";
  fechaCreacion: string;
}

export interface Pago {
  id: number;
  contratoId?: number;
  cliente: string;
  evento: string;
  monto: number;
  tipo: "Anticipo" | "Pago Parcial" | "Pago Final";
  metodo: "Efectivo" | "Transferencia" | "Tarjeta";
  fecha: string;
  estado: "Pagado" | "Pendiente" | "Vencido";
  fechaVencimiento?: string;
}

export interface ContratoPago {
  id: number;
  cliente: string;
  evento: string;
  fechaInicio: string;
  cuotas: Cuota[];
}

export interface HorarioEvento {
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

export interface Edicion {
  id: number;
  evento: string;
  cliente: string;
  editor: string;
  fechaInicio: string;
  fechaEntrega: string;
  progreso: number;
  estado: "Sin Iniciar" | "En Proceso" | "Revisión" | "Completado" | "Entregado";
  prioridad: "Alta" | "Media" | "Baja";
  duracionEstimada: string;
  lugar: string;
  nombreArchivo: string;
  tipo?: string;
}

export interface PersonalMember {
  id: number;
  nombres: string;
  apellidos: string;
  edad: number;
  dni: string;
  telefono: string;
  direccion: string;
  fechaNacimiento: string;
  especialidades: string[];
  adicional: string;
  rol: "Camarógrafo" | "Editor" | "Fotógrafo" | "Asistente" | "Drone Operator";
  email: string;
  disponibilidad: string;
  disponibilidadTexto?: string;
  eventosAsignados: number;
  calificacion: number;
}

export interface UserAccount {
  id: number;
  username: string;
  password: string;
  roles: Array<"admin" | "editor" | "personal">;
  personalId?: number;
  specialty?: string;
  nombres: string;
  apellidos: string;
  email: string;
}

export interface Almacenamiento {
  id: number;
  nombre: string;
  tamano: string;
  condiciones: string;
}

export interface EventoDesignado {
  id: number;
  evento: string;
  almacen: string;
  fecha: string;
}


interface AppDataContextValue {
  contracts: Contrato[];
  setContracts: Dispatch<SetStateAction<Contrato[]>>;
  pagos: Pago[];
  setPagos: Dispatch<SetStateAction<Pago[]>>;
  horarioEventos: Record<string, HorarioEvento[]>;
  setHorarioEventos: Dispatch<SetStateAction<Record<string, HorarioEvento[]>>>;
  ediciones: Edicion[];
  setEdiciones: Dispatch<SetStateAction<Edicion[]>>;
  personalList: PersonalMember[];
  setPersonalList: Dispatch<SetStateAction<PersonalMember[]>>;
  users: UserAccount[];
  setUsers: Dispatch<SetStateAction<UserAccount[]>>;
  currentUser: UserAccount | null;
  login: (username: string, password: string) => UserAccount | undefined;
  logout: () => void;
  createUser: (user: Omit<UserAccount, "id">) => boolean;
  createWorkerAccount: (personalId: number, username: string, password: string) => boolean;
  almacenamientos: Almacenamiento[];
  setAlmacenamientos: Dispatch<SetStateAction<Almacenamiento[]>>;
  eventosDesignados: EventoDesignado[];
  setEventosDesignados: Dispatch<SetStateAction<EventoDesignado[]>>;
}

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

const initialUsers: UserAccount[] = [
  {
    id: 1,
    username: "admin",
    password: "admin",
    roles: ["admin"],
    nombres: "Admin",
    apellidos: "EventFilms",
    email: "admin@eventfilms.com",
  },
  {
    id: 2,
    username: "editor",
    password: "editor123",
    roles: ["editor"],
    nombres: "María",
    apellidos: "Santos",
    email: "maria@eventfilms.com",
  },
  {
    id: 3,
    username: "camarografo1",
    password: "camarografo",
    roles: ["personal"],
    personalId: 1,
    specialty: "Camarógrafo",
    nombres: "Carlos",
    apellidos: "Mendoza",
    email: "carlos@eventfilms.com",
  },
  {
    id: 4,
    username: "multi",
    password: "multi123",
    roles: ["editor", "personal"],
    personalId: 2,
    specialty: "Editor / Camarógrafo",
    nombres: "María",
    apellidos: "Santos",
    email: "maria@eventfilms.com",
  },
];

const initialContracts: Contrato[] = [
  {
    id: 3,
    apellidosNombres: "Martínez Silva, Luis Alberto",
    dni: "70123456",
    telefono: "943218765",
    tipoEvento: "Matrimonio",
    nombreEvento: "Boda Luis & Sofía",
    fechaInicio: "2026-04-20",
    fechaFin: "2026-04-20",
    rangoFilmacion: [
      { dia: "2026-04-20", horaInicio: "03:00 PM", horaFin: "11:30 PM" },
    ],
    planPagos: [
      { numero: 1, monto: 3100, fecha: "2026-03-25", pagado: true },
      { numero: 2, monto: 3100, fecha: "2026-04-20", pagado: false },
    ],
    observaciones: "Ceremonia en playa",
    estado: "Pendiente",
    fechaCreacion: "2026-03-20",
  },
];

const initialPagos: Pago[] = [
  {
    id: 4,
    contratoId: 3,
    cliente: "Luis Martínez",
    evento: "Boda Luis & Sofía",
    monto: 3100,
    tipo: "Anticipo",
    metodo: "Tarjeta",
    fecha: "2026-03-25",
    estado: "Pagado",
  },
  {
    id: 5,
    cliente: "Familia López",
    evento: "Cumpleaños 50 Juan",
    monto: 1400,
    tipo: "Anticipo",
    metodo: "Efectivo",
    fecha: "",
    estado: "Vencido",
    fechaVencimiento: "2026-03-28",
  },
];

const initialHorarioEventos: Record<string, HorarioEvento[]> = {};

const initialEdiciones: Edicion[] = [];

const initialPersonal: PersonalMember[] = [
  {
    id: 1,
    nombres: "Carlos",
    apellidos: "Mendoza",
    edad: 32,
    dni: "12345678",
    telefono: "+52 55 1234-5678",
    direccion: "Av. Reforma 123, CDMX",
    fechaNacimiento: "1991-04-15",
    especialidades: ["Camarógrafo"],
    adicional: "Prefiere trabajar en bodas y eventos corporativos.",
    rol: "Camarógrafo",
    email: "carlos@eventfilms.com",
    disponibilidad: "Disponible",
    eventosAsignados: 3,
    calificacion: 4.8,
  },
  {
    id: 2,
    nombres: "María",
    apellidos: "Santos",
    edad: 29,
    dni: "23456789",
    telefono: "+52 55 2345-6789",
    direccion: "Calle Olivo 45, CDMX",
    fechaNacimiento: "1994-01-22",
    especialidades: ["Editor"],
    adicional: "Editora con experiencia en video documental.",
    rol: "Editor",
    email: "maria@eventfilms.com",
    disponibilidad: "Ocupado",
    eventosAsignados: 5,
    calificacion: 4.9,
  },
  {
    id: 3,
    nombres: "Jorge",
    apellidos: "Ramírez",
    edad: 35,
    dni: "34567890",
    telefono: "+52 55 3456-7890",
    direccion: "Paseo de la Reforma 210, CDMX",
    fechaNacimiento: "1989-11-05",
    especialidades: ["Camarógrafo"],
    adicional: "Experto en cobertura de eventos deportivos.",
    rol: "Camarógrafo",
    email: "jorge@eventfilms.com",
    disponibilidad: "Ocupado",
    eventosAsignados: 4,
    calificacion: 4.7,
  },
  {
    id: 4,
    nombres: "Ana",
    apellidos: "Flores",
    edad: 27,
    dni: "45678901",
    telefono: "+52 55 4567-8901",
    direccion: "Av. Chapultepec 88, CDMX",
    fechaNacimiento: "1996-07-10",
    especialidades: ["Fotógrafo"],
    adicional: "Trabaja también en fotografía social y moda.",
    rol: "Fotógrafo",
    email: "ana@eventfilms.com",
    disponibilidad: "Disponible",
    eventosAsignados: 2,
    calificacion: 4.9,
  },
  {
    id: 5,
    nombres: "Luis",
    apellidos: "Torres",
    edad: 30,
    dni: "56789012",
    telefono: "+52 55 5678-9012",
    direccion: "Calle Lirio 12, CDMX",
    fechaNacimiento: "1994-02-28",
    especialidades: ["Drone Operator"],
    adicional: "Piloto autorizado para filmar en exteriores.",
    rol: "Drone Operator",
    email: "luis@eventfilms.com",
    disponibilidad: "Disponible",
    eventosAsignados: 1,
    calificacion: 4.6,
  },
  {
    id: 6,
    nombres: "Patricia",
    apellidos: "Gómez",
    edad: 31,
    dni: "67890123",
    telefono: "+52 55 6789-0123",
    direccion: "Calzada del Valle 32, CDMX",
    fechaNacimiento: "1993-09-02",
    especialidades: ["Editor"],
    adicional: "Disponible para edición urgente.",
    rol: "Editor",
    email: "patricia@eventfilms.com",
    disponibilidad: "Vacaciones",
    eventosAsignados: 0,
    calificacion: 4.8,
  },
  {
    id: 7,
    nombres: "Roberto",
    apellidos: "Silva",
    edad: 26,
    dni: "78901234",
    telefono: "+52 55 7890-1234",
    direccion: "Calle Jazmín 22, CDMX",
    fechaNacimiento: "1998-12-16",
    especialidades: ["Asistente"],
    adicional: "Se encarga de logística y soporte técnico.",
    rol: "Asistente",
    email: "roberto@eventfilms.com",
    disponibilidad: "Disponible",
    eventosAsignados: 2,
    calificacion: 4.5,
  },
];

const initialAlmacenamientos: Almacenamiento[] = [
  { id: 1, nombre: "Disco Azul", tamano: "2 TB", condiciones: "Activo, sin errores" },
  { id: 2, nombre: "Disco Verde", tamano: "4 TB", condiciones: "Respaldo programado" },
  { id: 3, nombre: "Disco Negro", tamano: "1 TB", condiciones: "En uso por edición activa" },
];

const initialEventosDesignados: EventoDesignado[] = [];

const hiddenSampleEventNames = [
  "XV Años María",
  "XV Anos Maria",
  "Boda Ana & Carlos",
  "Evento Corporativo TechCo",
];

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[ -]/g, (c) => c)
    .replace(/[ -]/g, (c) => c)
    .replace(/[ -]/g, (c) => c)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

const isHiddenSampleName = (value: string | null | undefined) => {
  if (!value) return false;
  const normalized = normalizeText(value);
  return hiddenSampleEventNames.some(
    (name) => normalizeText(name) === normalized
  );
};

const parseISODate = (isoString: string) => {
  const [year, month, day] = isoString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const formatDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const computeDurationFromTimes = (startTime: string, endTime: string) => {
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

const buildScheduleDaysFromRange = (start: string | null, end: string | null) => {
  if (!start) return [];
  const startDate = parseISODate(start);
  const endDate = end ? parseISODate(end) : startDate;
  const days: string[] = [];
  const current = new Date(startDate);
  while (current <= endDate) {
    days.push(formatDateKey(current));
    current.setDate(current.getDate() + 1);
  }
  return days;
};

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [contracts, setContracts] = useState<Contrato[]>(initialContracts);
  const [pagos, setPagos] = useState<Pago[]>(initialPagos);
  const [horarioEventos, setHorarioEventos] = useState<Record<string, HorarioEvento[]>>(initialHorarioEventos);
  const [ediciones, setEdiciones] = useState<Edicion[]>(initialEdiciones);
  const [personalList, setPersonalList] = useState<PersonalMember[]>(initialPersonal);
  const [almacenamientos, setAlmacenamientos] = useState<Almacenamiento[]>(initialAlmacenamientos);
  const [eventosDesignados, setEventosDesignados] = useState<EventoDesignado[]>(initialEventosDesignados);
  const [users, setUsers] = useState<UserAccount[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  useEffect(() => {
    const storedUsers = window.localStorage.getItem("eventfilms-users");
    const storedSession = window.localStorage.getItem("eventfilms-current-user");
    if (storedUsers) {
      try {
        setUsers(JSON.parse(storedUsers));
      } catch (error) {
        console.warn("No se pudo leer usuarios guardados.");
      }
    }
    if (storedSession) {
      try {
        setCurrentUser(JSON.parse(storedSession));
      } catch (error) {
        console.warn("No se pudo leer sesión guardada.");
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("eventfilms-users", JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUser) {
      window.localStorage.setItem("eventfilms-current-user", JSON.stringify(currentUser));
    } else {
      window.localStorage.removeItem("eventfilms-current-user");
    }
  }, [currentUser]);

  const login = (username: string, password: string) => {
    const user = users.find(
      (item) => item.username === username && item.password === password
    );
    if (!user) return undefined;
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const createUser = (user: Omit<UserAccount, "id">) => {
    if (users.some((item) => item.username === user.username)) {
      return false;
    }
    const newUser = { id: Date.now(), ...user };
    setUsers((prev) => [...prev, newUser]);
    return true;
  };

  const createWorkerAccount = (
    personalId: number,
    username: string,
    password: string
  ) => {
    if (users.some((item) => item.username === username || item.personalId === personalId)) {
      return false;
    }
    const personal = personalList.find((member) => member.id === personalId);
    if (!personal) {
      return false;
    }
    return createUser({
      username,
      password,
      roles: ["personal"],
      personalId,
      specialty: personal.rol,
      nombres: personal.nombres,
      apellidos: personal.apellidos,
      email: personal.email,
    });
  };

  // Cargar datos reales desde MySQL al montar
  useEffect(() => {
    // 1. EVENTOS / EDICIONES
    fetch("http://localhost:3001/api/eventos")
      .then((r) => r.json())
      .then((data) => {
        const mapped: Edicion[] = data.map((row: any) => ({
          id: row.id,
          evento: row.evento,
          cliente: row.cliente ?? "Sin cliente",
          editor: row.editor ?? "Sin asignar",
          fechaInicio: row.fechaInicio?.slice(0, 10) ?? "",
          fechaEntrega: row.fechaEntrega?.slice(0, 10) ?? "",
          progreso: row.progreso ?? 0,
          estado: row.estado as Edicion["estado"],
          prioridad: row.prioridad as Edicion["prioridad"],
          duracionEstimada: row.duracionEstimada ?? "",
          lugar: row.lugar ?? "",
          nombreArchivo: row.nombreArchivo ?? "",
          tipo: row.tipo ?? "Evento social",
        }));
        setEdiciones(mapped.filter((item) => !isHiddenSampleName(item.evento)));

        const scheduleEvents = data.reduce((acc: Record<string, HorarioEvento[]>, row: any) => {
          if (isHiddenSampleName(row.evento)) return acc;
          const fechas = buildScheduleDaysFromRange(row.fechaInicio?.slice(0, 10) ?? null, row.fechaEntrega?.slice(0, 10) ?? null);
          const firstRange = Array.isArray(row.rango_filmacion) ? row.rango_filmacion[0] : null;
          const startTime = firstRange?.horaInicio || "08:00 AM";
          const endTime = firstRange?.horaFin || "05:00 PM";
          const duracion = computeDurationFromTimes(startTime, endTime);
          fechas.forEach((dia: string, index: number) => {
            const evento: HorarioEvento = {
              id: row.id * 100 + index,
              titulo: row.evento,
              cliente: row.cliente ?? "Sin cliente",
              tipo: row.tipo ?? "Evento social",
              startTime,
              endTime,
              duracion,
              ubicacion: row.lugar ?? "",
              descripcion: row.tipo ?? "",
              personal: [],
              color: "bg-blue-500",
            };
            acc[dia] = acc[dia] || [];
            if (!acc[dia].some((existing) => existing.id === evento.id || (existing.titulo === evento.titulo && existing.startTime === evento.startTime && existing.endTime === evento.endTime))) {
              acc[dia].push(evento);
            }
          });
          return acc;
        }, {});

        setHorarioEventos((prev) => {
          const merged = { ...prev };
          Object.entries(scheduleEvents).forEach(([key, events]) => {
            const existing = merged[key] || [];
            const deduped = [...existing];
            events.forEach((evt) => {
              if (!deduped.some((e) => e.id === evt.id || (e.titulo === evt.titulo && e.startTime === evt.startTime && e.endTime === evt.endTime))) {
                deduped.push(evt);
              }
            });
            merged[key] = deduped;
          });
          return merged;
        });
      })
      .catch(() => console.warn("⚠️ No se pudo obtener eventos."));

    // 2. CONTRATOS
    fetch("http://localhost:3001/api/contratos")
      .then((r) => r.json())
      .then((data) => {
        const mapped: Contrato[] = data
          .filter((row: any) => !isHiddenSampleName(row.nombre_evento))
          .map((row: any) => ({
            id: row.id,
            apellidosNombres: row.apellidos_nombres,
            dni: row.dni,
            telefono: row.telefono,
            tipoEvento: row.tipo_evento,
            tipoEventoOtro: row.tipo_evento_otro,
            nombreEvento: row.nombre_evento,
            direccion: row.direccion,
            fechaInicio: row.fecha_inicio?.slice(0, 10) ?? "",
            fechaFin: row.fecha_fin?.slice(0, 10) ?? "",
            rangoFilmacion: typeof row.rango_filmacion === 'string' ? JSON.parse(row.rango_filmacion) : row.rango_filmacion,
            planPagos: typeof row.plan_pagos === 'string' ? JSON.parse(row.plan_pagos) : row.plan_pagos,
            observaciones: row.observaciones,
            estado: row.estado,
            fechaCreacion: row.fecha_creacion?.slice(0, 10) ?? "",
          }));
        setContracts(mapped);

        const contractScheduleEvents = mapped.reduce((acc: Record<string, HorarioEvento[]>, row) => {
          const fechas = buildScheduleDaysFromRange(row.fechaInicio || null, row.fechaFin || null);
          fechas.forEach((dia, index) => {
            const firstRange = row.rangoFilmacion?.[0];
            const startTime = firstRange?.horaInicio || "08:00 AM";
          const endTime = firstRange?.horaFin || "05:00 PM";
          const evento: HorarioEvento = {
            id: row.id * 1000 + index,
            titulo: row.nombreEvento || row.tipoEvento || "Evento",
            cliente: row.apellidosNombres || "Sin cliente",
            tipo: row.tipoEvento || "Evento",
            startTime,
            endTime,
            duracion: computeDurationFromTimes(startTime, endTime),
            ubicacion: row.direccion || "",
            descripcion: row.observaciones || "",
            personal: [],
            color: "bg-blue-500",
          };
            acc[dia] = acc[dia] || [];
            if (!acc[dia].some((existing) => existing.id === evento.id || (existing.titulo === evento.titulo && existing.startTime === evento.startTime && existing.endTime === evento.endTime))) {
              acc[dia].push(evento);
            }
          });
          return acc;
        }, {});

        setHorarioEventos((prev) => {
          const merged = { ...prev };
          Object.entries(contractScheduleEvents).forEach(([key, events]) => {
            const existing = merged[key] || [];
            const deduped = [...existing];
            events.forEach((evt) => {
              if (!deduped.some((e) => e.id === evt.id || (e.titulo === evt.titulo && e.startTime === evt.startTime && e.endTime === evt.endTime))) {
                deduped.push(evt);
              }
            });
            merged[key] = deduped;
          });
          return merged;
        });
      })
      .catch(() => {});

    // 3. PERSONAL
    fetch("http://localhost:3001/api/personal")
      .then((r) => r.json())
      .then((data) => {
        const mapped: PersonalMember[] = data.map((row: any) => ({
          id: row.id,
          nombres: row.nombres,
          apellidos: row.apellidos,
          edad: row.edad,
          dni: row.dni,
          telefono: row.telefono,
          direccion: row.direccion,
          fechaNacimiento: row.fecha_nacimiento?.slice(0, 10) ?? "",
          especialidades: typeof row.especialidades === 'string' ? JSON.parse(row.especialidades) : row.especialidades,
          adicional: row.adicional,
          rol: row.rol,
          email: row.email,
          disponibilidad: row.disponibilidad,
          eventosAsignados: row.eventos_asignados,
          calificacion: parseFloat(row.calificacion || "0"),
        }));
        setPersonalList(mapped);
      })
      .catch(() => {});

    // 4. PAGOS
    fetch("http://localhost:3001/api/pagos")
      .then((r) => r.json())
      .then((data) => {
        const mapped: Pago[] = data.map((row: any) => ({
          id: row.id,
          contratoId: row.contrato_id,
          cliente: row.cliente,
          evento: row.evento,
          monto: parseFloat(row.monto || "0"),
          tipo: row.tipo,
          metodo: row.metodo,
          fecha: row.fecha?.slice(0, 10) ?? "",
          estado: row.estado,
          fechaVencimiento: row.fecha_vencimiento?.slice(0, 10) ?? "",
        }));
        setPagos(mapped);
      })
      .catch(() => {});

    fetch("http://localhost:3001/api/almacenamientos")
      .then((r) => r.json())
      .then((data) => {
        const mapped: Almacenamiento[] = data.map((row: any) => ({
          id: row.id,
          nombre: row.nombre,
          tamano: row.tamano,
          condiciones: row.condiciones,
        }));
        setAlmacenamientos(mapped);
      })
      .catch(() => {});

    fetch("http://localhost:3001/api/evento_almacenamiento")
      .then((r) => r.json())
      .then((data) => {
        const mapped: EventoDesignado[] = data
          .map((row: any) => ({
            id: row.id,
            evento: row.evento,
            almacen: row.almacen,
            fecha: new Date(row.fecha).toLocaleDateString("es-ES"),
          }))
          .filter((item) => !isHiddenSampleName(item.evento));
        setEventosDesignados(mapped);
      })
      .catch(() => {});
  }, []);

  return (
    <AppDataContext.Provider
      value={{
        contracts,
        setContracts,
        pagos,
        setPagos,
        horarioEventos,
        setHorarioEventos,
        ediciones,
        setEdiciones,
        personalList,
        setPersonalList,
        users,
        setUsers,
        currentUser,
        login,
        logout,
        createUser,
        createWorkerAccount,
        almacenamientos,
        setAlmacenamientos,
        eventosDesignados,
        setEventosDesignados,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within AppDataProvider");
  }
  return context;
}
