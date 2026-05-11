import { Outlet, Link, Navigate, useLocation } from "react-router";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Users,
  Film,
  Calendar,
  PackageOpen,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  SlidersHorizontal,
  Bell,
  Check,
} from "lucide-react";
import { useState } from "react";
import { useAppData } from "../context/AppDataContext";

export function Layout() {
  const { currentUser, logout, notificaciones = [], marcarNotificacionLeida } = useAppData();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  const adminNavigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Contratos", href: "/contratos", icon: FileText },
    { name: "Pagos", href: "/pagos", icon: CreditCard },
    { name: "Personal", href: "/personal", icon: Users },
    { name: "Ediciones", href: "/ediciones", icon: Film },
    { name: "Horarios", href: "/horarios", icon: Calendar },
    { name: "Material", href: "/material", icon: PackageOpen },
    { name: "Usuarios", href: "/usuarios", icon: ShieldCheck },
    { name: "Notificaciones", href: "/notificaciones", icon: Bell },
  ];

  const editorNavigation = [
    { name: "Ediciones", href: "/ediciones", icon: Film },
    { name: "Perfil", href: "/perfil", icon: Users },
  ];

  const personalNavigation = [
    { name: "Mi calendario", href: "/trabajador", icon: Calendar },
    { name: "Perfil", href: "/perfil", icon: Users },
    { name: "Notificaciones", href: "/notificaciones", icon: Bell },
  ];

  const mixedNavigation = [
    { name: "Selección de rol", href: "/seleccionar-rol", icon: SlidersHorizontal },
    { name: "Ediciones", href: "/ediciones", icon: Film },
    { name: "Mi calendario", href: "/trabajador", icon: Calendar },
    { name: "Perfil", href: "/perfil", icon: Users },
    { name: "Notificaciones", href: "/notificaciones", icon: Bell },
  ];

  const getNavigation = () => {
    if (currentUser.roles.includes("admin")) return adminNavigation;
    
    if (currentUser.roles.includes("personal")) {
      const spec = (currentUser.specialty || "").toLowerCase();
      const isEditor = spec.includes("editor");
      const isOther = spec.replace(/editor/g, "").replace(/[^a-z]/g, "").length > 0;
      
      if (isEditor && isOther) return mixedNavigation;
      if (isEditor) return editorNavigation;
      return personalNavigation;
    }
    
    return adminNavigation; // Fallback
  };

  const navigation = getNavigation();

  const unreadCount = Array.isArray(notificaciones) 
    ? notificaciones.filter((n) => !n.leido).length 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-gray-900 text-white">
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex items-center h-16 px-6 bg-gray-800">
            <Film className="w-8 h-8 text-blue-400" />
            <span className="ml-3 text-xl font-semibold">EventFilms Pro</span>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/" && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-16 px-4 bg-gray-900 text-white">
        <div className="flex items-center">
          <Film className="w-7 h-7 text-blue-400" />
          <span className="ml-2 text-lg font-semibold">EventFilms Pro</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md hover:bg-gray-800"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-gray-900 text-white pt-16">
          <nav className="px-3 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive =
                location.pathname === item.href ||
                (item.href !== "/" && location.pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="md:pl-64 pt-20 md:pt-0">
        <div className="sticky top-16 z-20 hidden md:block bg-gray-50 border-b border-slate-200">
          <div className="flex items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <div className="text-sm text-slate-600">
              Conectado como <strong>{currentUser.nombres} {currentUser.apellidos}</strong>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/perfil"
                className="inline-flex items-center rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-400 hover:text-slate-900"
              >
                <Users className="mr-2 h-4 w-4" /> Perfil
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <LogOut className="mr-2 h-4 w-4" /> Cerrar sesión
              </button>

              {/* Notification Bell */}
              <div className="relative ml-2">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 rounded-2xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 transition shadow-sm"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-3 w-80 rounded-3xl border border-slate-200 bg-white shadow-xl z-50 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <h3 className="text-sm font-bold text-slate-900">Notificaciones</h3>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                          {unreadCount} nuevas
                        </span>
                      )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notificaciones.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                          <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                          <p className="text-xs">No tienes notificaciones</p>
                        </div>
                      ) : (
                        notificaciones.map((n) => (
                          <div 
                            key={n.id} 
                            className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition relative group ${!n.leido ? 'bg-blue-50/30' : ''}`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                n.prioridad === 'Alta' ? 'bg-red-100 text-red-600' : 
                                n.prioridad === 'Media' ? 'bg-amber-100 text-amber-600' : 
                                'bg-green-100 text-green-600'
                              }`}>
                                {n.prioridad}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {new Date(n.created_at).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                              </span>
                            </div>
                            <p className={`text-xs leading-relaxed ${!n.leido ? 'font-medium text-slate-900' : 'text-slate-600'}`}>
                              {n.mensaje}
                            </p>
                            {!n.leido && (
                              <button 
                                onClick={() => marcarNotificacionLeida(n.id)}
                                className="mt-2 text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline"
                              >
                                <Check className="h-3 w-3" /> Marcar como leída
                              </button>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                    <div className="p-3 text-center border-t border-slate-100">
                      <Link 
                        to={currentUser.roles.includes('admin') ? "/notificaciones" : "/trabajador"} 
                        onClick={() => setNotifOpen(false)}
                        className="text-[11px] font-bold text-slate-500 hover:text-blue-600 transition"
                      >
                        Ver todo
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
