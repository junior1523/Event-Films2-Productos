"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  Plus,
  Search,
  Edit,
  Phone,
  Mail,
  Camera,
  UserCircle,
  Eye,
  Trash2,
  Image,
  Video,
  Star,
  Aperture,
} from "lucide-react";
import { useAppData } from "../context/AppDataContext";
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
import { Checkbox } from "./ui/checkbox";

interface PersonalMember {
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

const specialtyOptions = [
  {
    value: "Camarógrafo",
    label: "Camarógrafo",
    icon: <Camera className="w-4 h-4" />,
  },
  {
    value: "Fotógrafo",
    label: "Fotógrafo",
    icon: <Image className="w-4 h-4" />,
  },
  {
    value: "Operador de Drone",
    label: "Operador de Drone",
    icon: <Video className="w-4 h-4" />,
  },
  {
    value: "Editor",
    label: "Editor",
    icon: <Aperture className="w-4 h-4" />,
  },
  {
    value: "Asistente",
    label: "Asistente",
    icon: <UserCircle className="w-4 h-4" />,
  },
];


const emptyForm: Omit<PersonalMember, "id" | "email" | "rol" | "eventosAsignados" | "calificacion"> = {
  nombres: "",
  apellidos: "",
  edad: 18,
  dni: "",
  telefono: "",
  direccion: "",
  fechaNacimiento: "",
  especialidades: [],
  adicional: "",
};

export function Personal() {
  const { personalList, setPersonalList } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRol, setFilterRol] = useState<string>("Todos");
  const [filterDisponibilidad, setFilterDisponibilidad] =
    useState<string>("Todos");
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] =
    useState<"create" | "edit" | "view">("create");
  const [activeMember, setActiveMember] = useState<PersonalMember | null>(null);
  const [formState, setFormState] = useState<PersonalMember>({
    id: 0,
    nombres: "",
    apellidos: "",
    edad: 18,
    dni: "",
    telefono: "",
    direccion: "",
    fechaNacimiento: "",
    especialidades: [],
    adicional: "",
    rol: "Asistente",
    email: "",
    disponibilidad: "Disponible",
    disponibilidadTexto: "",
    eventosAsignados: 0,
    calificacion: 0,
  });

  const filteredPersonal = useMemo(
    () =>
      personalList.filter((member) => {
        const fullName = `${member.nombres} ${member.apellidos}`;
        const matchesSearch = fullName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesRol =
          filterRol === "Todos" ||
          member.especialidades.includes(filterRol);
        const matchesDisponibilidad =
          filterDisponibilidad === "Todos" ||
          (filterDisponibilidad === "Otros"
            ? member.disponibilidad === "Otros"
            : member.disponibilidad === filterDisponibilidad);
        return matchesSearch && matchesRol && matchesDisponibilidad;
      }),
    [personalList, searchTerm, filterRol, filterDisponibilidad],
  );

  const getDisponibilidadBadge = (disponibilidad: string) => {
    const styles = {
      Disponible: "bg-green-100 text-green-800",
      Ocupado: "bg-yellow-100 text-yellow-800",
      Vacaciones: "bg-blue-100 text-blue-800",
      Otros: "bg-slate-100 text-slate-800",
    };
    return (
      styles[disponibilidad as keyof typeof styles] || styles.Otros
    );
  };

  const getDisponibilidadLabel = (member: PersonalMember) =>
    member.disponibilidad === "Otros"
      ? member.disponibilidadTexto || "Otros"
      : member.disponibilidad;

  const getRolIcon = (rol: string) => {
    switch (rol) {
      case "Camarógrafo":
        return <Camera className="w-5 h-5 text-blue-500" />;
      case "Editor":
        return <Aperture className="w-5 h-5 text-purple-500" />;
      case "Fotógrafo":
        return <Image className="w-5 h-5 text-green-500" />;
      case "Drone Operator":
        return <Video className="w-5 h-5 text-orange-500" />;
      case "Asistente":
        return <UserCircle className="w-5 h-5 text-slate-500" />;
      default:
        return <UserCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getEspecialidadIcon = (especialidad: string) => {
    switch (especialidad) {
      case "Camarógrafo":
        return <Camera className="w-3.5 h-3.5 text-blue-500" />;
      case "Editor":
        return <Aperture className="w-3.5 h-3.5 text-purple-500" />;
      case "Fotógrafo":
        return <Image className="w-3.5 h-3.5 text-green-500" />;
      case "Operador de Drone":
        return <Video className="w-3.5 h-3.5 text-orange-500" />;
      case "Asistente":
        return <UserCircle className="w-3.5 h-3.5 text-slate-500" />;
      default:
        return <UserCircle className="w-3.5 h-3.5 text-gray-500" />;
    }
  };

  const disponibles = personalList.filter(
    (p) => p.disponibilidad === "Disponible"
  ).length;
  const ocupados = personalList.filter((p) => p.disponibilidad === "Ocupado").length;

  const openCreateForm = () => {
    setFormMode("create");
    setActiveMember(null);
    setFormState({
      ...formState,
      id: 0,
      nombres: "",
      apellidos: "",
      edad: 18,
      dni: "",
      telefono: "",
      direccion: "",
      fechaNacimiento: "",
      especialidades: [],
      adicional: "",
      rol: "Asistente",
      email: "",
      disponibilidad: "Disponible",
      disponibilidadTexto: "",
      eventosAsignados: 0,
      calificacion: 0,
    });
    setFormOpen(true);
  };

  const openEditForm = (member: PersonalMember) => {
    setFormMode("edit");
    setActiveMember(member);
    setFormState(member);
    setFormOpen(true);
  };

  const openViewForm = (member: PersonalMember) => {
    setFormMode("view");
    setActiveMember(member);
    setFormState(member);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setActiveMember(null);
  };

  const handleFormChange = (
    field: keyof Omit<PersonalMember, "id" | "rol" | "email" | "eventosAsignados" | "calificacion">,
    value: string | number | string[],
  ) => {
    setFormState((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSpecialtyToggle = (value: string) => {
    setFormState((current) => {
      const hasValue = current.especialidades.includes(value);
      const nextSpecialties = hasValue
        ? current.especialidades.filter((item) => item !== value)
        : [...current.especialidades, value];
      return {
        ...current,
        especialidades: nextSpecialties,
        rol:
          nextSpecialties.length > 0
            ? nextSpecialties[0] === "Operador de Drone"
              ? "Drone Operator"
              : (nextSpecialties[0] as PersonalMember["rol"])
            : "Asistente",
      };
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (formMode === "view") {
      setFormOpen(false);
      return;
    }

    const memberData = {
      nombres: formState.nombres,
      apellidos: formState.apellidos,
      edad: formState.edad,
      dni: formState.dni,
      telefono: formState.telefono,
      direccion: formState.direccion,
      fecha_nacimiento: formState.fechaNacimiento,
      especialidades: formState.especialidades,
      adicional: formState.adicional,
      rol: formState.especialidades[0] === "Operador de Drone" ? "Drone Operator" : (formState.especialidades[0] || "Asistente"),
      email: formState.email || `${formState.nombres.toLowerCase()}.${formState.apellidos.toLowerCase().replace(/\s/g, "")}@eventfilms.com`,
      disponibilidad: formState.disponibilidad,
      calificacion: formState.calificacion
    };

    try {
      if (formMode === "create") {
        const res = await fetch("http://localhost:3001/api/personal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(memberData),
        });
        const data = await res.json();
        const newMember: PersonalMember = { 
          ...formState, 
          id: data.id, 
          email: memberData.email,
          rol: memberData.rol as PersonalMember["rol"]
        };
        setPersonalList((current) => [newMember, ...current]);
      } else if (formMode === "edit" && activeMember) {
        await fetch(`http://localhost:3001/api/personal/${activeMember.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(memberData),
        });
        setPersonalList((current) =>
          current.map((member) =>
            member.id === activeMember.id ? { ...member, ...memberData, rol: memberData.rol as PersonalMember["rol"] } : member
          )
        );
      }
      closeForm();
    } catch (err) {
      console.error("Error al guardar personal:", err);
      window.alert("Error al conectar con la base de datos.");
    }
  };

  const handleDelete = async (memberId: number) => {
    if (window.confirm("¿Estás seguro de eliminar a este miembro del personal?")) {
      setPersonalList((current) => current.filter((member) => member.id !== memberId));
      try {
        await fetch(`http://localhost:3001/api/personal/${memberId}`, { method: "DELETE" });
      } catch (err) {
        console.error("Error al eliminar personal:", err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Personal</h1>
          <p className="mt-1 text-gray-600">
            Gestiona tu equipo de trabajo y disponibilidad
          </p>
        </div>
        <Button variant="default" size="default" onClick={openCreateForm}>
          <Plus className="w-5 h-5" />
          Agregar Personal
        </Button>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {formMode === "create"
                ? "Formulario de Registro de Personal"
                : formMode === "edit"
                ? "Editar Personal"
                : "Ver Personal"}
            </DialogTitle>
            <DialogDescription>
              {formMode === "view"
                ? "Consulta los datos del miembro del equipo."
                : "Llena los datos del personal y guarda los cambios."}
            </DialogDescription>
          </DialogHeader>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="apellidos">Apellidos</Label>
                <Input
                  id="apellidos"
                  value={formState.apellidos}
                  onChange={(event) =>
                    handleFormChange("apellidos", event.target.value)
                  }
                  disabled={formMode === "view"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombres">Nombres</Label>
                <Input
                  id="nombres"
                  value={formState.nombres}
                  onChange={(event) =>
                    handleFormChange("nombres", event.target.value)
                  }
                  disabled={formMode === "view"}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edad">Edad</Label>
                <Input
                  id="edad"
                  type="number"
                  value={formState.edad}
                  onChange={(event) =>
                    handleFormChange("edad", Number(event.target.value))
                  }
                  disabled={formMode === "view"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dni">DNI</Label>
                <Input
                  id="dni"
                  value={formState.dni}
                  onChange={(event) =>
                    handleFormChange("dni", event.target.value)
                  }
                  disabled={formMode === "view"}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formState.telefono}
                  onChange={(event) =>
                    handleFormChange("telefono", event.target.value)
                  }
                  disabled={formMode === "view"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={formState.email}
                  onChange={(event) =>
                    handleFormChange("email", event.target.value)
                  }
                  disabled={formMode === "view"}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección de domicilio</Label>
                <Input
                  id="direccion"
                  value={formState.direccion}
                  onChange={(event) =>
                    handleFormChange("direccion", event.target.value)
                  }
                  disabled={formMode === "view"}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  value={formState.fechaNacimiento}
                  onChange={(event) =>
                    handleFormChange("fechaNacimiento", event.target.value)
                  }
                  disabled={formMode === "view"}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Especialidad</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {specialtyOptions.map((option) => {
                  const selected = formState.especialidades.includes(option.value);
                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => handleSpecialtyToggle(option.value)}
                      disabled={formMode === "view"}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                        selected
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                      }`}
                    >
                      {option.icon}
                      <span>{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="disponibilidad">Estado</Label>
              <select
                id="disponibilidad"
                value={formState.disponibilidad}
                onChange={(event) =>
                  handleFormChange("disponibilidad", event.target.value)
                }
                disabled={formMode === "view"}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
              >
                <option value="Disponible">Disponible</option>
                <option value="Ocupado">Ocupado</option>
                <option value="Vacaciones">Vacaciones</option>
                <option value="Otros">Otros</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Calificación</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    disabled={formMode === "view"}
                    onClick={() => handleFormChange("calificacion", value)}
                    className={`rounded-full p-2 transition ${
                      formState.calificacion >= value
                        ? "bg-yellow-100 text-yellow-600"
                        : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                    }`}
                  >
                    <Star className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {formState.disponibilidad === "Otros" && (
            <div className="space-y-2">
              <Label htmlFor="disponibilidadTexto">Especificar otro estado</Label>
              <Input
                id="disponibilidadTexto"
                value={formState.disponibilidadTexto ?? ""}
                onChange={(event) =>
                  handleFormChange("disponibilidadTexto", event.target.value)
                }
                disabled={formMode === "view"}
              />
            </div>
          )}

            <div className="space-y-2">
              <Label htmlFor="adicional">Adicional</Label>
              <Textarea
                id="adicional"
                value={formState.adicional}
                onChange={(event) =>
                  handleFormChange("adicional", event.target.value)
                }
                disabled={formMode === "view"}
              />
            </div>

            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" type="button">
                  Cancelar
                </Button>
              </DialogClose>
              {formMode !== "view" ? (
                <Button type="submit">Aceptar</Button>
              ) : (
                <DialogClose asChild>
                  <Button type="button">Cerrar</Button>
                </DialogClose>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Personal</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {personalList.length}
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="text-sm text-gray-600">Disponibles</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {disponibles}
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="text-sm text-gray-600">Ocupados</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">
            {ocupados}
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="text-sm text-gray-600">Eventos Activos</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {personalList.reduce((sum, p) => sum + p.eventosAsignados, 0)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterRol}
          onChange={(e) => setFilterRol(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Todos">Todos los roles</option>
          <option value="Camarógrafo">Camarógrafo</option>
          <option value="Editor">Editor</option>
          <option value="Fotógrafo">Fotógrafo</option>
          <option value="Asistente">Asistente</option>
          <option value="Operador de Drone">Operador de Drone</option>
        </select>
        <select
          value={filterDisponibilidad}
          onChange={(e) => setFilterDisponibilidad(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Todos">Disponibilidad</option>
          <option value="Disponible">Disponible</option>
          <option value="Ocupado">Ocupado</option>
          <option value="Vacaciones">Vacaciones</option>
          <option value="Otros">Otros</option>
        </select>
      </div>

      {/* Team Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPersonal.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                {getRolIcon(member.rol)}
                <div className="ml-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {member.nombres} {member.apellidos}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {member.especialidades.map((especialidad) => (
                      <span
                        key={especialidad}
                        className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700"
                      >
                        {getEspecialidadIcon(especialidad)}
                        {especialidad}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <button
                  onClick={() => openViewForm(member)}
                  className="rounded-md p-2 hover:bg-gray-100"
                  type="button"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openEditForm(member)}
                  className="rounded-md p-2 hover:bg-gray-100"
                  type="button"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="rounded-md p-2 hover:bg-gray-100 text-red-500"
                  type="button"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="w-4 h-4 mr-2" />
                {member.telefono}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="w-4 h-4 mr-2" />
                {member.email}
              </div>
              <div className="text-sm text-gray-600">
                DNI: {member.dni}
              </div>
              <div className="text-sm text-gray-600">
                Fecha de Nacimiento: {member.fechaNacimiento}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${getDisponibilidadBadge(
                  member.disponibilidad
                )}`}
              >
                {getDisponibilidadLabel(member)}
              </span>
              <div className="text-sm text-gray-600">
                {member.eventosAsignados} eventos
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
              <span className="text-sm text-gray-600">Calificación</span>
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">★</span>
                <span className="text-sm font-semibold text-gray-900">
                  {member.calificacion}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
