import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Contratos } from "./components/Contratos";
import { Pagos } from "./components/Pagos";
import { Personal } from "./components/Personal";
import { Ediciones } from "./components/Ediciones";
import { Horarios } from "./components/Horarios";
import { MaterialAudiovisual } from "./components/MaterialAudiovisual";
import { Login } from "./components/Login";
import { RoleSelector } from "./components/RoleSelector";
import { AdminUsuarios } from "./components/AdminUsuarios";
import { AdminNotificaciones } from "./components/AdminNotificaciones";
import { WorkerHome } from "./components/WorkerHome";
import { Profile } from "./components/Perfil";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "contratos", Component: Contratos },
      { path: "pagos", Component: Pagos },
      { path: "personal", Component: Personal },
      { path: "ediciones", Component: Ediciones },
      { path: "horarios", Component: Horarios },
      { path: "material", Component: MaterialAudiovisual },
      { path: "usuarios", Component: AdminUsuarios },
      { path: "notificaciones", Component: AdminNotificaciones },
      { path: "trabajador", Component: WorkerHome },
      { path: "perfil", Component: Profile },
      { path: "seleccionar-rol", Component: RoleSelector },
    ],
  },
]);
