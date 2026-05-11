import { useState } from "react";
import { jsPDF } from "jspdf";
import {
  Plus,
  Search,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Download,
  Trash2,
  ChevronRight,
} from "lucide-react";
import { useAppData } from "../context/AppDataContext";

interface Cuota {
  numero: number;
  monto: number;
  fecha: string;
  pagado: boolean;
}

interface ContratoPago {
  id: number;
  cliente: string;
  evento: string;
  fechaInicio: string;
  cuotas: Cuota[];
}

export function Pagos() {
  const { pagos, setPagos, contracts, setContracts } = useAppData();
  const contratos: ContratoPago[] = contracts.map((contrato) => ({
    id: contrato.id,
    cliente: contrato.apellidosNombres,
    evento: contrato.nombreEvento,
    fechaInicio: contrato.fechaInicio,
    cuotas: contrato.planPagos,
  }));
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("Todos");
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchContrato, setSearchContrato] = useState("");
  const [filterContratoFecha, setFilterContratoFecha] = useState("");
  const [selectedContrato, setSelectedContrato] = useState<ContratoPago | null>(null);
  const [selectedCuota, setSelectedCuota] = useState<Cuota | null>(null);
  const [editSelectedCuota, setEditSelectedCuota] = useState<Cuota | null>(null);
  const [selectedPagoToView, setSelectedPagoToView] = useState<Pago | null>(null);
  const [selectedPagoToEdit, setSelectedPagoToEdit] = useState<Pago | null>(null);
  const [pagoForm, setPagoForm] = useState({
    metodo: "Efectivo" as "Efectivo" | "Transferencia" | "Tarjeta",
    monto: 0,
    fecha: "",
  });
  const [editForm, setEditForm] = useState({
    metodo: "Efectivo" as "Efectivo" | "Transferencia" | "Tarjeta",
    monto: 0,
    fecha: "",
    estado: "Pagado" as "Pagado" | "Pendiente" | "Vencido",
  });

  const filteredContratos = contratos.filter((contrato) => {
    const query = searchContrato.toLowerCase();
    const matchesSearch =
      contrato.id.toString().includes(query) ||
      contrato.cliente.toLowerCase().includes(query) ||
      contrato.evento.toLowerCase().includes(query);
    const matchesDate =
      filterContratoFecha === "" ||
      contrato.fechaInicio === filterContratoFecha;
    return matchesSearch && matchesDate;
  });

  const filteredPagos = pagos.filter((pago) => {
    const matchesSearch =
      pago.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.evento.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterEstado === "Todos" || pago.estado === filterEstado;
    return matchesSearch && matchesFilter;
  });

  const groupedPagos = Object.values(
    filteredPagos.reduce((acc, pago) => {
      const key = pago.contratoId ? `contrato-${pago.contratoId}` : `${pago.cliente}-${pago.evento}`;
      if (!acc[key]) {
        acc[key] = {
          key,
          contratoId: pago.contratoId,
          cliente: pago.cliente,
          evento: pago.evento,
          pagos: [] as Pago[],
        };
      }
      acc[key].pagos.push(pago);
      return acc;
    }, {} as Record<string, { key: string; contratoId?: number; cliente: string; evento: string; pagos: Pago[] }>)
  );

  const getGroupEstado = (pagos: Pago[]) => {
    if (pagos.some((p) => p.estado === "Vencido")) return "Vencido";
    if (pagos.some((p) => p.estado === "Pendiente")) return "Pendiente";
    return "Pagado";
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "Pagado":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "Pendiente":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "Vencido":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getEstadoBadge = (estado: string) => {
    const styles = {
      Pagado: "bg-green-100 text-green-800",
      Pendiente: "bg-yellow-100 text-yellow-800",
      Vencido: "bg-red-100 text-red-800",
    };
    return styles[estado as keyof typeof styles] || styles.Pendiente;
  };

  const groupedRows = groupedPagos.map((group) => {
    const estado = getGroupEstado(group.pagos);
    const total = group.pagos.reduce((sum, item) => sum + item.monto, 0);
    const lastPago = [...group.pagos].sort((a, b) => b.id - a.id)[0];

    return (
      <tr key={group.key} className="hover:bg-gray-50">
        <td className="px-6 py-4">
          <div className="flex items-center">
            {getEstadoIcon(estado)}
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">{group.cliente}</div>
              <div className="text-sm text-gray-500">{group.evento}</div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {group.pagos.length} pago{group.pagos.length > 1 ? "s" : ""}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          S/{total.toLocaleString()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {lastPago.metodo}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {lastPago.fecha ? (
            new Date(lastPago.fecha).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          ) : lastPago.fechaVencimiento ? (
            <span className="text-red-600">
              Vence: {" "}
              {new Date(lastPago.fechaVencimiento).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "short",
              })}
            </span>
          ) : (
            "-"
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadge(estado)}`}>
            {estado}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewPago(group.pagos[0])}
              className="text-blue-600 hover:text-blue-900"
              title="Ver pagos"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEditPago(lastPago)}
              className="text-gray-600 hover:text-gray-900"
              title="Editar último pago"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDownloadPago(lastPago)}
              className="text-green-600 hover:text-green-900"
              title="Descargar último pago"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeletePago(lastPago.id)}
              className="text-red-600 hover:text-red-900"
              title="Eliminar último pago"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    );
  });

  const getPagosForPago = (pago: Pago) => {
    if (pago.contratoId) {
      return pagos.filter((p) => p.contratoId === pago.contratoId);
    }
    return pagos.filter((p) => p.cliente === pago.cliente && p.evento === pago.evento);
  };

  const totalPagado = pagos
    .filter((p) => p.estado === "Pagado")
    .reduce((sum, p) => sum + p.monto, 0);
  const totalPendiente = pagos
    .filter((p) => p.estado === "Pendiente")
    .reduce((sum, p) => sum + p.monto, 0);
  const totalVencido = pagos
    .filter((p) => p.estado === "Vencido")
    .reduce((sum, p) => sum + p.monto, 0);

  const handleViewPago = (pago: Pago) => {
    setSelectedPagoToView(pago);
    setShowViewModal(true);
  };

  const handleEditPago = (pago: Pago) => {
    const contrato = getContratoForPago(pago);
    const defaultCuota = contrato?.cuotas.find((cuota) => !cuota.pagado) ?? contrato?.cuotas[0] ?? null;
    setSelectedPagoToEdit(pago);
    setEditSelectedCuota(defaultCuota);
    setEditForm({
      metodo: pago.metodo,
      monto: defaultCuota?.monto ?? pago.monto,
      fecha: defaultCuota?.fecha ?? (pago.fecha || new Date().toISOString().slice(0, 10)),
      estado: pago.estado,
    });
    setShowEditModal(true);
  };

  const getContratoForPago = (pago: Pago) => {
    return contratos.find((contrato) => contrato.id === pago.contratoId);
  };

  const handleDownloadPago = (pago: Pago) => {
    const doc = new jsPDF({ unit: "px", format: "a4" });
    doc.setFontSize(18);
    doc.text("Recibo de pago", 40, 50);
    doc.setFontSize(12);
    doc.text(`ID de pago: ${pago.id}`, 40, 90);
    doc.text(`Cliente: ${pago.cliente}`, 40, 110);
    doc.text(`Evento: ${pago.evento}`, 40, 130);
    if (pago.contratoId) {
      doc.text(`Contrato: #${pago.contratoId}`, 40, 150);
    }
    doc.text(`Tipo: ${pago.tipo}`, 40, 170);
    doc.text(`Método: ${pago.metodo}`, 40, 190);
    doc.text(`Monto: S/${pago.monto.toLocaleString()}`, 40, 210);
    doc.text(`Fecha: ${pago.fecha || "Pendiente"}`, 40, 230);
    doc.text(`Estado: ${pago.estado}`, 40, 250);
    doc.save(`recibo-pago-${pago.id}.pdf`);
  };

  const handleDeletePago = async (id: number) => {
    if (window.confirm("¿Eliminar este pago?")) {
      // Actualizar UI
      setPagos(pagos.filter((pago) => pago.id !== id));
      if (selectedPagoToView?.id === id) {
        setShowViewModal(false);
        setSelectedPagoToView(null);
      }
      if (selectedPagoToEdit?.id === id) {
        setShowEditModal(false);
        setSelectedPagoToEdit(null);
      }
      // Persistir
      try {
        await fetch(`http://localhost:3001/api/pagos/${id}`, { method: "DELETE" });
      } catch (err) { console.error("Error al eliminar pago:", err); }
    }
  };

  const handleSaveEditPago = async () => {
    if (!selectedPagoToEdit) return;
    const updatedPago: Pago = {
      ...selectedPagoToEdit,
      metodo: editForm.metodo,
      monto: editSelectedCuota?.monto ?? editForm.monto,
      fecha: editSelectedCuota?.fecha ?? editForm.fecha,
      estado: editForm.estado,
    };
    
    // UI Update
    setPagos(pagos.map((pago) => (pago.id === updatedPago.id ? updatedPago : pago)));
    
    // Persistence
    try {
      await fetch(`http://localhost:3001/api/pagos/${updatedPago.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPago),
      });
    } catch (err) { console.error("Error al actualizar pago:", err); }

    setSelectedPagoToEdit(updatedPago);
    setShowEditModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pagos</h1>
          <p className="mt-1 text-gray-600">
            Gestiona y rastrea todos los pagos de eventos
          </p>
        </div>
        <button
          onClick={() => setShowRegisterModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Registrar Pago
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Total Recibido</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                S/{totalPagado.toLocaleString()}
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Pendiente</div>
              <div className="text-2xl font-bold text-yellow-600 mt-1">
                S/{totalPendiente.toLocaleString()}
              </div>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Vencido</div>
              <div className="text-2xl font-bold text-red-600 mt-1">
                S/{totalVencido.toLocaleString()}
              </div>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Total Esperado</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                S/
                {(totalPagado + totalPendiente + totalVencido).toLocaleString()}
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
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
          <option value="Pagado">Pagado</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Vencido">Vencido</option>
        </select>
      </div>

      {/* Payments Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente / Evento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última fecha
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
              {groupedRows}
            </tbody>
          </table>
        </div>
      </div>

      {showRegisterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-xl max-w-6xl w-full overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Registrar Pago</h2>
                <p className="text-sm text-gray-500">Busca un contrato, selecciona la cuota y registra el pago.</p>
              </div>
              <button
                onClick={() => {
                  setShowRegisterModal(false);
                  setSelectedContrato(null);
                  setSelectedCuota(null);
                }}
                className="text-gray-500 hover:text-gray-900"
              >
                Cerrar
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Buscar contrato</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={searchContrato}
                          onChange={(e) => setSearchContrato(e.target.value)}
                          placeholder="ID, cliente o nombre de evento"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por fecha</label>
                        <input
                          type="date"
                          value={filterContratoFecha}
                          onChange={(e) => setFilterContratoFecha(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Contratos encontrados</h3>
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                        {filteredContratos.length === 0 ? (
                          <div className="text-sm text-gray-500">No se encontraron contratos.</div>
                        ) : (
                          filteredContratos.map((contrato) => (
                            <button
                              key={contrato.id}
                              onClick={() => setSelectedContrato(contrato)}
                              className={`w-full text-left rounded-2xl border p-4 transition ${
                                selectedContrato?.id === contrato.id
                                  ? "border-blue-500 bg-blue-50"
                                  : "border-gray-200 bg-white hover:border-blue-300"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-semibold text-gray-900">Contrato #{contrato.id}</span>
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                              </div>
                              <div className="text-sm text-gray-600 mt-1">{contrato.cliente}</div>
                              <div className="text-sm text-gray-500">{contrato.evento}</div>
                              <div className="text-xs text-gray-500 mt-1">Fecha evento: {new Date(contrato.fechaInicio).toLocaleDateString("es-ES")}</div>
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">Contrato seleccionado</h3>
                      {selectedContrato ? (
                        <div className="space-y-3">
                          <div className="text-sm text-gray-500">ID: {selectedContrato.id}</div>
                          <div className="text-base font-semibold text-gray-900">{selectedContrato.evento}</div>
                          <div className="text-sm text-gray-600">Cliente: {selectedContrato.cliente}</div>
                          <div className="text-sm text-gray-600">Fecha evento: {new Date(selectedContrato.fechaInicio).toLocaleDateString("es-ES")}</div>

                          <div className="bg-gray-50 rounded-2xl p-4">
                            <div className="text-sm font-semibold text-gray-700 mb-3">Cuotas</div>
                            <div className="space-y-2">
                              {selectedContrato.cuotas.map((cuota) => (
                                <div
                                  key={cuota.numero}
                                  className="flex items-center justify-between rounded-2xl border border-gray-200 p-3"
                                >
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900">Cuota {cuota.numero}</div>
                                    <div className="text-sm text-gray-500">Monto: S/{cuota.monto.toLocaleString()}</div>
                                    <div className="text-sm text-gray-500">Fecha: {new Date(cuota.fecha).toLocaleDateString("es-ES")}</div>
                                    <div className={`text-xs inline-flex px-2 py-1 rounded-full ${cuota.pagado ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                                      {cuota.pagado ? "Pagado" : "Pendiente"}
                                    </div>
                                  </div>
                                  <button
                                    disabled={cuota.pagado}
                                    onClick={() => {
                                      setSelectedCuota(cuota);
                                      setPagoForm({
                                        metodo: "Efectivo",
                                        monto: cuota.monto,
                                        fecha: new Date().toISOString().slice(0, 10),
                                      });
                                    }}
                                    className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${
                                      cuota.pagado
                                        ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                                        : "bg-blue-600 text-white hover:bg-blue-700"
                                    }`}
                                  >
                                    {cuota.pagado ? "Pago realizado" : "Pagar"}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Selecciona un contrato para ver las cuotas y registrar el pago.</div>
                      )}
                    </div>
                  </div>

                  {selectedContrato && (
                    <div className="bg-white border border-gray-200 rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">Registrar pago para contrato #{selectedContrato.id}</h3>
                          <p className="text-sm text-gray-500">Completa los campos y guarda el pago.</p>
                        </div>
                        <span className="text-sm text-gray-500">{selectedContrato.evento}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago</label>
                          <select
                            value={pagoForm.metodo}
                            onChange={(e) =>
                              setPagoForm({
                                ...pagoForm,
                                metodo: e.target.value as "Efectivo" | "Transferencia" | "Tarjeta",
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="Efectivo">Efectivo</option>
                            <option value="Transferencia">Transferencia</option>
                            <option value="Tarjeta">Tarjeta</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Monto a pagar</label>
                          <input
                            type="number"
                            value={pagoForm.monto}
                            onChange={(e) => setPagoForm({ ...pagoForm, monto: Number(e.target.value) })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de pago</label>
                          <input
                            type="date"
                            value={pagoForm.fecha}
                            onChange={(e) => setPagoForm({ ...pagoForm, fecha: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <button
                        disabled={!selectedCuota || !pagoForm.fecha || pagoForm.monto <= 0}
                        onClick={async () => {
                          if (!selectedContrato || !selectedCuota || !pagoForm.fecha) return;
                          
                          try {
                            // 1. Registrar Pago en DB
                            const resPago = await fetch("http://localhost:3001/api/pagos", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                contrato_id: selectedContrato.id,
                                cliente: selectedContrato.cliente,
                                evento: selectedContrato.evento,
                                monto: pagoForm.monto,
                                tipo: "Pago Parcial",
                                metodo: pagoForm.metodo,
                                fecha: pagoForm.fecha,
                                estado: "Pagado",
                              }),
                            });
                            const pagoData = await resPago.json();

                            // 2. Actualizar Contrato (Cuota pagada) en DB
                            const realContract = contracts.find(c => c.id === selectedContrato.id);
                            if (realContract) {
                              const updatedPlan = realContract.planPagos.map((cuota) =>
                                cuota.numero === selectedCuota.numero ? { ...cuota, pagado: true } : cuota
                              );

                              await fetch(`http://localhost:3001/api/contratos/${selectedContrato.id}`, {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  ...realContract,
                                  apellidos_nombres: realContract.apellidosNombres,
                                  nombre_evento: realContract.nombreEvento,
                                  fecha_inicio: realContract.fechaInicio,
                                  fecha_fin: realContract.fechaFin,
                                  rango_filmacion: realContract.rangoFilmacion,
                                  plan_pagos: updatedPlan
                                }),
                              });

                              // 3. Actualizar UI Local
                              const newPago: Pago = {
                                id: pagoData.id,
                                contratoId: selectedContrato.id,
                                cliente: selectedContrato.cliente,
                                evento: selectedContrato.evento,
                                monto: pagoForm.monto,
                                tipo: "Pago Parcial",
                                metodo: pagoForm.metodo,
                                fecha: pagoForm.fecha,
                                estado: "Pagado",
                              };
                              setPagos([...pagos, newPago]);
                              
                              const updatedContracts = contracts.map((contrato) =>
                                contrato.id === selectedContrato.id ? { ...contrato, planPagos: updatedPlan } : contrato
                              );
                              setContracts(updatedContracts);
                              
                              setSelectedContrato(
                                updatedContracts
                                  .map((contrato) => ({
                                    id: contrato.id,
                                    cliente: contrato.apellidosNombres,
                                    evento: contrato.nombreEvento,
                                    fechaInicio: contrato.fechaInicio,
                                    cuotas: contrato.planPagos,
                                  }))
                                  .find((contrato) => contrato.id === selectedContrato.id) || null
                              );
                            }
                            
                            window.alert("Pago registrado correctamente.");
                            setSelectedCuota(null);
                          } catch (err) {
                            console.error("Error al registrar pago:", err);
                            window.alert("Error al registrar pago en la base de datos.");
                          }
                        }}
                        className="inline-flex items-center justify-center px-5 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Registrar pago
                      </button>
                      {!selectedCuota && (
                        <p className="mt-3 text-sm text-gray-500">Primero selecciona una cuota pendiente para pagar.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showViewModal && selectedPagoToView && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-xl max-w-3xl w-full overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Detalle de pago</h2>
                <p className="text-sm text-gray-500">Revisa la información del pago seleccionado y sus cuotas vinculadas.</p>
              </div>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedPagoToView(null);
                }}
                className="text-gray-500 hover:text-gray-900 text-2xl font-bold leading-none"
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">ID de pago</div>
                    <div className="text-lg font-semibold text-gray-900">#{selectedPagoToView.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Cliente</div>
                    <div className="text-lg font-semibold text-gray-900">{selectedPagoToView.cliente}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Evento</div>
                    <div className="text-lg font-semibold text-gray-900">{selectedPagoToView.evento}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-gray-500">Monto</div>
                    <div className="text-lg font-semibold text-gray-900">S/{selectedPagoToView.monto.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Tipo</div>
                    <div className="text-lg font-semibold text-gray-900">{selectedPagoToView.tipo}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Método</div>
                    <div className="text-lg font-semibold text-gray-900">{selectedPagoToView.metodo}</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Fecha</div>
                  <div className="text-lg font-semibold text-gray-900">{selectedPagoToView.fecha || "Pendiente"}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Estado</div>
                  <div className="text-lg font-semibold text-gray-900">{selectedPagoToView.estado}</div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-gray-50 rounded-3xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-700">Cuotas vinculadas</div>
                      <div className="text-xs text-gray-500">Estado de cada cuota del contrato asociado</div>
                    </div>
                    <span className="text-sm text-gray-500">Contrato #{selectedPagoToView.contratoId ?? "-"}</span>
                  </div>
                  {getContratoForPago(selectedPagoToView) ? (
                    <div className="space-y-3">
                      {getContratoForPago(selectedPagoToView)!.cuotas.map((cuota) => (
                        <div key={cuota.numero} className="flex items-center justify-between rounded-2xl bg-white p-3 border border-gray-200">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">Cuota {cuota.numero}</div>
                            <div className="text-sm text-gray-500">Monto: S/{cuota.monto.toLocaleString()}</div>
                            <div className="text-sm text-gray-500">Fecha: {new Date(cuota.fecha).toLocaleDateString("es-ES")}</div>
                          </div>
                          <div className={`text-xs font-semibold px-3 py-1 rounded-full ${cuota.pagado ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                            {cuota.pagado ? "Pagado" : "Pendiente"}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">No hay contrato vinculado o el contrato no está disponible.</div>
                  )}
                </div>

                <div className="bg-white rounded-3xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-700">Pagos realizados</div>
                      <div className="text-xs text-gray-500">Lista de pagos para este cliente/contrato</div>
                    </div>
                    <span className="text-sm text-gray-500">{getPagosForPago(selectedPagoToView).length} pago{getPagosForPago(selectedPagoToView).length > 1 ? "s" : ""}</span>
                  </div>
                  <div className="space-y-2">
                    {getPagosForPago(selectedPagoToView).map((pago) => (
                      <div key={pago.id} className="rounded-2xl bg-gray-50 p-3 border border-gray-200">
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <div className="text-gray-700 font-semibold">Pago #{pago.id}</div>
                            <div className="text-gray-500">Monto: S/{pago.monto.toLocaleString()}</div>
                          </div>
                          <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getEstadoBadge(pago.estado)}`}>
                            {pago.estado}
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">
                          {pago.metodo} · {pago.fecha || "Sin fecha"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedPagoToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-xl max-w-3xl w-full overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Editar pago</h2>
                <p className="text-sm text-gray-500">Modifica los detalles del pago seleccionado.</p>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedPagoToEdit(null);
                }}
                className="text-gray-500 hover:text-gray-900"
              >
                Cerrar
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getContratoForPago(selectedPagoToEdit) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cuota</label>
                    <select
                      value={editSelectedCuota?.numero ?? ""}
                      onChange={(e) => {
                        const cuotaNumero = Number(e.target.value);
                        const contrato = getContratoForPago(selectedPagoToEdit);
                        const cuota = contrato?.cuotas.find((item) => item.numero === cuotaNumero) ?? null;
                        setEditSelectedCuota(cuota);
                        if (cuota) {
                          setEditForm({
                            ...editForm,
                            monto: cuota.monto,
                            fecha: cuota.fecha,
                          });
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Selecciona una cuota</option>
                      {getContratoForPago(selectedPagoToEdit)!.cuotas.map((cuota) => (
                        <option key={cuota.numero} value={cuota.numero}>
                          Cuota {cuota.numero} - S/{cuota.monto.toLocaleString()} - {cuota.pagado ? "Pagado" : "Pendiente"}
                        </option>
                      ))}
                    </select>
                    {editSelectedCuota && (
                      <p className="mt-2 text-sm text-gray-500">
                        La cuota seleccionada actualiza el monto y la fecha del pago.
                      </p>
                    )}
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Método de pago</label>
                  <select
                    value={editForm.metodo}
                    onChange={(e) => setEditForm({ ...editForm, metodo: e.target.value as "Efectivo" | "Transferencia" | "Tarjeta" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Tarjeta">Tarjeta</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                  <input
                    type="number"
                    value={editForm.monto}
                    onChange={(e) => setEditForm({ ...editForm, monto: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                  <input
                    type="date"
                    value={editForm.fecha}
                    onChange={(e) => setEditForm({ ...editForm, fecha: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={editForm.estado}
                    onChange={(e) => setEditForm({ ...editForm, estado: e.target.value as "Pagado" | "Pendiente" | "Vencido" })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Pagado">Pagado</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Vencido">Vencido</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedPagoToEdit(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEditPago}
                  className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                >
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
