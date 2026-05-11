import { useState } from "react";
import {
  Plus,
  Search,
  Download,
  Eye,
  CheckCircle,
  Clock,
  Package,
  Upload,
} from "lucide-react";

interface Material {
  id: number;
  evento: string;
  cliente: string;
  tipoMaterial: "Video Principal" | "Video Resumen" | "Fotos" | "Raw Files";
  formato: string;
  tamano: string;
  fechaCreacion: string;
  fechaEntrega?: string;
  estado: "Pendiente" | "Listo" | "Entregado" | "Subiendo";
  linkDescarga?: string;
  progreso?: number;
}

const mockMaterial: Material[] = [
  {
    id: 1,
    evento: "Boda Luis & Sofía",
    cliente: "Luis Martínez",
    tipoMaterial: "Video Principal",
    formato: "MP4 (1080p)",
    tamano: "Estimado: 4.5 GB",
    fechaCreacion: "2026-04-01",
    estado: "Pendiente",
  },
];

export function MaterialAudiovisual() {
  const [material] = useState<Material[]>(mockMaterial);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("Todos");
  const [filterTipo, setFilterTipo] = useState<string>("Todos");

  const filteredMaterial = material.filter((item) => {
    const matchesSearch =
      item.evento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado =
      filterEstado === "Todos" || item.estado === filterEstado;
    const matchesTipo =
      filterTipo === "Todos" || item.tipoMaterial === filterTipo;
    return matchesSearch && matchesEstado && matchesTipo;
  });

  const getEstadoBadge = (estado: string) => {
    const styles = {
      Pendiente: "bg-yellow-100 text-yellow-800",
      Listo: "bg-green-100 text-green-800",
      Entregado: "bg-blue-100 text-blue-800",
      Subiendo: "bg-purple-100 text-purple-800",
    };
    return styles[estado as keyof typeof styles] || styles.Pendiente;
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "Listo":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "Entregado":
        return <Package className="w-5 h-5 text-blue-500" />;
      case "Subiendo":
        return <Upload className="w-5 h-5 text-purple-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const pendientes = material.filter((m) => m.estado === "Pendiente").length;
  const listos = material.filter((m) => m.estado === "Listo").length;
  const entregados = material.filter((m) => m.estado === "Entregado").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Material Audiovisual
          </h1>
          <p className="mt-1 text-gray-600">
            Gestiona la entrega de videos, fotos y archivos
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus className="w-5 h-5 mr-2" />
          Subir Material
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="text-sm text-gray-600">Total Archivos</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {material.length}
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="text-sm text-gray-600">Pendientes</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">
            {pendientes}
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="text-sm text-gray-600">Listos</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {listos}
          </div>
        </div>
        <div className="bg-white p-5 rounded-lg shadow">
          <div className="text-sm text-gray-600">Entregados</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {entregados}
          </div>
        </div>
      </div>

      {/* Filters */}
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
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Todos">Todos los tipos</option>
          <option value="Video Principal">Video Principal</option>
          <option value="Video Resumen">Video Resumen</option>
          <option value="Fotos">Fotos</option>
          <option value="Raw Files">Raw Files</option>
        </select>
        <select
          value={filterEstado}
          onChange={(e) => setFilterEstado(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Todos">Todos los estados</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Listo">Listo</option>
          <option value="Subiendo">Subiendo</option>
          <option value="Entregado">Entregado</option>
        </select>
      </div>

      {/* Material Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredMaterial.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                {getEstadoIcon(item.estado)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.evento}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">{item.cliente}</p>
                </div>
              </div>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${getEstadoBadge(
                  item.estado
                )}`}
              >
                {item.estado}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tipo:</span>
                <span className="font-medium text-gray-900">
                  {item.tipoMaterial}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Formato:</span>
                <span className="text-gray-900">{item.formato}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Tamaño:</span>
                <span className="text-gray-900">{item.tamano}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Creado:</span>
                <span className="text-gray-900">
                  {new Date(item.fechaCreacion).toLocaleDateString("es-ES", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              {item.fechaEntrega && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Entregado:</span>
                  <span className="text-green-600">
                    {new Date(item.fechaEntrega).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>

            {item.estado === "Subiendo" && item.progreso !== undefined && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Subiendo...</span>
                  <span className="font-medium text-gray-900">
                    {item.progreso}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-purple-500 transition-all"
                    style={{ width: `${item.progreso}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
              {item.linkDescarga && (
                <button className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </button>
              )}
              <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                <Eye className="w-4 h-4 mr-2" />
                Ver
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
