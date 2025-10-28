"use client"

import { useAuthStore } from "@/lib/stores/auth-store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

// Define los roles posibles para mejorar la seguridad del tipado
type Role = "sysadmin" | "administrador" | "admin-reporte" | "organizer" | "attendee"

/**
 * Hook para gestionar la autorización basada en roles.
 * Redirige al usuario si no tiene los roles requeridos.
 * @param requiredRoles - Una lista de roles. El usuario debe tener al menos uno para acceder.
 * @param redirectTo - La página a la que se redirigirá si el usuario no está autenticado. Por defecto es /login.
 */
export function useAuthorization(requiredRoles: Role[], redirectTo = "/login") {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    // Si el estado de autenticación aún no se ha cargado, no hacemos nada todavía.
    if (isAuthenticated === false && user === null) {
      // Podríamos esperar a que la persistencia cargue, pero por ahora redirigimos si no hay user
      // router.push(redirectTo);
      return
    }

    // Si está autenticado, verificar los roles
    const userRoles = (user as any)?.roles || []
    const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role))

    if (!hasRequiredRole && isAuthenticated) {
      router.push("/unauthorized") // Redirigir a la página de acceso denegado
    }
  }, [user, isAuthenticated, router, requiredRoles, redirectTo])

  // Devolvemos una función para verificar roles específicos si es necesario
  const hasRole = (roles: Role | Role[]) => {
    if (!user) return false
    const rolesToCheck = Array.isArray(roles) ? roles : [roles]
    return rolesToCheck.some((role) => (user as any).roles?.includes(role))
  }

  return { user, isAuthenticated, hasRole }
}