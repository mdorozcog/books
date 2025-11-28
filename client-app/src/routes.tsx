import type { RouteObject } from "react-router";
import { Navigate } from "react-router";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import BooksPage from "./pages/BooksPage";
import AddBookPage from "./pages/AddBookPage";

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
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/dashboard",
    element: <Navigate to="/dashboard/home" replace />,
  },
  {
    path: "/dashboard/home",
    element: <HomePage />,
  },
  {
    path: "/dashboard/books",
    element: <BooksPage />,
  },
  {
    path: "/dashboard/books/new",
    element: <AddBookPage />,
  },
  {
    path: "/dashboard/books/:id/edit",
    element: <AddBookPage />,
  },
];
