import type { RouteObject } from "react-router";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
];
