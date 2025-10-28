"use client"

import { useAuthorization } from "../../lib/hooks/useAuthorization"
import { FuturisticBackground } from "@/components/futuristic-background"
import { GlassCard } from "@/components/ui/glass-card"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { BarChart } from "lucide-react"

export default function DashboardPage() {
  // Proteger la ruta: solo sysadmin y admin-reporte pueden acceder.
  const { user } = useAuthorization(["sysadmin", "admin-reporte"])

  // Si el hook aún no ha redirigido, podemos mostrar un loader.
  if (!user) {
    return <FuturisticBackground />
  }

  return (
    <FuturisticBackground>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 lg:ml-64">
          <Header />
          <main className="p-6">
            <GlassCard>
              <BarChart className="w-12 h-12 text-primary mb-4" />
              <h1 className="text-3xl font-bold text-foreground">Dashboard de Reportes</h1>
              <p className="text-muted mt-2">Bienvenido, {user.fullName}. Aquí se mostrarán los reportes del sistema.</p>
            </GlassCard>
          </main>
        </div>
      </div>
    </FuturisticBackground>
  )
}