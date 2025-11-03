"use client"

import { useAuthStore } from "@/lib/stores/auth-store"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

// Define los roles posibles para mejorar la seguridad del tipado
type Role = "sysadmin" | "administrador" | "admin-reporte" | "organizer" | "attendee" | "consumer"

/**
 * Hook para gestionar la autorización basada en roles.
 * Redirige al usuario si no tiene los roles requeridos.
 * @param requiredRoles - Una lista de roles. El usuario debe tener al menos uno para acceder.
 * @param options - Opciones para configurar el comportamiento del hook.
 */
export function useAuthorization(requiredRoles: Role[], redirectTo = "/login") {
  const { user, isAuthenticated } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isAuthenticated === false && user === null) {
      return
    }

    if (isAuthenticated && user) {
      const userRoles = user.roles || []
      const isConsumerType = (userRoles.length === 1 && userRoles[0] === "consumer") || userRoles.length === 0

      // --- LÓGICA EXCLUSIVA PARA EL ROL 'CONSUMER' O SIN ROL ---
      if (isConsumerType) {
        // Si es de tipo consumer, solo puede estar en /discover o sus sub-rutas.
        if (!pathname.startsWith("/discover")) {
          router.push("/discover")
        }
        return // No se aplican más reglas para este tipo de usuario.
      }

      // --- LÓGICA ORIGINAL PARA LOS DEMÁS ROLES (SIN CAMBIOS) ---
      if (requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some((role) => userRoles.includes(role))
        if (!hasRequiredRole) {
          router.push("/unauthorized") // Redirigir a la página de acceso denegado
        }
      }
    }
  }, [user, isAuthenticated, router, requiredRoles, redirectTo, pathname])

  // Devolvemos una función para verificar roles específicos si es necesario
  const hasRole = (roles: Role | Role[]) => {
    if (!user) return false
    const rolesToCheck = Array.isArray(roles) ? roles : [roles]
    return rolesToCheck.some((role) => (user as any).roles?.includes(role))
  }

  return { user, isAuthenticated, hasRole }
}