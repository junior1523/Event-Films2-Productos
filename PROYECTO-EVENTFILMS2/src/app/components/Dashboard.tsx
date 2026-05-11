import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  DollarSign,
  FileText,
  Video,
  Users,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

type Evento = {
  id: number;
  evento?: string;
  cliente?: string;
  fechaInicio?: string;
  fechaEntrega?: string;
  estado?: string;
  prioridad?: string;
  tipo?: string;
};

type Contrato = {
  id: number;
  estado?: string;
};

type Pago = {
  id: number;
  monto?: number;
  fecha?: string;
  estado?: string;
};

const monthNames = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const typeColors = [
  "#3b82f6",
  "#ec4899",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#14b8a6",
  "#a855f7",
];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    maximumFractionDigits: 0,
  }).format(value);

export function Dashboard() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventosRes, contratosRes, pagosRes] = await Promise.all([
          fetch("http://localhost:3001/api/eventos"),
          fetch("http://localhost:3001/api/contratos"),
          fetch("http://localhost:3001/api/pagos"),
        ]);

        if (!eventosRes.ok || !contratosRes.ok || !pagosRes.ok) {
          throw new Error("Error al cargar datos del dashboard");
        }

        const [eventosData, contratosData, pagosData] = await Promise.all([
          eventosRes.json(),
          contratosRes.json(),
          pagosRes.json(),
        ]);

        setEventos(eventosData);
        setContratos(contratosData);
        setPagos(pagosData);
      } catch (err) {
        console.error(err);
        setError(
          "No se pudo cargar la información del dashboard. Verifica que el servidor esté activo."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const ingresosDelMes = useMemo(() => {
    const now = new Date();
    return pagos.reduce((total, pago) => {
      if (!pago.fecha) return total;
      const fecha = new Date(pago.fecha);
      if (
        fecha.getFullYear() === now.getFullYear() &&
        fecha.getMonth() === now.getMonth() &&
        pago.estado === "Pagado"
      ) {
        return total + (typeof pago.monto === "number" ? pago.monto : Number(pago.monto) || 0);
      }
      return total;
    }, 0);
  }, [pagos]);

  const contratosActivos = useMemo(
    () => contratos.filter((contrato) => contrato.estado !== "Pendiente").length,
    [contratos]
  );

  const eventosPendientes = useMemo(
    () =>
      eventos.filter(
        (evento) =>
          evento.estado === "Sin Iniciar" ||
          evento.estado === "Pendiente" ||
          evento.estado === "Confirmado"
      ).length,
    [eventos]
  );

  const edicionesEnProceso = useMemo(
    () => eventos.filter((evento) => evento.estado === "En Proceso").length,
    [eventos]
  );

  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 12 }, (_, index) => ({
      month: monthNames[index],
      ingresos: 0,
    }));

    pagos.forEach((pago) => {
      if (!pago.fecha) return;
      const fecha = new Date(pago.fecha);
      if (fecha.getFullYear() === now.getFullYear() && pago.estado === "Pagado") {
        const monthIndex = fecha.getMonth();
        months[monthIndex].ingresos +=
          typeof pago.monto === "number" ? pago.monto : Number(pago.monto) || 0;
      }
    });

    return months;
  }, [pagos]);

  const eventTypes = useMemo(() => {
    const counts = eventos.reduce<Record<string, number>>((acc, evento) => {
      const type = evento.tipo || "Otro";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts).map(([name, value], index) => ({
      name,
      value,
      color: typeColors[index % typeColors.length],
    }));
  }, [eventos]);

  const recentEvents = useMemo(
    () =>
      [...eventos]
        .sort((a, b) => {
          const aDate = a.fechaInicio ? new Date(a.fechaInicio).getTime() : 0;
          const bDate = b.fechaInicio ? new Date(b.fechaInicio).getTime() : 0;
          return bDate - aDate;
        })
        .slice(0, 5),
    [eventos]
  );

  const stats = [
    {
      name: "Ingresos del Mes",
      value: formatCurrency(ingresosDelMes),
      change: loading ? "Cargando..." : "Actualizado",
      icon: DollarSign,
      color: "bg-green-500",
    },
    {
      name: "Contratos Activos",
      value: String(contratosActivos),
      change: loading ? "Cargando..." : "Actualizado",
      icon: FileText,
      color: "bg-blue-500",
    },
    {
      name: "Eventos Pendientes",
      value: String(eventosPendientes),
      change: loading ? "Cargando..." : "Actualizado",
      icon: Calendar,
      color: "bg-purple-500",
    },
    {
      name: "Ediciones en Proceso",
      value: String(edicionesEnProceso),
      change: loading ? "Cargando..." : "Actualizado",
      icon: Video,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-600">
          Resumen general de tu empresa de filmaciones
        </p>
        {error ? (
          <div className="mt-4 rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : loading ? (
          <div className="mt-4 rounded-md bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700">
            Cargando información del dashboard...
          </div>
        ) : null}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {stat.value}
                      </div>
                      <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                        {stat.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Ingresos Mensuales
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="ingresos" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Event Types */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución de Eventos
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={eventTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {eventTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Eventos Recientes
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {event.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.client}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(event.date).toLocaleDateString("es-ES", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        event.status === "Filmado"
                          ? "bg-blue-100 text-blue-800"
                          : event.status === "Confirmado"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
