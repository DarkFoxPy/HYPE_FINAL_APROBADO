"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link" 
import { useEventsStore } from "@/lib/stores/events-store"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { GlassCard } from "@/components/ui/glass-card"
import { GradientButton } from "@/components/ui/gradient-button"
import { FuturisticBackground } from "@/components/futuristic-background"
import { Calendar, MapPin, Users, Plus, Edit, Trash2, Eye, Upload } from "lucide-react"
import toast from "react-hot-toast" 
import { useAuthorization } from "../../lib/hooks/useAuthorization"

export default function EventsPage() {
  const router = useRouter()
  // Proteger la ruta: sysadmin, administrador y organizer pueden acceder.
  // admin-reporte será redirigido.
  const { user, hasRole } = useAuthorization(["sysadmin", "administrador", "organizer"])

  const { events, deleteEvent, getEventsByOrganizer, publishEvent, updateEvent } = useEventsStore()
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all")
  const [myEvents, setMyEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadEvents = async () => {
      if (user) {
        const organizerEvents = await getEventsByOrganizer(user.id)
        setMyEvents(organizerEvents)
      }
      setLoading(false)
    }

    loadEvents()
  }, [user, getEventsByOrganizer])

  const filteredEvents = filter === "all" ? myEvents : myEvents.filter((event) => event.status === filter)

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de inactivar este evento? Volverá a estado borrador.")) {
      try {
        await updateEvent(id, { status: "draft" })
        toast.success("Evento inactivado - movido a borradores")
        // Reload events
        if (user) {
          const organizerEvents = await getEventsByOrganizer(user.id)
          setMyEvents(organizerEvents)
        }
      } catch (error) {
        toast.error("Error al inactivar el evento")
      }
    }
  }

  const handlePublish = async (id: string) => {
    try {
      await publishEvent(id)
      toast.success("Evento publicado exitosamente")
      // Reload events
      if (user) {
        const organizerEvents = await getEventsByOrganizer(user.id)
        setMyEvents(organizerEvents)
      }
    } catch (error) {
      toast.error("Error al publicar el evento")
    }
  }

  return (
    <FuturisticBackground>
      <div className="flex min-h-screen">
        <Sidebar />

        <div className="flex-1 lg:ml-64">
          <Header />

          <main className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-[#ffddff] mb-2 text-glow">Mis Eventos</h1>
                <p className="text-[#e2e2e2]">Gestiona todos tus eventos en un solo lugar</p>
              </div>
              <Link href="/events/create">
                <GradientButton size="lg" className="gap-2">
                  <Plus className="w-5 h-5" />
                  Crear Evento
                </GradientButton>
              </Link>
            </div>

            {/* Filters */}
            <GlassCard>
              <div className="flex gap-2">
                {(["all", "published", "draft"] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      filter === status // Botón activo
                        ? "bg-gradient-to-r from-primary to-secondary text-background font-bold glow-primary"
                        : "bg-surface/50 text-foreground/60 hover:text-foreground hover:bg-surface" // Botón inactivo
                    }`}
                  >
                    {status === "all" ? "Todos" : status === "published" ? "Publicados" : "Borradores"}
                  </button>
                ))}
              </div>
            </GlassCard>

            {/* Events Grid */}
            {filteredEvents.length === 0 ? (
              <GlassCard>
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f1c6ff]/20 to-[#ffddff]/20 flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-10 h-10 text-[#78767b]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#ffddff] mb-2">No hay eventos</h3>
                  <p className="text-[#e2e2e2] mb-6">Crea tu primer evento con visualización 3D</p>
                  <Link href="/events/create">
                    <GradientButton>Crear Evento</GradientButton>
                  </Link>
                </div>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <GlassCard key={event.id} hover glow="primary" className="flex flex-col">
                    {/* Event Image */}
                    <div className="relative h-48 -m-6 mb-4 rounded-t-xl overflow-hidden">
                      <img
                        src={
                          event.coverImage ||
                          `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(event.title) || "/placeholder.svg"}`
                        }
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1e1732]/90 to-transparent" />
                      <div className="absolute top-4 right-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            event.status === "published"
                              ? "bg-success/20 text-success border border-success/30"
                              : "bg-warning/20 text-warning border border-warning/30"
                          }`}
                        >
                          {event.status === "published" ? "Publicado" : "Borrador"}
                        </span>
                      </div>
                    </div>

                    {/* Event Info */}
                    <div className="flex-1 space-y-3">
                      <h3 className="text-xl font-bold text-[#ffddff] line-clamp-2">{event.title}</h3>
                      <p className="text-sm text-[#e2e2e2] line-clamp-2">{event.description}</p>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-[#e2e2e2]">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.startDate).toLocaleDateString("es-ES", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#e2e2e2]">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[#e2e2e2]">
                          <Users className="w-4 h-4" />
                          {event.registrations} / {event.capacity} asistentes
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-2 mt-4 pt-4 border-t border-[#f1c6ff]/20">
                      {event.status === "draft" && (
                        <button
                          onClick={() => handlePublish(event.id)}
                          className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-[#f1c6ff] to-[#ffddff] text-[#1e1732] font-semibold hover:shadow-lg hover:shadow-[#f1c6ff]/50 transition-all flex items-center justify-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Publicar Evento
                        </button>
                      )}

                      <div className="flex gap-2">
                        <Link href={`/events/${event.slug}/${event.id}`} className="flex-1">
                          <button className="w-full px-4 py-2 rounded-lg bg-[#1e1732]/50 hover:bg-[#1e1732] text-[#ffddff] transition-all flex items-center justify-center gap-2">
                            <Eye className="w-4 h-4" />
                            Ver
                          </button>
                        </Link>
                        <Link href={`/events/${event.slug}/${event.id}/edit`} className="flex-1">
                          <button className="w-full px-4 py-2 rounded-lg bg-[#f1c6ff]/20 hover:bg-[#f1c6ff]/30 text-[#f1c6ff] transition-all flex items-center justify-center gap-2">
                            <Edit className="w-4 h-4" />
                            Editar
                          </button>
                        </Link>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="px-4 py-2 rounded-lg bg-warning/20 hover:bg-warning/30 text-warning transition-all"
                          title="Inactivar evento (mover a borrador)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </FuturisticBackground>
  )
}
