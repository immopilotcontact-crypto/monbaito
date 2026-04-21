"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "./Navbar";

const APP_ROUTES = [
  "/dashboard",
  "/candidatures",
  "/profil",
  "/settings",
  "/onboarding",
  "/auth",
];

export function NavigationBar() {
  const pathname = usePathname();

  const isAppRoute = APP_ROUTES.some((route) => pathname.startsWith(route));

  if (isAppRoute) return null;

  return <Navbar />;
}
