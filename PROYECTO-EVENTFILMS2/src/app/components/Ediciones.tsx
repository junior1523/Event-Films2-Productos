import { useEffect, useState } from "react";
import {
  Search,
  Play,
  Pause,
  CheckCircle,
  Eye,
  Edit3,
  Trash2,
  FolderPlus,
  FileText,
  ClipboardList,
  ChevronDown,
} from "lucide-react";
import { useAppData, type Almacenamiento, type EventoDesignado } from "../context/AppDataContext";

interface Edicion {
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
}


const availableEditors = [
  "María Santos",
  "Patricia Gómez",
  "Jorge Pérez",
  "Luis Martínez",
];

interface DetallesEdicion {
  id: number;
  evento: string;
  tipoEvento: string;
  personal: string;
  lugar: string;
  fechaInicio: string;
  fechaFin: string;
  nombreArchivo: string;
  datosAdicionales: string;
  revisionAudio: boolean;
  revisionColor: boolean;
  revisionFinal: boolean;
  editor: string;
  prioridad: "Alta" | "Media" | "Baja";
  camaras: number;
  tiemposCamaras: { horas: number; minutos: number }[];
  fechaEdicionInicio: string;
  fechaEdicionFin: string;
  capitulos: number;
  tiempoTotalHoras: number;
  tiempoTotalMinutos: number;
  trailerEstado: "Listo" | "Proceso" | "No iniciado";
  fotosBrutoCantidad: number;
  fotosBrutoFormato: string;
  fotosEditadasCantidad: number;
  fotosEditadasListas: boolean;
  fotosEditadasFormato: string;
  estadoEdicion: string;
  observaciones: string;
  entregaMedio: string;
  usbSize: string;
  usbCantidad: number;
  dvdCount: number;
  blurayCount: number;
  otrosEntrega: string;
  estadoEntregaFinal: string;
  estadoEntregaFinalOtros: string;
}

const getInitialDetails = (edicion: Edicion): DetallesEdicion => ({
  id: edicion.id,
  evento: edicion.evento,
  tipoEvento: edicion.evento.includes("Boda") ? "Boda" : "Corporativo",
  personal: edicion.editor,
  lugar: edicion.lugar || "Por definir",
  fechaInicio: edicion.fechaInicio,
  fechaFin: edicion.fechaEntrega,
  nombreArchivo: edicion.nombreArchivo || `archivo_${edicion.id}.mp4`,
  datosAdicionales: "",
  revisionAudio: false,
  revisionColor: false,
  revisionFinal: false,
  editor: edicion.editor,
  prioridad: edicion.prioridad,
  camaras: 3,
  tiemposCamaras: [
    { horas: 2, minutos: 30 },
    { horas: 2, minutos: 30 },
    { horas: 2, minutos: 30 },
  ],
  fechaEdicionInicio: edicion.fechaInicio,
  fechaEdicionFin: edicion.fechaEntrega,
  capitulos: 4,
  tiempoTotalHoras: 5,
  tiempoTotalMinutos: 15,
  trailerEstado: "Proceso",
  fotosBrutoCantidad: 120,
  fotosBrutoFormato: "RAW",
  fotosEditadasCantidad: 48,
  fotosEditadasListas: false,
  fotosEditadasFormato: "JPEG",
  estadoEdicion: edicion.estado,
  observaciones: "",
  entregaMedio: "USB",
  usbSize: "64GB",
  usbCantidad: 1,
  dvdCount: 0,
  blurayCount: 0,
  otrosEntrega: "",
  estadoEntregaFinal: "En proceso",
  estadoEntregaFinalOtros: "",
});

export function Ediciones() {
  const { 
    ediciones, 
    setEdiciones, 
    almacenamientos, 
    setAlmacenamientos, 
    eventosDesignados, 
    setEventosDesignados,
    horarioEventos,
    contracts,
    personalList
  } = useAppData();

  const availableEditors = personalList.filter(p => p.rol === "Editor").map(p => `${p.nombres} ${p.apellidos}`);

  // Editores cargados desde la DB para mapear nombre -> id
  const [editoresDb, setEditoresDb] = useState<{ id: number; nombre: string }[]>([]);
  useEffect(() => {
    fetch("http://localhost:3001/api/editores")
      .then(r => r.json())
      .then(setEditoresDb)
      .catch(() => {});
  }, []);

  // Normaliza string quitando tildes para comparar nombres
  const normalizeStr = (s: string) =>
    s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  const findEditorId = (nombre: string): number | null => {
    const match = editoresDb.find(e => normalizeStr(e.nombre) === normalizeStr(nombre));
    return match?.id ?? null;
  };
  
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("Todos");
  const [openDesignarEvento, setOpenDesignarEvento] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<DetallesEdicion | null>(null);
  const [viewModalEdicion, setViewModalEdicion] = useState<Edicion | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<Almacenamiento | null>(null);
  const [openStorageForm, setOpenStorageForm] = useState(false);
  const [storageFormMode, setStorageFormMode] = useState<"create" | "edit">("create");
  const [storageFormData, setStorageFormData] = useState<Omit<Almacenamiento, "id">>({
    nombre: "",
    tamano: "",
    condiciones: "",
  });
  const [storageEditingId, setStorageEditingId] = useState<number | null>(null);
  const [designarAlmacenamiento, setDesignarAlmacenamiento] = useState<number>(almacenamientos[0]?.id ?? 1);
  const [designarEvento, setDesignarEvento] = useState<number>(ediciones[0]?.id ?? 1);
  const [selectedAsignacion, setSelectedAsignacion] = useState<number | null>(null);
  const [designarArchivoNombre, setDesignarArchivoNombre] = useState("");
  const [designarDatosAdicionales, setDesignarDatosAdicionales] = useState("");
  const [designarRevisionAudio, setDesignarRevisionAudio] = useState(false);
  const [designarRevisionColor, setDesignarRevisionColor] = useState(false);
  const [designarRevisionFinal, setDesignarRevisionFinal] = useState(false);

  const selectedEvento = ediciones.find((item) => item.id === designarEvento);
  const selectedAlmacenamientoItem = almacenamientos.find((item) => item.id === designarAlmacenamiento);
  const currentAsignacion = eventosDesignados.find((item) => item.id === selectedAsignacion);

  const selectedContratoForDesignar = contracts.find((c) => c.nombreEvento === selectedEvento?.evento);
  const selectedEventoTipo = selectedContratoForDesignar && selectedContratoForDesignar.tipoEvento === "Otros"
    ? selectedContratoForDesignar.tipoEventoOtro
    : selectedContratoForDesignar?.tipoEvento || (selectedEvento
      ? selectedEvento.evento.toLowerCase().includes("boda")
        ? "Boda"
        : selectedEvento.evento.toLowerCase().includes("corporativo")
        ? "Corporativo"
        : "Evento social"
      : "Evento social");

  useEffect(() => {
    if (ediciones.length === 0) {
      setDesignarEvento(0);
      return;
    }

    if (!ediciones.some((item) => item.id === designarEvento)) {
      setDesignarEvento(ediciones[0].id);
    }
  }, [ediciones, designarEvento]);

  const filteredEdiciones = ediciones.filter((edicion) => {
    const matchesSearch =
      edicion.evento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      edicion.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterEstado === "Todos" || edicion.estado === filterEstado;
    return matchesSearch && matchesFilter;
  });

  const getEstadoBadge = (estado: string) => {
    const styles = {
      "Sin Iniciar": "bg-gray-100 text-gray-800",
      "En Proceso": "bg-blue-100 text-blue-800",
      Revisión: "bg-yellow-100 text-yellow-800",
      Completado: "bg-green-100 text-green-800",
      Entregado: "bg-purple-100 text-purple-800",
    };
    return styles[estado as keyof typeof styles] || styles["Sin Iniciar"];
  };

  const getPrioridadBadge = (prioridad: string) => {
    const styles = {
      Alta: "bg-red-100 text-red-800",
      Media: "bg-yellow-100 text-yellow-800",
      Baja: "bg-green-100 text-green-800",
    };
    return styles[prioridad as keyof typeof styles] || styles.Media;
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "En Proceso":
        return <Play className="w-4 h-4" />;
      case "Revisión":
        return <Pause className="w-4 h-4" />;
      case "Completado":
      case "Entregado":
        return <CheckCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleViewDetails = (edicion: Edicion) => {
    setSelectedDetails(getInitialDetails(edicion));
  };

  const handleOpenViewModal = (edicion: Edicion) => {
    setViewModalEdicion(edicion);
  };

  const handleCloseViewModal = () => {
    setViewModalEdicion(null);
  };

  const handleEditDetails = (edicion: Edicion) => {
    setSelectedDetails(getInitialDetails(edicion));
  };

  const handleDeleteEdicion = (id: number) => {
    const confirmed = window.confirm("¿Estás seguro de que deseas eliminar esta edición?");
    if (!confirmed) return;
    // Actualizar UI inmediatamente
    setEdiciones((prev) => prev.filter((item) => item.id !== id));
    if (selectedDetails?.id === id) setSelectedDetails(null);
    // Persistir en MySQL
    fetch(`http://localhost:3001/api/eventos/${id}`, { method: "DELETE" })
      .catch(() => console.error("Error al eliminar evento en DB"));
  };

  const handleViewStorage = (item: Almacenamiento) => {
    setSelectedStorage(item);
    setOpenStorageForm(false);
  };

  const handleEditStorage = (item: Almacenamiento) => {
    setSelectedStorage(item);
    setStorageFormMode("edit");
    setStorageEditingId(item.id);
    setStorageFormData({ nombre: item.nombre, tamano: item.tamano, condiciones: item.condiciones });
    setOpenStorageForm(true);
  };

  const handleDeleteStorage = (id: number) => {
    // Actualizar UI inmediatamente
    setAlmacenamientos((prev) => prev.filter((item) => item.id !== id));
    if (selectedStorage?.id === id) setSelectedStorage(null);
    // Persistir en MySQL
    fetch(`http://localhost:3001/api/almacenamientos/${id}`, { method: "DELETE" })
      .catch(() => console.error("Error al eliminar almacenamiento en DB"));
  };

  const handleAddStorage = () => {
    setStorageFormMode("create");
    setStorageEditingId(null);
    setStorageFormData({ nombre: "", tamano: "", condiciones: "" });
    setSelectedStorage(null);
    setOpenStorageForm(true);
  };

  const handleSaveStorage = async () => {
    if (!storageFormData.nombre.trim() || !storageFormData.tamano.trim()) {
      window.alert("Completa el nombre y el tamaño del almacenamiento.");
      return;
    }

    if (storageFormMode === "edit" && storageEditingId !== null) {
      // Actualizar UI
      setAlmacenamientos((prev) =>
        prev.map((item) =>
          item.id === storageEditingId ? { ...item, ...storageFormData } : item
        )
      );
      // Persistir en MySQL
      try {
        await fetch(`http://localhost:3001/api/almacenamientos/${storageEditingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(storageFormData),
        });
        window.alert("Almacenamiento actualizado correctamente");
      } catch {
        window.alert("Guardado localmente, pero no se pudo actualizar en la base de datos.");
      }
    } else {
      // Crear en MySQL primero para obtener el ID real
      try {
        const res = await fetch("http://localhost:3001/api/almacenamientos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(storageFormData),
        });
        const data = await res.json();
        setAlmacenamientos((prev) => [...prev, { id: data.id, ...storageFormData }]);
        window.alert("Almacenamiento agregado correctamente");
      } catch {
        const nextId = Math.max(0, ...almacenamientos.map((item) => item.id)) + 1;
        setAlmacenamientos((prev) => [...prev, { id: nextId, ...storageFormData }]);
        window.alert("Guardado localmente, pero no se pudo registrar en la base de datos.");
      }
    }

    setOpenStorageForm(false);
    setStorageEditingId(null);
  };

  const handleCancelStorageForm = () => {
    setOpenStorageForm(false);
    setStorageEditingId(null);
  };

  const handleUpdateList = () => {
    setSearchTerm("");
    setFilterEstado("Todos");
    window.alert("Listado actualizado");
  };

  const handleViewDesignacion = (id: number) => {
    setSelectedAsignacion(id);
  };

  const handleSaveDesignarEvento = async () => {
    const almacen = almacenamientos.find((item) => item.id === designarAlmacenamiento);
    const evento = ediciones.find((item) => item.id === designarEvento);

    if (!almacen || !evento) {
      window.alert("Selecciona un almacenamiento y un evento válidos.");
      return;
    }

    const fechaHoy = new Date().toISOString().slice(0, 10);

    try {
      const res = await fetch("http://localhost:3001/api/evento_almacenamiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          evento_id: evento.id,
          almacenamiento_id: almacen.id,
          fecha_asignacion: fechaHoy,
          notas: designarDatosAdicionales,
        }),
      });
      const data = await res.json();
      setEventosDesignados((prev) => [
        ...prev,
        {
          id: data.id,
          evento: evento.evento,
          almacen: almacen.nombre,
          fecha: new Date(fechaHoy).toLocaleDateString("es-ES"),
        },
      ]);
      window.alert("Evento designado correctamente");
    } catch {
      // Fallback local
      setEventosDesignados((prev) => [
        ...prev,
        {
          id: Math.max(0, ...prev.map((item) => item.id)) + 1,
          evento: evento.evento,
          almacen: almacen.nombre,
          fecha: new Date(fechaHoy).toLocaleDateString("es-ES"),
        },
      ]);
      window.alert("Guardado localmente, pero no se pudo registrar en la base de datos.");
    }

    // Resetear campos del formulario
    setDesignarArchivoNombre("");
    setDesignarDatosAdicionales("");
    setDesignarRevisionAudio(false);
    setDesignarRevisionColor(false);
    setDesignarRevisionFinal(false);
    setOpenDesignarEvento(false);
  };

  const mapEdicionEstado = (estado: string): Edicion["estado"] => {
    switch (estado) {
      case "En Proceso":
        return "En Proceso";
      case "Revisión":
        return "Revisión";
      case "Listo":
        return "Completado";
      case "Entregado":
        return "Entregado";
      default:
        return "Sin Iniciar";
    }
  };

  const handleSaveDetails = async () => {
    if (!selectedDetails) return;

    const mappedEstado = mapEdicionEstado(selectedDetails.estadoEdicion);
    const progreso =
      mappedEstado === "Completado" || mappedEstado === "Entregado" ? 100
      : mappedEstado === "En Proceso" ? 60
      : 0;

    const newEdicion: Edicion = {
      id: selectedDetails.id,
      evento: selectedDetails.evento || `Evento ${selectedDetails.id}`,
      cliente: selectedDetails.personal || "Cliente pendiente",
      editor: selectedDetails.editor || "Sin asignar",
      fechaInicio: selectedDetails.fechaInicio,
      fechaEntrega: selectedDetails.fechaEdicionFin || selectedDetails.fechaFin,
      progreso,
      estado: mappedEstado,
      prioridad: selectedDetails.prioridad,
      duracionEstimada: `${selectedDetails.tiempoTotalHoras}h ${selectedDetails.tiempoTotalMinutos}m`,
      lugar: selectedDetails.lugar,
      nombreArchivo: selectedDetails.nombreArchivo,
    };

    // Actualizar UI inmediatamente
    setEdiciones((prev) => {
      const exists = prev.some((item) => item.id === selectedDetails.id);
      return exists
        ? prev.map((item) => (item.id === selectedDetails.id ? newEdicion : item))
        : [...prev, newEdicion];
    });

    // Persistir en MySQL
    try {
      await fetch(`http://localhost:3001/api/eventos/${selectedDetails.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          estado: mappedEstado,
          prioridad: selectedDetails.prioridad,
          progreso,
          editor_id: findEditorId(selectedDetails.editor),
          lugar: selectedDetails.lugar,
          archivo_nombre: selectedDetails.nombreArchivo,
          duracion_estimada: `${selectedDetails.tiempoTotalHoras}h ${selectedDetails.tiempoTotalMinutos}m`,
          revision_audio: selectedDetails.revisionAudio,
          revision_color: selectedDetails.revisionColor,
          revision_final: selectedDetails.revisionFinal,
          fecha_edicion_inicio: selectedDetails.fechaEdicionInicio,
          fecha_edicion_fin: selectedDetails.fechaEdicionFin,
          capitulos: selectedDetails.capitulos,
          tiempo_total_horas: selectedDetails.tiempoTotalHoras,
          tiempo_total_minutos: selectedDetails.tiempoTotalMinutos,
          trailer_estado: selectedDetails.trailerEstado,
          fotos_bruto_cantidad: selectedDetails.fotosBrutoCantidad,
          fotos_bruto_formato: selectedDetails.fotosBrutoFormato,
          fotos_editadas_cantidad: selectedDetails.fotosEditadasCantidad,
          fotos_editadas_listas: selectedDetails.fotosEditadasListas,
          fotos_editadas_formato: selectedDetails.fotosEditadasFormato,
          observaciones: selectedDetails.observaciones,
          entrega_medio: selectedDetails.entregaMedio,
          usb_size: selectedDetails.usbSize,
          usb_cantidad: selectedDetails.usbCantidad,
          dvd_count: selectedDetails.dvdCount,
          bluray_count: selectedDetails.blurayCount,
          otros_entrega: selectedDetails.otrosEntrega,
          estado_entrega_final: selectedDetails.estadoEntregaFinal,
          estado_entrega_final_otros: selectedDetails.estadoEntregaFinalOtros,
        }),
      });
      window.alert("✅ Detalles guardados correctamente en la base de datos");
    } catch {
      window.alert("⚠️ Guardado localmente. No se pudo conectar con la base de datos.");
    }
  };

  const updateSelectedDetail = <K extends keyof DetallesEdicion>(key: K, value: DetallesEdicion[K]) => {
    setSelectedDetails((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const enProceso = ediciones.filter((e) => e.estado === "En Proceso").length;
  const pendientes = ediciones.filter((e) => e.estado === "Sin Iniciar").length;
  const completados = ediciones.filter(
    (e) => e.estado === "Completado" || e.estado === "Entregado"
  ).length;

  // Helpers para resolver campos del Panel de Edición desde contrato/horario
  const getTipoEvento = (edicion: Edicion): string => {
    const contrato = contracts.find(c => c.nombreEvento === edicion.evento);
    if (contrato) {
      return contrato.tipoEvento === "Otros"
        ? contrato.tipoEventoOtro || "Otro"
        : contrato.tipoEvento;
    }
    const n = edicion.evento.toLowerCase();
    if (n.includes("boda") || n.includes("matrimonio")) return "Boda";
    if (n.includes("xv") || n.includes("quince")) return "XV Años";
    if (n.includes("corporativo") || n.includes("empresa")) return "Corporativo";
    if (n.includes("cumpleaños") || n.includes("cumplean")) return "Cumpleaños";
    if (n.includes("social")) return "Evento social";
    return edicion.estado === "En Proceso" ? "Evento social" : "Evento social";
  };

  const getPersonalEvento = (edicion: Edicion): string => {
    const horario = Object.values(horarioEventos).flat().find(h => h.titulo === edicion.evento);
    if (horario?.personal?.length) return horario.personal.join(", ");
    if (edicion.editor && edicion.editor !== "Sin asignar") return edicion.editor;
    return "Sin asignar";
  };

  const getLugarEvento = (edicion: Edicion): string => {
    if (edicion.lugar && edicion.lugar !== "Por definir") return edicion.lugar;
    const contrato = contracts.find(c => c.nombreEvento === edicion.evento);
    if (contrato?.direccion) return contrato.direccion;
    const horario = Object.values(horarioEventos).flat().find(h => h.titulo === edicion.evento);
    if (horario?.ubicacion) return horario.ubicacion;
    return "Por definir";
  };

  const getArchivoEvento = (edicion: Edicion): string => {
    if (edicion.nombreArchivo) return edicion.nombreArchivo;
    return "— Sin archivo";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ediciones</h1>
          <p className="mt-1 text-gray-600">Gestiona el proceso de edición de videos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Ediciones</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{ediciones.length}</div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="text-sm text-gray-600">En Proceso</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{enProceso}</div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="text-sm text-gray-600">Pendientes</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">{pendientes}</div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="text-sm text-gray-600">Completados</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{completados}</div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por evento o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Todos">Todos los estados</option>
          <option value="Sin Iniciar">Sin Iniciar</option>
          <option value="En Proceso">En Proceso</option>
          <option value="Revisión">Revisión</option>
          <option value="Completado">Completado</option>
          <option value="Entregado">Entregado</option>
        </select>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Almacenamiento</h2>
              <p className="text-sm text-gray-600">Gestiona los discos duros y sus condiciones.</p>
            </div>
            <button onClick={handleAddStorage} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
              <FolderPlus className="w-4 h-4" />
              Agregar Almacenamiento
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-gray-700">
              <thead className="bg-slate-50 text-slate-900">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Nombre de Disco Duro</th>
                  <th className="px-4 py-3 font-semibold">Tamaño de Almacenamiento (TB)</th>
                  <th className="px-4 py-3 font-semibold">Condiciones</th>
                  <th className="px-4 py-3 font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {almacenamientos.map((item) => (
                  <tr key={item.id} className="border-t border-gray-200 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">{item.id.toString().padStart(2, "0")}</td>
                    <td className="px-4 py-3">{item.nombre}</td>
                    <td className="px-4 py-3">{item.tamano}</td>
                    <td className="px-4 py-3">{item.condiciones}</td>
                    <td className="px-4 py-3 space-x-2">
                      <button
                        onClick={() => handleViewStorage(item)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                      >
                        <Eye className="w-4 h-4" /> Ver
                      </button>
                      <button
                        onClick={() => handleEditStorage(item)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200"
                      >
                        <Edit3 className="w-4 h-4" /> Editar
                      </button>
                      <button
                        onClick={() => handleDeleteStorage(item.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
                      >
                        <Trash2 className="w-4 h-4" /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {openStorageForm && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{storageFormMode === "edit" ? "Editar Almacenamiento" : "Agregar Almacenamiento"}</h3>
                  <p className="text-sm text-slate-600">Actualiza el nombre, tamaño y condiciones del disco.</p>
                </div>
                <button
                  onClick={handleCancelStorageForm}
                  className="text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Nombre de Disco</label>
                  <input
                    type="text"
                    value={storageFormData.nombre}
                    onChange={(e) => setStorageFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Disco Nuevo"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tamaño</label>
                  <input
                    type="text"
                    value={storageFormData.tamano}
                    onChange={(e) => setStorageFormData((prev) => ({ ...prev, tamano: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Ej. 2 TB"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Condiciones</label>
                  <input
                    type="text"
                    value={storageFormData.condiciones}
                    onChange={(e) => setStorageFormData((prev) => ({ ...prev, condiciones: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Activo, sin errores"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCancelStorageForm}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-slate-700 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveStorage}
                  className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                >
                  Guardar
                </button>
              </div>
            </div>
          )}

          {selectedStorage && !openStorageForm && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{selectedStorage.nombre}</h3>
                  <p className="text-sm text-slate-600">Estado: {selectedStorage.condiciones}</p>
                </div>
                <button
                  onClick={() => setSelectedStorage(null)}
                  className="text-sm text-slate-600 hover:text-slate-900"
                >
                  Cerrar
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-3 text-sm text-slate-700">
                <div>
                  <span className="font-semibold text-slate-900">Tamaño</span>
                  <p>{selectedStorage.tamano}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">Condiciones</span>
                  <p>{selectedStorage.condiciones}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditStorage(selectedStorage)}
                    className="px-3 py-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Eventos Almacenados</h2>
              <p className="text-sm text-gray-600">Designa eventos a los almacenes disponibles.</p>
            </div>
            <button
              onClick={() => setOpenDesignarEvento(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Designar Evento
            </button>
          </div>

          <div className="space-y-4">
            {eventosDesignados.map((item) => (
              <div key={item.id} className="rounded-2xl border border-gray-200 p-4 bg-slate-50">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.evento}</h3>
                    <p className="text-sm text-slate-600">{item.almacen} — {item.fecha}</p>
                  </div>
                  <button
                    onClick={() => handleViewDesignacion(item.id)}
                    className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900"
                  >
                    <Eye className="w-4 h-4" /> Ver
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedAsignacion && currentAsignacion && (() => {
            const contratoAsignado = contracts.find(c => c.nombreEvento === currentAsignacion.evento);
            return (
              <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{currentAsignacion.evento}</h3>
                    <p className="text-sm text-slate-600">Asignado en {currentAsignacion.almacen}</p>
                  </div>
                  <button
                    onClick={() => setSelectedAsignacion(null)}
                    className="text-sm text-slate-600 hover:text-slate-900"
                  >
                    Cerrar
                  </button>
                </div>
                <p className="text-sm text-slate-700 mb-4">Fecha de asignación: {currentAsignacion.fecha}</p>
                {contratoAsignado ? (
                  <div className="grid gap-3 sm:grid-cols-2 text-sm bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    <div><span className="font-semibold text-slate-900">Cliente:</span> {contratoAsignado.apellidosNombres}</div>
                    <div><span className="font-semibold text-slate-900">DNI:</span> {contratoAsignado.dni}</div>
                    <div><span className="font-semibold text-slate-900">Teléfono:</span> {contratoAsignado.telefono}</div>
                    <div><span className="font-semibold text-slate-900">Tipo:</span> {contratoAsignado.tipoEvento === "Otros" ? contratoAsignado.tipoEventoOtro : contratoAsignado.tipoEvento}</div>
                    <div><span className="font-semibold text-slate-900">Lugar/Dirección:</span> {contratoAsignado.direccion || "No especificada"}</div>
                    <div><span className="font-semibold text-slate-900">Observaciones:</span> {contratoAsignado.observaciones || "Sin observaciones"}</div>
                  </div>
                ) : (
                  <p className="text-sm italic text-slate-500">No se encontraron detalles del contrato para este evento.</p>
                )}
              </div>
            );
          })()}

          {openDesignarEvento && (
            <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-inner">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Designar Evento</h3>
                  <p className="text-sm text-slate-600">Completa el formulario para enlazar un evento con un almacenamiento.</p>
                </div>
                <button
                  onClick={() => setOpenDesignarEvento(false)}
                  className="text-slate-600 hover:text-slate-900"
                >
                  Cancelar
                </button>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Seleccionar Almacenamiento</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Buscar por nombre o fecha"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={designarAlmacenamiento}
                      onChange={(e) => setDesignarAlmacenamiento(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {almacenamientos.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.nombre} - {item.tamano}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Seleccionar Evento</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Buscar por nombre o fecha"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <select
                      value={designarEvento}
                      onChange={(e) => setDesignarEvento(Number(e.target.value))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {ediciones.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.evento}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Tipo de Evento</label>
                    <input
                      type="text"
                      disabled
                      value={selectedEventoTipo}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-slate-100 text-slate-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Personal</label>
                    <input
                      type="text"
                      disabled
                      value={Object.values(horarioEventos).flat().find(h => h.titulo === selectedEvento?.evento)?.personal?.join(", ") || selectedEvento?.editor || "Equipo de filmación A"}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-slate-100 text-slate-600"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Lugar</label>
                    <input type="text" disabled value={selectedContratoForDesignar?.direccion || "Por definir"} className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-slate-100 text-slate-600" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Fecha inicio</label>
                    <input
                      type="date"
                      disabled
                      value={selectedEvento?.fechaInicio ?? ""}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Fecha fin</label>
                    <input
                      type="date"
                      disabled
                      value={selectedEvento?.fechaEntrega ?? ""}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Nombre del Archivo</label>
                    <input
                      type="text"
                      placeholder="Ej. boda_ana_carlos.mp4"
                      value={designarArchivoNombre}
                      onChange={(e) => setDesignarArchivoNombre(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Datos adicionales</label>
                    <textarea
                      rows={3}
                      placeholder="Notas del evento, observaciones..."
                      value={designarDatosAdicionales}
                      onChange={(e) => setDesignarDatosAdicionales(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={designarRevisionAudio}
                      onChange={(e) => setDesignarRevisionAudio(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600"
                    />
                    Revisión de audio
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={designarRevisionColor}
                      onChange={(e) => setDesignarRevisionColor(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600"
                    />
                    Revisión de color
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={designarRevisionFinal}
                      onChange={(e) => setDesignarRevisionFinal(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600"
                    />
                    Revisión final de calidad
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setOpenDesignarEvento(false)}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-slate-700 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                  <button onClick={handleSaveDesignarEvento} className="px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800">
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <section className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Panel de Edición</h2>
            <p className="text-sm text-gray-600">Revisa y actualiza los eventos de edición registrados.</p>
          </div>
          <button onClick={handleUpdateList} className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors">
            <ClipboardList className="w-4 h-4" />
            Actualizar listado
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm text-slate-700">
            <thead className="bg-slate-50 text-slate-900">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Nombre del Evento</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Personal</th>
                <th className="px-4 py-3">Lugar</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Archivo</th>
                <th className="px-4 py-3">Acciones</th>
                <th className="px-4 py-3">Detalles de Edición</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredEdiciones.map((edicion) => (
                <tr key={edicion.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-900">{edicion.id}</td>
                  <td className="px-4 py-3">{edicion.evento}</td>
                  <td className="px-4 py-3">{getTipoEvento(edicion)}</td>
                  <td className="px-4 py-3">{getPersonalEvento(edicion)}</td>
                  <td className="px-4 py-3">{getLugarEvento(edicion)}</td>
                  <td className="px-4 py-3">{new Date(edicion.fechaInicio).toLocaleDateString("es-ES")}</td>
                  <td className="px-4 py-3">{getArchivoEvento(edicion)}</td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => handleOpenViewModal(edicion)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">
                      <Eye className="w-4 h-4" /> Ver
                    </button>
                    <button onClick={() => handleEditDetails(edicion)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200">
                      <Edit3 className="w-4 h-4" /> Editar
                    </button>
                    <button onClick={() => handleDeleteEdicion(edicion.id)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-100 text-red-700 hover:bg-red-200">
                      <Trash2 className="w-4 h-4" /> Borrar
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleViewDetails(edicion)} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200">
                      <FileText className="w-4 h-4" /> Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {viewModalEdicion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Detalles rápidos</h3>
                  <p className="text-sm text-slate-600">Resumen rápido del evento seleccionado.</p>
                </div>
                <button
                  onClick={handleCloseViewModal}
                  className="rounded-full bg-slate-100 px-3 py-2 text-slate-600 hover:bg-slate-200"
                >
                  X
                </button>
              </div>
              <div className="space-y-4 px-6 py-5 text-slate-700">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="block text-sm font-semibold text-slate-900">Evento</span>
                    <p>{viewModalEdicion.evento}</p>
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-900">Cliente</span>
                    <p>{viewModalEdicion.cliente}</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="block text-sm font-semibold text-slate-900">Editor</span>
                    <p>{viewModalEdicion.editor}</p>
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-900">Estado</span>
                    <p>{viewModalEdicion.estado}</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="block text-sm font-semibold text-slate-900">Inicio</span>
                    <p>{new Date(viewModalEdicion.fechaInicio).toLocaleDateString("es-ES")}</p>
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-900">Entrega</span>
                    <p>{new Date(viewModalEdicion.fechaEntrega).toLocaleDateString("es-ES")}</p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <span className="block text-sm font-semibold text-slate-900">Duración estimada</span>
                    <p>{viewModalEdicion.duracionEstimada}</p>
                  </div>
                  <div>
                    <span className="block text-sm font-semibold text-slate-900">Progreso</span>
                    <p>{viewModalEdicion.progreso}%</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end border-t border-slate-200 px-6 py-4">
                <button
                  onClick={handleCloseViewModal}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        {selectedDetails ? (
          <div className="mt-6 grid gap-6">
            <div className="bg-slate-50 rounded-3xl border border-slate-200 p-5">
              <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Detalles de edición</h3>
                  <p className="text-sm text-slate-600">Edita los campos del evento seleccionado.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSelectedDetails(null)}
                    className="rounded-full bg-slate-100 px-3 py-2 text-slate-600 hover:bg-slate-200"
                  >
                    X
                  </button>
                  <button onClick={handleSaveDetails} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">
                    <ChevronDown className="w-4 h-4" /> Guardar cambios
                  </button>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="space-y-3">
                  <div className="grid gap-2 sm:grid-cols-2">
                      <div>
                      <label className="text-sm font-medium text-slate-700">Editor</label>
                      <select
                        value={selectedDetails.editor}
                        onChange={(e) => updateSelectedDetail("editor", e.target.value as any)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        {availableEditors.map((editor) => (
                          <option key={editor} value={editor}>
                            {editor}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Prioridad</label>
                      <select
                        value={selectedDetails.prioridad}
                        onChange={(e) => updateSelectedDetail("prioridad", e.target.value as any)}
                        className={`w-full px-4 py-2 border rounded-lg ${
                          selectedDetails.prioridad === "Alta"
                            ? "border-red-400 bg-red-50 text-red-900"
                            : selectedDetails.prioridad === "Media"
                            ? "border-yellow-400 bg-yellow-50 text-yellow-900"
                            : "border-green-400 bg-green-50 text-green-900"
                        }`}
                      >
                        <option value="Alta">🔴 Alta</option>
                        <option value="Media">🟡 Media</option>
                        <option value="Baja">🟢 Baja</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Lugar del Evento</label>
                      <input
                        type="text"
                        value={selectedDetails.lugar}
                        onChange={(e) => updateSelectedDetail("lugar", e.target.value as any)}
                        placeholder="Ej. Salón Los Olivos"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Nombre del Archivo</label>
                      <input
                        type="text"
                        value={selectedDetails.nombreArchivo}
                        onChange={(e) => updateSelectedDetail("nombreArchivo", e.target.value as any)}
                        placeholder="Ej. boda_ana_carlos.mp4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-1">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Cámaras / Filmadoras</label>
                      <input
                        type="number"
                        min={1}
                        value={selectedDetails.camaras}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          updateSelectedDetail("camaras", val as any);
                          const currentTiempos = selectedDetails.tiemposCamaras || Array(selectedDetails.camaras).fill({ horas: 0, minutos: 0 });
                          const diff = val - currentTiempos.length;
                          if (diff > 0) {
                            updateSelectedDetail("tiemposCamaras", [...currentTiempos, ...Array(diff).fill({ horas: 0, minutos: 0 })] as any);
                          } else if (diff < 0) {
                            updateSelectedDetail("tiemposCamaras", currentTiempos.slice(0, val) as any);
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg max-w-[200px]"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {Array.from({ length: selectedDetails.camaras }).map((_, idx) => (
                      <div key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <label className="text-sm font-medium text-slate-700 mb-2 block">Tiempo cámara {idx + 1}</label>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            min={0}
                            placeholder="hrs"
                            value={selectedDetails.tiemposCamaras?.[idx]?.horas || 0}
                            onChange={(e) => {
                              const newTiempos = [...(selectedDetails.tiemposCamaras || Array(selectedDetails.camaras).fill({ horas: 0, minutos: 0 }))];
                              newTiempos[idx] = { ...newTiempos[idx], horas: Number(e.target.value) };
                              updateSelectedDetail("tiemposCamaras", newTiempos as any);
                            }}
                            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                          />
                          <input
                            type="number"
                            min={0}
                            max={59}
                            placeholder="min"
                            value={selectedDetails.tiemposCamaras?.[idx]?.minutos || 0}
                            onChange={(e) => {
                              const newTiempos = [...(selectedDetails.tiemposCamaras || Array(selectedDetails.camaras).fill({ horas: 0, minutos: 0 }))];
                              newTiempos[idx] = { ...newTiempos[idx], minutos: Number(e.target.value) };
                              updateSelectedDetail("tiemposCamaras", newTiempos as any);
                            }}
                            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 mt-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Fecha de Edición inicio</label>
                      <input
                        type="date"
                        value={selectedDetails.fechaEdicionInicio}
                        onChange={(e) => updateSelectedDetail("fechaEdicionInicio", e.target.value as any)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Fecha de Edición fin</label>
                      <input
                        type="date"
                        value={selectedDetails.fechaEdicionFin}
                        onChange={(e) => updateSelectedDetail("fechaEdicionFin", e.target.value as any)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Capítulos</label>
                      <input
                        type="number"
                        min={0}
                        value={selectedDetails.capitulos}
                        onChange={(e) => updateSelectedDetail("capitulos", Number(e.target.value) as any)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Tiempo total editado</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={0}
                          placeholder="hrs"
                          value={selectedDetails.tiempoTotalHoras}
                          onChange={(e) => updateSelectedDetail("tiempoTotalHoras", Number(e.target.value) as any)}
                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <input
                          type="number"
                          min={0}
                          max={59}
                          placeholder="min"
                          value={selectedDetails.tiempoTotalMinutos}
                          onChange={(e) => updateSelectedDetail("tiempoTotalMinutos", Number(e.target.value) as any)}
                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Trailer</label>
                      <select
                        value={selectedDetails.trailerEstado}
                        onChange={(e) => updateSelectedDetail("trailerEstado", e.target.value as any)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option>Listo</option>
                        <option>Proceso</option>
                        <option>No iniciado</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Fotos en Bruto</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={0}
                          value={selectedDetails.fotosBrutoCantidad}
                          onChange={(e) => updateSelectedDetail("fotosBrutoCantidad", Number(e.target.value) as any)}
                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <select
                          value={selectedDetails.fotosBrutoFormato}
                          onChange={(e) => updateSelectedDetail("fotosBrutoFormato", e.target.value as any)}
                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                        >
                          <option>RAW</option>
                          <option>JPEG</option>
                          <option>PNG</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Fotos editadas</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={0}
                          value={selectedDetails.fotosEditadasCantidad}
                          onChange={(e) => updateSelectedDetail("fotosEditadasCantidad", Number(e.target.value) as any)}
                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={selectedDetails.fotosEditadasListas}
                            onChange={(e) => updateSelectedDetail("fotosEditadasListas", e.target.checked as any)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600"
                          />
                          Listas
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Formato fotos editadas</label>
                      <select
                        value={selectedDetails.fotosEditadasFormato}
                        onChange={(e) => updateSelectedDetail("fotosEditadasFormato", e.target.value as any)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option>JPEG</option>
                        <option>PNG</option>
                        <option>TIFF</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Estado de Edición</label>
                      <select
                        value={selectedDetails.estadoEdicion}
                        onChange={(e) => updateSelectedDetail("estadoEdicion", e.target.value as any)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option>Sin Iniciar</option>
                        <option>En Proceso</option>
                        <option>Revisión</option>
                        <option>Listo</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Observaciones</label>
                      <textarea
                        rows={3}
                        value={selectedDetails.observaciones}
                        onChange={(e) => updateSelectedDetail("observaciones", e.target.value as any)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Comentario adicional"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl border border-gray-200 bg-white p-5">
                  <h4 className="text-base font-semibold text-slate-900 mb-3">Formato de Entrega</h4>
                  <div className="grid gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Medio</label>
                      <select
                        value={selectedDetails.entregaMedio}
                        onChange={(e) => updateSelectedDetail("entregaMedio", e.target.value as any)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                      >
                        <option>USB</option>
                        <option>DVD</option>
                        <option>BLURAY</option>
                        <option>OTROS</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      {selectedDetails.entregaMedio === "USB" && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="text-sm font-medium text-slate-700">Capacidad USB</label>
                            <select
                              value={selectedDetails.usbSize}
                              onChange={(e) => updateSelectedDetail("usbSize", e.target.value as any)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                              <option>16GB</option>
                              <option>32GB</option>
                              <option>64GB</option>
                              <option>128GB</option>
                              <option>256GB</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-700">Cantidad</label>
                            <input
                              type="number"
                              min={0}
                              value={selectedDetails.usbCantidad}
                              onChange={(e) => updateSelectedDetail("usbCantidad", Number(e.target.value) as any)}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                        </div>
                      )}
                      {selectedDetails.entregaMedio === "DVD" && (
                        <div>
                          <label className="text-sm font-medium text-slate-700">Cantidad DVD</label>
                          <input
                            type="number"
                            min={0}
                            value={selectedDetails.dvdCount}
                            onChange={(e) => updateSelectedDetail("dvdCount", Number(e.target.value) as any)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      )}
                      {selectedDetails.entregaMedio === "BLURAY" && (
                        <div>
                          <label className="text-sm font-medium text-slate-700">Cantidad BLURAY</label>
                          <input
                            type="number"
                            min={0}
                            value={selectedDetails.blurayCount}
                            onChange={(e) => updateSelectedDetail("blurayCount", Number(e.target.value) as any)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      )}
                      {selectedDetails.entregaMedio === "OTROS" && (
                        <div>
                          <label className="text-sm font-medium text-slate-700">Otros (Especificar)</label>
                          <input
                            type="text"
                            value={selectedDetails.otrosEntrega}
                            onChange={(e) => updateSelectedDetail("otrosEntrega", e.target.value as any)}
                            placeholder="Especificar"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-gray-200 bg-white p-5">
                  <h4 className="text-base font-semibold text-slate-900 mb-3">Estado de Entrega Final</h4>
                  <select
                    value={selectedDetails.estadoEntregaFinal}
                    onChange={(e) => updateSelectedDetail("estadoEntregaFinal", e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option>Listo</option>
                    <option>En proceso</option>
                    <option>No iniciado</option>
                    <option>Otros</option>
                  </select>
                  <input
                    type="text"
                    value={selectedDetails.estadoEntregaFinalOtros}
                    onChange={(e) => updateSelectedDetail("estadoEntregaFinalOtros", e.target.value as any)}
                    placeholder="Especificar si Otros"
                    className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-gray-200 bg-slate-50 p-8 text-center text-slate-600">
            Selecciona un evento en el Panel de Edición para ver los detalles completos de edición.
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredEdiciones.map((edicion) => (
          <div
            key={edicion.id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{edicion.evento}</h3>
                <p className="text-sm text-gray-600 mt-1">Cliente: {edicion.cliente}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPrioridadBadge(edicion.prioridad)}`}>
                {edicion.prioridad}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Editor:</span>
                <span className="font-medium text-gray-900">{edicion.editor}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Inicio:</span>
                <span className="text-gray-900">{new Date(edicion.fechaInicio).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Entrega:</span>
                <span className="text-gray-900">{new Date(edicion.fechaEntrega).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Duración:</span>
                <span className="text-gray-900">{edicion.duracionEstimada}</span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Progreso</span>
                <span className="font-medium text-gray-900">{edicion.progreso}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    edicion.progreso === 100
                      ? "bg-green-500"
                      : edicion.progreso >= 50
                      ? "bg-blue-500"
                      : "bg-yellow-500"
                  }`}
                  style={{ width: `${edicion.progreso}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${getEstadoBadge(edicion.estado)}`}>
                {getEstadoIcon(edicion.estado)}
                {edicion.estado}
              </span>
              <button
                onClick={() => handleViewDetails(edicion)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Ver detalles
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
