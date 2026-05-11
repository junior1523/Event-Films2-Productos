import { Outlet, Link, useLocation } from "react-router";
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
} from "lucide-react";
import { useState } from "react";

export function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Contratos", href: "/contratos", icon: FileText },
    { name: "Pagos", href: "/pagos", icon: CreditCard },
    { name: "Personal", href: "/personal", icon: Users },
    { name: "Ediciones", href: "/ediciones", icon: Film },
    { name: "Horarios", href: "/horarios", icon: Calendar },
    { name: "Material", href: "/material", icon: PackageOpen },
  ];

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
      <main className="md:pl-64 pt-16 md:pt-0">
        <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
