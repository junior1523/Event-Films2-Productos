import { useState } from "react";
import { useAppData, type Contrato, type Cuota, type RangoFilmacion } from "../context/AppDataContext";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  FileText,
  Download,
  X,
  Calendar as CalendarIcon,
} from "lucide-react";
import jsPDF from "jspdf";

const tiposEventoOpciones = [
  "Matrimonio",
  "XV Años",
  "Cumpleaños",
  "Bautizo",
  "Techado",
  "Fiesta Patronal",
  "Pedida de Mano",
  "Babyshower",
  "Bodas de Plata",
  "Bodas de Oro",
  "Bodas de Rubí",
  "Sepelio",
  "Misa de Año",
  "Santiago",
  "Huaylarsh",
  "Otros",
];

export function Contratos() {
  const { contracts: contratos, setContracts, setHorarioEventos, setEdiciones } = useAppData();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("Todos");
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState<Partial<Contrato>>({
    apellidosNombres: "",
    dni: "",
    telefono: "",
    tipoEvento: "",
    tipoEventoOtro: "",
    nombreEvento: "",
    direccion: "",
    fechaInicio: "",
    fechaFin: "",
    rangoFilmacion: [],
    planPagos: [{ numero: 1, monto: 0, fecha: "", pagado: false }],
    observaciones: "",
    estado: "Pendiente",
  });

  const parseFecha = (fechaStr: string) => {
    const [year, month, day] = fechaStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const calcularDias = (inicio: string, fin: string) => {
    if (!inicio || !fin) return 0;
    const [yearInicio, monthInicio, dayInicio] = inicio.split('-').map(Number);
    const [yearFin, monthFin, dayFin] = fin.split('-').map(Number);
    const date1 = new Date(yearInicio, monthInicio - 1, dayInicio);
    const date2 = new Date(yearFin, monthFin - 1, dayFin);
    const diffTime = Math.abs(date2.getTime() - date1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const generarRangoFilmacion = (inicio: string, fin: string) => {
    if (!inicio || !fin) return [];
    const rango: RangoFilmacion[] = [];
    const [yearInicio, monthInicio, dayInicio] = inicio.split('-').map(Number);
    const [yearFin, monthFin, dayFin] = fin.split('-').map(Number);
    const dateInicio = new Date(yearInicio, monthInicio - 1, dayInicio);
    const dateFin = new Date(yearFin, monthFin - 1, dayFin);

    for (
      let d = new Date(dateInicio);
      d <= dateFin;
      d.setDate(d.getDate() + 1)
    ) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      rango.push({
        dia: `${year}-${month}-${day}`,
        horaInicio: "",
        horaFin: "",
      });
    }
    return rango;
  };

  const handleFechaChange = (tipo: "inicio" | "fin", value: string) => {
    const newData = { ...formData };
    if (tipo === "inicio") {
      newData.fechaInicio = value;
    } else {
      newData.fechaFin = value;
    }

    if (newData.fechaInicio && newData.fechaFin) {
      newData.rangoFilmacion = generarRangoFilmacion(
        newData.fechaInicio,
        newData.fechaFin
      );
    }
    setFormData(newData);
  };

  const handleRangoFilmacionChange = (
    index: number,
    field: "horaInicio" | "horaFin",
    value: string
  ) => {
    const newRango = [...(formData.rangoFilmacion || [])];
    newRango[index] = { ...newRango[index], [field]: value };
    setFormData({ ...formData, rangoFilmacion: newRango });
  };

  const normalizeDateKey = (date: string) => {
    const [year, month, day] = date.split("-");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  };

  const getScheduleDays = () => {
    if (formData.rangoFilmacion && formData.rangoFilmacion.length > 0) {
      return formData.rangoFilmacion.map((day) => ({
        dia: normalizeDateKey(day.dia),
        horaInicio: day.horaInicio || "08:00 AM",
        horaFin: day.horaFin || "05:00 PM",
      }));
    }

    if (formData.fechaInicio && formData.fechaFin) {
      return generarRangoFilmacion(formData.fechaInicio, formData.fechaFin).map((day) => ({
        dia: normalizeDateKey(day.dia),
        horaInicio: day.horaInicio || "08:00 AM",
        horaFin: day.horaFin || "05:00 PM",
      }));
    }

    if (formData.fechaInicio) {
      return [
        {
          dia: normalizeDateKey(formData.fechaInicio),
          horaInicio: "08:00 AM",
          horaFin: "05:00 PM",
        },
      ];
    }

    return [];
  };

  const computeDuration = (startTime: string, endTime: string) => {
    const parseTime = (time: string) => {
      const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!match) return null;
      const [, hourText, minuteText, periodText] = match;
      const hour = Number(hourText);
      const minute = Number(minuteText);
      const period = periodText.toUpperCase();
      const totalMinutes = (hour % 12 + (period === "PM" ? 12 : 0)) * 60 + minute;
      return { totalMinutes, hour, minute, period };
    };

    const start = parseTime(startTime);
    const end = parseTime(endTime);
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

  const handlePlanPagosChange = (
    index: number,
    field: "monto" | "fecha",
    value: string | number
  ) => {
    const newPlan = [...(formData.planPagos || [])];
    newPlan[index] = { ...newPlan[index], [field]: value };
    setFormData({ ...formData, planPagos: newPlan });
  };

  const agregarCuota = () => {
    const newCuota: Cuota = {
      numero: (formData.planPagos?.length || 0) + 1,
      monto: 0,
      fecha: "",
      pagado: false,
    };
    setFormData({
      ...formData,
      planPagos: [...(formData.planPagos || []), newCuota],
    });
  };

  const eliminarCuota = (index: number) => {
    const newPlan = formData.planPagos?.filter((_, i) => i !== index) || [];
    setFormData({ ...formData, planPagos: newPlan });
  };

  const handleSubmit = async () => {
    if (isEditing && selectedContrato) {
      // 1. Actualizar Contrato en UI
      setContracts(contratos.map((c) =>
        c.id === selectedContrato.id ? ({ ...formData, id: selectedContrato.id } as Contrato) : c
      ));
      // 2. Persistir en DB
      try {
        await fetch(`http://localhost:3001/api/contratos/${selectedContrato.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apellidos_nombres: formData.apellidosNombres,
            dni: formData.dni,
            telefono: formData.telefono,
            tipo_evento: formData.tipoEvento,
            tipo_evento_otro: formData.tipoEventoOtro,
            nombre_evento: formData.nombreEvento,
            direccion: formData.direccion,
            fecha_inicio: formData.fechaInicio,
            fecha_fin: formData.fechaFin,
            rango_filmacion: formData.rangoFilmacion,
            plan_pagos: formData.planPagos,
            observaciones: formData.observaciones,
            estado: formData.estado
          }),
        });
      } catch (err) { console.error("Error al actualizar contrato:", err); }

    } else {
      // 1. Crear Contrato en DB primero
      try {
        const resContrato = await fetch("http://localhost:3001/api/contratos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            apellidos_nombres: formData.apellidosNombres,
            dni: formData.dni,
            telefono: formData.telefono,
            tipo_evento: formData.tipoEvento,
            tipo_evento_otro: formData.tipoEventoOtro,
            nombre_evento: formData.nombreEvento,
            direccion: formData.direccion,
            fecha_inicio: formData.fechaInicio,
            fecha_fin: formData.fechaFin,
            rango_filmacion: formData.rangoFilmacion,
            plan_pagos: formData.planPagos,
            observaciones: formData.observaciones,
            estado: formData.estado || "Pendiente",
            fecha_creacion: new Date().toISOString().split("T")[0]
          }),
        });
        const contratoData = await resContrato.json();
        const newContrato: Contrato = { 
          ...formData, 
          id: contratoData.id, 
          fechaCreacion: new Date().toISOString().split("T")[0] 
        } as Contrato;
        setContracts([...contratos, newContrato]);

        // 2. Crear Evento/Edición en DB si hay fecha
        if (formData.fechaInicio) {
          const resEvento = await fetch("http://localhost:3001/api/eventos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              nombre: formData.nombreEvento || "Nuevo Evento",
              cliente_id: null, // Podría expandirse para buscar/crear cliente
              tipo_evento: formData.tipoEvento === "Otros" ? formData.tipoEventoOtro : formData.tipoEvento,
              lugar: formData.direccion || "Por definir",
              fecha_inicio: formData.fechaInicio,
              fecha_entrega: formData.fechaFin || formData.fechaInicio,
              estado: "Sin Iniciar",
              prioridad: "Media"
            }),
          });
          const eventoData = await resEvento.json();

          // Actualizar UI local para Ediciones y Horarios
          setEdiciones((prev) => [...prev, {
            id: eventoData.id,
            evento: formData.nombreEvento || "Nuevo Evento",
            cliente: formData.apellidosNombres || "Cliente",
            editor: "Sin asignar",
            fechaInicio: formData.fechaInicio!,
            fechaEntrega: formData.fechaFin || formData.fechaInicio!,
            progreso: 0,
            estado: "Sin Iniciar",
            prioridad: "Media",
            duracionEstimada: "Por definir",
            lugar: formData.direccion || "Por definir",
            nombreArchivo: ""
          }]);

          setHorarioEventos((prev) => {
            const scheduleDays = getScheduleDays();

            const newEvents = { ...prev };
            const eventTitle = formData.nombreEvento || "Nuevo Evento";
            const eventClient = formData.apellidosNombres || "Cliente";
            const eventType = formData.tipoEvento === "Otros"
              ? (formData.tipoEventoOtro || "Otros")
              : (formData.tipoEvento || "Evento");
            const eventLocation = formData.direccion || "Por definir";
            const eventDescription = formData.observaciones || "";

            scheduleDays.forEach((day, index) => {
              const dateStr = day.dia;
              const startTime = day.horaInicio || "08:00 AM";
              const endTime = day.horaFin || "05:00 PM";
              const newEvent = {
                id: eventoData.id * 100 + index,
                titulo: eventTitle,
                cliente: eventClient,
                tipo: eventType,
                startTime,
                endTime,
                duracion: computeDuration(startTime, endTime),
                ubicacion: eventLocation,
                descripcion: eventDescription,
                personal: [],
                color: "bg-blue-500",
              };

              const existing = newEvents[dateStr] || [];
              if (!existing.some((e) => e.id === newEvent.id || (e.titulo === newEvent.titulo && e.startTime === newEvent.startTime && e.endTime === newEvent.endTime))) {
                newEvents[dateStr] = [...existing, newEvent];
              } else {
                newEvents[dateStr] = existing;
              }
            });

            return newEvents;
          });
        }
        window.alert("Contrato y evento registrados correctamente en la base de datos.");
      } catch (err) {
        console.error("Error al registrar:", err);
        window.alert("Error al guardar en la base de datos.");
      }
    }
    handleCloseModal();
  };

  const handleEdit = (contrato: Contrato) => {
    setSelectedContrato(contrato);
    setFormData(contrato);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleView = (contrato: Contrato) => {
    setSelectedContrato(contrato);
    setShowViewModal(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("¿Estás seguro de eliminar este contrato?")) {
      // Actualizar UI
      setContracts(contratos.filter((c) => c.id !== id));
      // Persistir
      fetch(`http://localhost:3001/api/contratos/${id}`, { method: "DELETE" })
        .catch(err => console.error("Error al eliminar contrato:", err));
    }
  };

  const handleDownloadPDF = (contrato: Contrato) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.text("CONTRATO DE SERVICIO DE FILMACIÓN", pageWidth / 2, 20, {
      align: "center",
    });

    doc.setFontSize(12);
    let y = 40;

    doc.text("DATOS DEL CLIENTE", 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(`Apellidos y Nombres: ${contrato.apellidosNombres}`, 20, y);
    y += 7;
    doc.text(`DNI: ${contrato.dni}`, 20, y);
    y += 7;
    doc.text(`Teléfono: ${contrato.telefono}`, 20, y);
    y += 12;

    doc.setFontSize(12);
    doc.text("DATOS DEL EVENTO", 20, y);
    y += 10;
    doc.setFontSize(10);
    doc.text(
      `Tipo de Evento: ${
        contrato.tipoEvento === "Otros"
          ? contrato.tipoEventoOtro
          : contrato.tipoEvento
      }`,
      20,
      y
    );
    y += 7;
    doc.text(`Nombre del Evento: ${contrato.nombreEvento}`, 20, y);
    y += 7;
    doc.text(
      `Fecha: ${contrato.fechaInicio} al ${contrato.fechaFin} (${calcularDias(
        contrato.fechaInicio,
        contrato.fechaFin
      )} días)`,
      20,
      y
    );
    y += 12;

    doc.setFontSize(12);
    doc.text("RANGO DE FILMACIÓN", 20, y);
    y += 10;
    doc.setFontSize(10);
    contrato.rangoFilmacion.forEach((rango) => {
      doc.text(
        `${parseFecha(rango.dia).toLocaleDateString("es-ES")}: ${
          rango.horaInicio
        } - ${rango.horaFin}`,
        20,
        y
      );
      y += 7;
    });
    y += 5;

    doc.setFontSize(12);
    doc.text("PLAN DE PAGOS", 20, y);
    y += 10;
    doc.setFontSize(10);
    let total = 0;
    contrato.planPagos.forEach((cuota) => {
      doc.text(
        `Cuota ${cuota.numero}: S/ ${cuota.monto.toLocaleString()} - Fecha: ${
          cuota.fecha
        } - ${cuota.pagado ? "Pagado" : "Pendiente"}`,
        20,
        y
      );
      y += 7;
      total += cuota.monto;
    });
    y += 5;
    doc.setFontSize(12);
    doc.text(`TOTAL: S/ ${total.toLocaleString()}`, 20, y);
    y += 12;

    if (contrato.observaciones) {
      doc.setFontSize(12);
      doc.text("OBSERVACIONES", 20, y);
      y += 10;
      doc.setFontSize(10);
      const observaciones = doc.splitTextToSize(contrato.observaciones, 170);
      doc.text(observaciones, 20, y);
    }

    doc.save(
      `Contrato_${contrato.nombreEvento.replace(/\s+/g, "_")}_${contrato.id}.pdf`
    );
  };

  const handleNewContrato = () => {
    setFormData({
      apellidosNombres: "",
      dni: "",
      telefono: "",
      tipoEvento: "",
      tipoEventoOtro: "",
      nombreEvento: "",
      fechaInicio: "",
      fechaFin: "",
      rangoFilmacion: [],
      planPagos: [{ numero: 1, monto: 0, fecha: "", pagado: false }],
      observaciones: "",
      estado: "Pendiente",
    });
    setIsEditing(false);
    setSelectedContrato(null);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowViewModal(false);
    setIsEditing(false);
    setSelectedContrato(null);
  };

  const filteredContratos = contratos.filter((contrato) => {
    const matchesSearch =
      contrato.apellidosNombres
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      contrato.nombreEvento.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterEstado === "Todos" || contrato.estado === filterEstado;
    return matchesSearch && matchesFilter;
  });

  const getEstadoBadge = (estado: string) => {
    const styles = {
      Activo: "bg-green-100 text-green-800",
      Pendiente: "bg-yellow-100 text-yellow-800",
      Completado: "bg-blue-100 text-blue-800",
      Cancelado: "bg-red-100 text-red-800",
    };
    return styles[estado as keyof typeof styles] || styles.Pendiente;
  };

  const calcularMontoTotal = (contrato: Contrato) => {
    return contrato.planPagos.reduce((sum, cuota) => sum + cuota.monto, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contratos</h1>
          <p className="mt-1 text-gray-600">
            Gestiona todos los contratos de eventos
          </p>
        </div>
        <button
          onClick={handleNewContrato}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Contrato
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por cliente o evento..."
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
          <option value="Activo">Activo</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Completado">Completado</option>
          <option value="Cancelado">Cancelado</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Contratos</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {contratos.length}
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="text-sm text-gray-600">Activos</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {contratos.filter((c) => c.estado === "Activo").length}
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="text-sm text-gray-600">Pendientes</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">
            {contratos.filter((c) => c.estado === "Pendiente").length}
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="text-sm text-gray-600">Valor Total</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            S/{" "}
            {contratos
              .reduce((sum, c) => sum + calcularMontoTotal(c), 0)
              .toLocaleString()}
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente / Evento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Evento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredContratos.map((contrato) => (
                <tr key={contrato.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contrato.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-blue-500 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {contrato.apellidosNombres}
                        </div>
                        <div className="text-sm text-gray-500">
                          {contrato.nombreEvento}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {contrato.tipoEvento === "Otros"
                      ? contrato.tipoEventoOtro
                      : contrato.tipoEvento}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {parseFecha(contrato.fechaInicio).toLocaleDateString(
                      "es-ES",
                      {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      }
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                    S/ {calcularMontoTotal(contrato).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadge(
                        contrato.estado
                      )}`}
                    >
                      {contrato.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleView(contrato)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Ver contrato"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(contrato)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Editar contrato"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(contrato)}
                        className="text-green-600 hover:text-green-900"
                        title="Descargar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(contrato.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar contrato"
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
      </div>

      {/* Modal Formulario Nuevo/Editar Contrato */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {isEditing ? "Editar Contrato" : "Nuevo Contrato"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Campos del Cliente */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  Campos del Cliente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellidos y Nombres
                    </label>
                    <input
                      type="text"
                      value={formData.apellidosNombres}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          apellidosNombres: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Apellidos y Nombres completos"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      DNI
                    </label>
                    <input
                      type="text"
                      value={formData.dni}
                      onChange={(e) =>
                        setFormData({ ...formData, dni: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Número de DNI"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.telefono}
                      onChange={(e) =>
                        setFormData({ ...formData, telefono: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Número de teléfono"
                    />
                  </div>
                </div>
              </div>

              {/* Datos del Evento */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                  Datos del Evento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Evento
                    </label>
                    <select
                      value={formData.tipoEvento}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tipoEvento: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Seleccione un tipo</option>
                      {tiposEventoOpciones.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                  </div>
                  {formData.tipoEvento === "Otros" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Especificar Tipo de Evento
                      </label>
                      <input
                        type="text"
                        value={formData.tipoEventoOtro}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            tipoEventoOtro: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Escriba el tipo de evento"
                      />
                    </div>
                  )}
                  <div
                    className={formData.tipoEvento === "Otros" ? "" : "md:col-span-1"}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Evento
                    </label>
                    <input
                      type="text"
                      value={formData.nombreEvento}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          nombreEvento: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Nombre del evento"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.direccion || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        direccion: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dirección del evento"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha Inicio
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.fechaInicio}
                        onChange={(e) =>
                          handleFechaChange("inicio", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha Fin
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.fechaFin}
                        onChange={(e) =>
                          handleFechaChange("fin", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Días en Total
                    </label>
                    <input
                      type="text"
                      value={calcularDias(
                        formData.fechaInicio || "",
                        formData.fechaFin || ""
                      )}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Rango de Filmación */}
              {formData.rangoFilmacion &&
                formData.rangoFilmacion.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">
                      Rango de Filmación
                    </h3>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
                      {formData.rangoFilmacion.map((rango, index) => (
                        <div
                          key={index}
                          className="bg-white p-3 rounded border border-gray-200"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Día
                              </label>
                              <input
                                type="text"
                                value={parseFecha(rango.dia).toLocaleDateString(
                                  "es-ES",
                                  {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                  }
                                )}
                                readOnly
                                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Hora de Inicio
                              </label>
                              <input
                                type="text"
                                value={rango.horaInicio}
                                onChange={(e) =>
                                  handleRangoFilmacionChange(
                                    index,
                                    "horaInicio",
                                    e.target.value
                                  )
                                }
                                placeholder="Ej: 02:00 PM"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-600 mb-1">
                                Hora Final
                              </label>
                              <input
                                type="text"
                                value={rango.horaFin}
                                onChange={(e) =>
                                  handleRangoFilmacionChange(
                                    index,
                                    "horaFin",
                                    e.target.value
                                  )
                                }
                                placeholder="Ej: 11:00 PM"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Plan de Pagos */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex-1">
                    Plan de Pagos
                  </h3>
                  <button
                    type="button"
                    onClick={agregarCuota}
                    className="ml-4 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    + Agregar Cuota
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.planPagos?.map((cuota, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg"
                    >
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Cuota #{cuota.numero}
                          </label>
                          <input
                            type="text"
                            value={`Cuota ${cuota.numero}`}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded bg-white text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Monto (S/)
                          </label>
                          <input
                            type="number"
                            value={cuota.monto}
                            onChange={(e) =>
                              handlePlanPagosChange(
                                index,
                                "monto",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            Fecha de Pago
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              value={cuota.fecha}
                              onChange={(e) =>
                                handlePlanPagosChange(
                                  index,
                                  "fecha",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                            <CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>
                      {formData.planPagos && formData.planPagos.length > 1 && (
                        <button
                          type="button"
                          onClick={() => eliminarCuota(index)}
                          className="text-red-600 hover:text-red-900 mt-6"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="text-sm font-medium text-gray-700">
                      Monto Total:{" "}
                      <span className="text-lg font-bold text-blue-600">
                        S/{" "}
                        {formData.planPagos
                          ?.reduce((sum, c) => sum + c.monto, 0)
                          .toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  value={formData.observaciones}
                  onChange={(e) =>
                    setFormData({ ...formData, observaciones: e.target.value })
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Notas adicionales sobre el contrato..."
                />
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isEditing ? "Guardar Cambios" : "Crear Contrato"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver Contrato */}
      {showViewModal && selectedContrato && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full my-8 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Detalles del Contrato
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Cliente */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                  Datos del Cliente
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">
                      Apellidos y Nombres:
                    </span>
                    <p className="font-medium">
                      {selectedContrato.apellidosNombres}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">DNI:</span>
                    <p className="font-medium">{selectedContrato.dni}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Teléfono:</span>
                    <p className="font-medium">{selectedContrato.telefono}</p>
                  </div>
                </div>
              </div>

              {/* Evento */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                  Datos del Evento
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">
                      Tipo de Evento:
                    </span>
                    <p className="font-medium">
                      {selectedContrato.tipoEvento === "Otros"
                        ? selectedContrato.tipoEventoOtro
                        : selectedContrato.tipoEvento}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">
                      Nombre del Evento:
                    </span>
                    <p className="font-medium">
                      {selectedContrato.nombreEvento}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-sm text-gray-600">Fechas:</span>
                    <p className="font-medium">
                      {parseFecha(selectedContrato.fechaInicio).toLocaleDateString(
                        "es-ES",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}{" "}
                      al{" "}
                      {parseFecha(selectedContrato.fechaFin).toLocaleDateString(
                        "es-ES",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        }
                      )}{" "}
                      (
                      {calcularDias(
                        selectedContrato.fechaInicio,
                        selectedContrato.fechaFin
                      )}{" "}
                      días)
                    </p>
                  </div>
                </div>
              </div>

              {/* Rango Filmación */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                  Rango de Filmación
                </h3>
                <div className="space-y-2">
                  {selectedContrato.rangoFilmacion.map((rango, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded"
                    >
                      <span className="font-medium">
                        {parseFecha(rango.dia).toLocaleDateString("es-ES", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
                      </span>
                      <span className="text-gray-600">
                        {rango.horaInicio} - {rango.horaFin}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan de Pagos */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                  Plan de Pagos
                </h3>
                <div className="space-y-2">
                  {selectedContrato.planPagos.map((cuota, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded"
                    >
                      <div>
                        <span className="font-medium">
                          Cuota {cuota.numero}
                        </span>
                        <span className="text-sm text-gray-600 ml-2">
                          (
                          {parseFecha(cuota.fecha).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          )
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-blue-600">
                          S/ {cuota.monto.toLocaleString()}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            cuota.pagado
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {cuota.pagado ? "Pagado" : "Pendiente"}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-700">
                        Monto Total:
                      </span>
                      <span className="text-xl font-bold text-blue-600">
                        S/{" "}
                        {calcularMontoTotal(selectedContrato).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              {selectedContrato.observaciones && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                    Observaciones
                  </h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded">
                    {selectedContrato.observaciones}
                  </p>
                </div>
              )}

              {/* Estado */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 border-b pb-2">
                  Estado del Contrato
                </h3>
                <span
                  className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full ${getEstadoBadge(
                    selectedContrato.estado
                  )}`}
                >
                  {selectedContrato.estado}
                </span>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => handleDownloadPDF(selectedContrato)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar PDF
              </button>
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
