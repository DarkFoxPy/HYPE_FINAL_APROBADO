"use client"

import { useAuthorization } from "../../lib/hooks/useAuthorization"
import { FuturisticBackground } from "@/components/futuristic-background"
import { GlassCard } from "@/components/ui/glass-card"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { User } from "lucide-react"

export default function ProfilePage() {
  // Proteger la ruta: solo sysadmin y administrador pueden acceder.
  // admin-reporte y organizer serán redirigidos.
  const { user } = useAuthorization(["sysadmin", "administrador"])

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
              <User className="w-12 h-12 text-primary mb-4" />
              <h1 className="text-3xl font-bold text-foreground">Página de Perfil</h1>
              <p className="text-muted mt-2">
                Bienvenido, {user.fullName}. Aquí podrás ver y editar la información de tu perfil.
              </p>
            </GlassCard>
          </main>
        </div>
      </div>
    </FuturisticBackground>
  )
}