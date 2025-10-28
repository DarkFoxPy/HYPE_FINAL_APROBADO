"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useUIStore } from "@/lib/stores/ui-store"
import { useAuthStore } from "@/lib/stores/auth-store"
import { Calendar, Compass, LayoutDashboard, User, Sparkles, X } from "lucide-react"

const allNavigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["sysadmin", "admin-reporte"] },
  { name: "Mis Eventos", href: "/events", icon: Calendar, roles: ["sysadmin", "administrador", "organizer"] },
  { name: "Descubrir", href: "/discover", icon: Compass, roles: ["sysadmin", "administrador", "organizer", "admin-reporte", "attendee"] },
  { name: "Perfil", href: "/profile", icon: User, roles: ["sysadmin", "administrador", "admin-reporte", "organizer", "attendee"] },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useUIStore()
  const { user } = useAuthStore()

  // Filtra los elementos de navegación basados en los roles del usuario.
  const navigation = user
    ? allNavigationItems.filter((item) => {
        // Si el item no tiene roles definidos, es público para todos los autenticados.
        if (!item.roles || item.roles.length === 0) {
          return true
        }
        // Comprueba si el usuario tiene al menos uno de los roles requeridos.
        return item.roles.some((role) => user.roles.includes(role))
      })
    : [] // Si no hay usuario, no se muestra ningún item de navegación en el sidebar.


  if (!sidebarOpen) return null

  return (
    <>
      {/* Mobile overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-50 h-screen w-64 bg-[#1e1732]/90 backdrop-blur-xl border-r border-[#f1c6ff]/30 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[#f1c6ff]/30">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#f1c6ff] to-[#ffddff] flex items-center justify-center shadow-lg shadow-[#f1c6ff]/50">
                <Sparkles className="w-6 h-6 text-[#1e1732]" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-[#f1c6ff] to-[#ffddff] bg-clip-text text-transparent">
                  HYPE
                </h1>
                <p className="text-xs text-white">3D Immersive</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-[#2a1f3d] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 relative",
                  isActive
                    ? "bg-gradient-to-r from-[#f1c6ff]/20 to-[#ffddff]/20 text-[#ffddff] border border-[#f1c6ff]/30 shadow-lg shadow-[#f1c6ff]/20"
                    : "text-white hover:text-[#ffddff] hover:bg-[#2a1f3d]/50",
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium flex-1">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* User Profile */}
        {user && (
          <div className="p-4 border-t border-[#f1c6ff]/30">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#2a1f3d]/50">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                alt={user.fullName}
                className="w-10 h-10 rounded-full ring-2 ring-[#f1c6ff]/50"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-[#ffddff]">{user.fullName}</p>
                <p className="text-xs text-white truncate">@{user.username}</p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
