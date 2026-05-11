"use client";

import { useState } from "react";
import { Navigate } from "react-router";
import { useAppData } from "../context/AppDataContext";
import { Send, Users, User, Bell, Trash2, CheckCircle, History } from "lucide-react";

export function AdminNotificaciones() {
  const { currentUser, personalList, enviarNotificacion, notificaciones, eliminarNotificacion } = useAppData();
  
  const [mensaje, setMensaje] = useState("");
  const [destinatario, setDestinatario] = useState<"todos" | number>("todos");
  const [prioridad, setPrioridad] = useState<"Baja" | "Media" | "Alta">("Media");
  const [enviando, setEnviando] = useState(false);
  const [feedback, setFeedback] = useState("");

  if (!currentUser || !currentUser.roles.includes("admin")) {
    return <Navigate to="/login" replace />;
  }

  const handleEnviar = async () => {
    if (!mensaje.trim()) {
      setFeedback("Por favor, escribe un mensaje.");
      return;
    }

    setEnviando(true);
    setFeedback("");

    const notif = {
      usuario_id: destinatario === "todos" ? null : destinatario,
      mensaje: mensaje.trim(),
      tipo: (destinatario === "todos" ? "Global" : "Específica") as "Global" | "Específica",
      prioridad,
    };

    try {
      await enviarNotificacion(notif);
      setFeedback("Notificación enviada con éxito.");
      setMensaje("");
    } catch (error) {
      setFeedback("Error al enviar la notificación.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Notificaciones</h1>
            <p className="mt-2 text-slate-500">Envía mensajes globales o específicos al personal del equipo.</p>
          </div>
          <div className="hidden sm:block">
            <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
              <Bell className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Formulario de envío */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <Send className="h-5 w-5 text-blue-500" />
            Nueva Notificación
          </h2>
          
          <div className="mt-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Destinatario</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setDestinatario("todos")}
                  className={`flex items-center justify-center gap-2 rounded-2xl border py-3 transition ${
                    destinatario === "todos"
                      ? "border-blue-500 bg-blue-50 text-blue-600"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  Todo el personal
                </button>
                <div className="relative">
                  <select
                    value={typeof destinatario === "number" ? destinatario : ""}
                    onChange={(e) => setDestinatario(Number(e.target.value))}
                    className={`w-full rounded-2xl border py-3 pl-10 pr-4 transition appearance-none outline-none ${
                      typeof destinatario === "number"
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    <option value="">Seleccionar personal...</option>
                    {personalList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombres} {p.apellidos}
                      </option>
                    ))}
                  </select>
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Prioridad</label>
              <div className="flex gap-3">
                {(["Baja", "Media", "Alta"] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPrioridad(p)}
                    className={`flex-1 rounded-xl border py-2 text-sm transition ${
                      prioridad === p
                        ? p === "Alta" ? "bg-red-50 border-red-200 text-red-600" :
                          p === "Media" ? "bg-amber-50 border-amber-200 text-amber-600" :
                          "bg-green-50 border-green-200 text-green-600"
                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Mensaje</label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                placeholder="Escribe el contenido de la notificación..."
                rows={4}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-slate-900 outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            <button
              onClick={handleEnviar}
              disabled={enviando}
              className="w-full rounded-2xl bg-slate-900 py-4 text-white font-medium transition hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {enviando ? "Enviando..." : (
                <>
                  <Send className="h-4 w-4" />
                  Enviar Notificación
                </>
              )}
            </button>

            {feedback && (
              <div className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
                feedback.includes("éxito") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
              }`}>
                <CheckCircle className="h-4 w-4" />
                {feedback}
              </div>
            )}
          </div>
        </section>

        {/* Historial de notificaciones enviadas (globales y recientes) */}
        <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm overflow-hidden flex flex-col">
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Historial Reciente</h2>
          <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
            {!Array.isArray(notificaciones) || notificaciones.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-20" />
                No se han enviado notificaciones aún.
              </div>
            ) : (
              notificaciones.map((n) => (
                <div key={n.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm relative group">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                      n.tipo === 'Global' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {n.tipo}
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(n.created_at).toLocaleDateString()} {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-800 text-sm leading-relaxed">{n.mensaje}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        n.prioridad === 'Alta' ? 'bg-red-500' : n.prioridad === 'Media' ? 'bg-amber-500' : 'bg-green-500'
                      }`} />
                      <span className="text-xs text-slate-500">Prioridad {n.prioridad}</span>
                    </div>
                    <button 
                      onClick={() => eliminarNotificacion(n.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 transition rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Registro Detallado de Notificaciones */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <History className="h-5 w-5 text-slate-500" />
            Registro de Enviados
          </h2>
          <span className="text-xs text-slate-400">Total: {notificaciones.length} notificaciones</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Fecha / Hora</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Destinatario</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Mensaje</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Prioridad</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-50">
              {!Array.isArray(notificaciones) || notificaciones.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400 italic">No hay registros de notificaciones.</td>
                </tr>
              ) : (
                notificaciones.map((n) => {
                  const dest = n.usuario_id 
                    ? personalList.find(p => p.id === n.usuario_id) 
                    : null;
                  return (
                    <tr key={n.id} className="hover:bg-slate-50/50 transition">
                      <td className="px-4 py-4 whitespace-nowrap text-xs text-slate-600">
                        {new Date(n.created_at).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {n.usuario_id ? (
                            <>
                              <User className="h-3 w-3 text-blue-400" />
                              <span className="text-xs font-medium text-slate-700">
                                {dest ? `${dest.nombres} ${dest.apellidos}` : `ID: ${n.usuario_id}`}
                              </span>
                            </>
                          ) : (
                            <>
                              <Users className="h-3 w-3 text-purple-400" />
                              <span className="text-xs font-medium text-slate-700">Global (Todo el personal)</span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-slate-600 max-w-xs truncate">
                        {n.mensaje}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          n.tipo === 'Global' ? 'bg-purple-50 text-purple-600' : 
                          n.tipo === 'Automática' ? 'bg-slate-100 text-slate-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {n.tipo}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            n.prioridad === 'Alta' ? 'bg-red-500' : n.prioridad === 'Media' ? 'bg-amber-500' : 'bg-green-500'
                          }`} />
                          <span className="text-[11px] text-slate-600">{n.prioridad}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-xs">
                        <button 
                          onClick={() => eliminarNotificacion(n.id)}
                          className="text-slate-400 hover:text-red-500 transition p-1"
                          title="Eliminar registro"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
