import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Notifications } from "@/pages/dashboard";
import { element } from "prop-types";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import { TableView } from "./pages/dashboard/View";
import AccesUser from "./pages/dashboard/acces-users";
import RolTable from "./pages/dashboard/Rol";
import TableModule from "./pages/dashboard/module";
import TableUser from "./pages/dashboard/user";
import SignIn from "./pages/auth/sign-in";
import { SignUp } from "./pages/auth";
import Formulario from "./pages/dashboard/form-builder-and-response";
import TableRolView from "./pages/dashboard/rol_view";
import Aprendiz from "./pages/dashboard/Aprendiz";
import SearchForm from "./pages/dashboard/Consultar";
import QuestionnairePage from "./pages/dashboard/QuestionnairePage";
import ProcessManagement from "./pages/dashboard/process-management";
import TableAmbiente from "./pages/dashboard/AmbiHorario/Ambiente";
import TableTipoVinculo from "./pages/dashboard/AmbiHorario/Tipo-vinculo";
import { TableFase } from "./pages/dashboard/AmbiHorario/Fase";
import { TableNivelFormacion } from "./pages/dashboard/AmbiHorario/Nivelformacion";
import TableInstructor from "./pages/dashboard/AmbiHorario/Instructor";
import TableProyecto from "./pages/dashboard/AmbiHorario/Proyecto";
import TablePeriodo from "./pages/dashboard/AmbiHorario/Periodo";
import TablePrograma from "./pages/dashboard/AmbiHorario/Programa";
import TableCompetencia from "./pages/dashboard/AmbiHorario/Competencia";


const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes_auth = {
  title: "auth pages",
  layout: "auth",
  pages: [
    {
      icon: <ServerStackIcon {...icon} />,
      name: "sign in",
      path: "/sign-in",
      element: <SignIn />,
    },
    {
      icon: <RectangleStackIcon {...icon} />,
      name: "sign up",
      path: "/sign-up",
      element: <SignUp />,
    },

    {
      icon: <RectangleStackIcon {...icon} />,
      name: "forgo",
      path: "/forgot-password",
      element : <ForgotPassword/>,
      
    },
    {
      icon : <RectangleStackIcon {...icon} />,
      name : "reset",
      path : "/reset-password",
      element : <ResetPassword/>,
    },
  ],
}

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "profile",
        path: "/profile",
        element: <Profile />, 
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Acceso de usuario",
        path: "/acces-user",
        element: <AccesUser />,
      },
      //Tablas 
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Gestión de vista",
        path: "/view",
        element: <TableView  />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Gestion de roles",
        path: "/rol",
        element: <RolTable />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "Permisos de rutas",
        path: "/rolview",
        element: <TableRolView />,
      },
      {
        name: "Gestión de modulos",
        path: "/module",
        element: <TableModule  />,
      },
      {
        name: "Gestion de usuarios",
        path: "/user",
        element: <TableUser  />,
      },
      {
        name: "Notificaciones",
        path: "/notifications",
        element: <Notifications />,
      },
      {
        name: "Gestion de aprendices",
        path: "/aprendices",
        element: <Aprendiz />,
      },
      {
        name: "Cuestioanrios",
        path: "/cuestionarios",
        element: <Formulario />,
      },
      {
        name: "formulario",
        path: "/formulario",
        element: <QuestionnairePage />,
      },
      {
        name: "consultar",
        path: "/consultar",
        element: <SearchForm />,
      },
      {
        name: "process",
        path: "/process",
        element: <ProcessManagement />
      },
      {
        name: "ambiente",
        path: "/ambiente",
        element: <TableAmbiente/>
      },
      {
        name: "tipovinculo",
        path: "/tipovinculo",
        element: <TableTipoVinculo/>
      },
      {
        name: "fase",
        path: "/fase",
        element: <TableFase/>
      },
      {
        name: "nivelformacion",
        path: "/nivelformacion",
        element: <TableNivelFormacion/>
      },
      {
        name: "instructor",
        path: "/instructor",
        element: <TableInstructor/>
      },
      {
        name: "proyecto",
        path: "/proyecto",
        element: <TableProyecto/>
      },
      {
        name: "periodo",
        path: "/periodo",
        element: <TablePeriodo/>
      },
      {
        name: "programa",
        path: "/programa",
        element: <TablePrograma/>
      },
      {
        name: "competencia",
        path: "/competencia",
        element: <TableCompetencia/>
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },

    {
        icon: <RectangleStackIcon {...icon} />,
        name: "forgot password",
        path: "/forgot-password",
        element : <ForgotPassword/>,
      },
      {
        icon : <RectangleStackIcon {...icon} />,
        name : "reset password",
        path : "/reset-password",
        element : <ResetPassword/>,
      }, 
    ],
  },
];

export default routes;
