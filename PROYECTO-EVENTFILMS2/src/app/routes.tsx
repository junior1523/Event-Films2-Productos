import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { Contratos } from "./components/Contratos";
import { Pagos } from "./components/Pagos";
import { Personal } from "./components/Personal";
import { Ediciones } from "./components/Ediciones";
import { Horarios } from "./components/Horarios";
import { MaterialAudiovisual } from "./components/MaterialAudiovisual";

export const router = createBrowserRouter([
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
    ],
  },
]);
