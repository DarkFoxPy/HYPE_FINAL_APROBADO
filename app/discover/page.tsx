"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link" 
import { GlassCard } from "@/components/ui/glass-card"
import { GradientButton } from "@/components/ui/gradient-button"
import { Calendar, MapPin, Users, Search, Sparkles, SlidersHorizontal, LogOut } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { FuturisticBackground } from "@/components/futuristic-background"
import toast from "react-hot-toast"
import { useAuthStore } from "@/lib/stores/auth-store"

const CATEGORIES = ["Todos", "Conferencia", "Concierto", "Exposición", "Networking", "Taller", "Deportivo", "Cultural"]

export default function DiscoverPage() {
  const router = useRouter()
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("Todos")
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all")
  const [sortBy, setSortBy] = useState<"date" | "popularity" | "availability">("date")
  const { isAuthenticated, user, logout } = useAuthStore()

  useEffect(() => {
    const fetchPublishedEvents = async () => {
      try {
        console.log("[v0] Fetching published events for Discover")
        const response = await fetch("/api/events")
        if (response.ok) {
          const data = await response.json()
          const allEvents = Array.isArray(data) ? data : data.events || []
          // Filter only published events
          const publishedEvents = Array.isArray(allEvents)
            ? allEvents.filter((event: any) => event.status === "published")
            : []
          setEvents(publishedEvents)
          console.log("[v0] Loaded published events:", publishedEvents.length)
        } else {
          console.error("[v0] Failed to fetch events:", response.status)
          setEvents([])
        }
      } catch (error) {
        console.error("[v0] Error fetching events:", error)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    fetchPublishedEvents()
  }, [])

  const handleLogout = async () => {
    await logout()
    toast.success("Sesión cerrada exitosamente")
    router.push("/")
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory = selectedCategory === "Todos" || event.category === selectedCategory

    const eventDate = new Date(event.start_date)
    const now = new Date()
    const matchesDate =
      dateFilter === "all" ||
      (dateFilter === "today" && eventDate.toDateString() === now.toDateString()) ||
      (dateFilter === "week" && eventDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)) ||
      (dateFilter === "month" && eventDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000))

    return matchesSearch && matchesCategory && matchesDate
  })

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    } else if (sortBy === "popularity") {
      return b.registrations_count - a.registrations_count
    } else {
      const aAvailable = a.capacity - a.registrations_count
      const bAvailable = b.capacity - b.registrations_count
      return bAvailable - aAvailable
    }
  })

  if (loading) {
    return (
      <FuturisticBackground>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f1c6ff] mx-auto mb-4"></div>
            <p className="text-[#e2e2e2]">Cargando eventos...</p>
          </div>
        </div>
      </FuturisticBackground>
    )
  }

  return (
    <FuturisticBackground>
      <div className="min-h-screen">
        <header className="sticky top-0 z-50 bg-[#1e1732]/95 backdrop-blur-2xl border-b border-[#f1c6ff]/30">
          <div className="container mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f1c6ff] to-[#ffddff] rotate-45 group-hover:rotate-[405deg] transition-all duration-700" />
                <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-[#1e1732]" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-[#f1c6ff] via-[#ffddff] to-[#f1c6ff] bg-clip-text text-transparent">
                HYPE
              </span>
            </Link>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-4">
                <Link href="/events" className="text-sm font-medium text-foreground/80 hover:text-foreground">
                  Mis Eventos
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-foreground/60 hover:text-foreground/80 transition-colors"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <button className="px-6 py-2.5 text-[#e2e2e2] hover:text-[#f1c6ff] transition-all duration-300">
                    Iniciar Sesión
                  </button>
                </Link>
                <Link href="/register">
                  <GradientButton>Crear Cuenta</GradientButton>
                </Link>
              </div>
            )}
          </div>
        </header>

        <main className="container mx-auto px-6 py-12 space-y-6">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-[#f1c6ff]/20 via-[#ffddff]/20 to-[#f1c6ff]/20 blur-3xl" />
            <GlassCard className="relative" glow="primary">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f1c6ff] to-[#ffddff] glow-primary flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-[#1e1732]" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold gradient-text mb-2">Descubre Eventos</h1>
                  <p className="text-[#78767b]">Explora experiencias inmersivas en 3D</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Search & Filters */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Search Bar */}
            <div className="lg:col-span-6">
              <GlassCard>
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-muted" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar eventos..."
                    className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted"
                  />
                </div>
              </GlassCard>
            </div>

            {/* Date Filter */}
            <div className="lg:col-span-3">
              <GlassCard>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-muted" />
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value as any)}
                    className="flex-1 bg-transparent border-none outline-none text-foreground cursor-pointer"
                  >
                    <option value="all">Todas las fechas</option>
                    <option value="today">Hoy</option>
                    <option value="week">Esta semana</option>
                    <option value="month">Este mes</option>
                  </select>
                </div>
              </GlassCard>
            </div>

            {/* Sort */}
            <div className="lg:col-span-3">
              <GlassCard>
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-muted" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="flex-1 bg-transparent border-none outline-none text-foreground cursor-pointer"
                  >
                    <option value="date">Por fecha</option>
                    <option value="popularity">Por popularidad</option>
                    <option value="availability">Por disponibilidad</option>
                  </select>
                </div>
              </GlassCard>
            </div>
          </div>

          {/* Category Filters */}
          <GlassCard>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedCategory === category // Botón activo
                      ? "bg-gradient-to-r from-primary to-secondary text-background font-bold glow-primary"
                      : "bg-surface/50 text-foreground/60 hover:text-foreground hover:bg-surface" // Botón inactivo
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <p className="text-muted">
              <span className="font-semibold text-foreground">{sortedEvents.length}</span> eventos encontrados
            </p>
            {(searchQuery || selectedCategory !== "Todos" || dateFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("")
                  setSelectedCategory("Todos")
                  setDateFilter("all")
                }}
                className="text-sm text-primary hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Events Grid */}
          {sortedEvents.length === 0 ? (
            <GlassCard>
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-muted" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No se encontraron eventos</h3>
                <p className="text-muted mb-6">Intenta con otros términos de búsqueda o categorías</p>
                <GradientButton
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory("Todos")
                    setDateFilter("all")
                  }}
                >
                  Limpiar filtros
                </GradientButton>
              </div>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedEvents.map((event) => {
                const availableSpots = event.capacity - event.registrations_count
                const percentFull = (event.registrations_count / event.capacity) * 100

                return (
                  <Link key={event.id} href={`/discover/${event.slug}/${event.id}`}>
                    <GlassCard hover glow="primary" className="h-full flex flex-col group">
                      {/* Event Image */}
                      <div className="relative h-48 -m-6 mb-4 rounded-t-xl overflow-hidden">
                        <img
                          src={
                            event.cover_image ||
                            `/placeholder.svg?height=200&width=400&query=${encodeURIComponent(event.title) || "/placeholder.svg"}`
                          }
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />

                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <Badge
                            variant="outline"
                            className="bg-primary/20 text-primary border-primary/30 backdrop-blur-sm"
                          >
                            {event.category}
                          </Badge>
                        </div>

                        {/* 3D Badge */}
                        {event.map_json_file && (
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-gradient-to-r from-secondary to-accent-pink text-white glow-secondary border-0">
                              Vista 3D
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Event Info */}
                      <div className="flex-1 space-y-3">
                        <h3 className="text-xl font-bold text-foreground line-clamp-2 group-hover:gradient-text transition-all text-glow">
                          {event.title}
                        </h3>
                        <p className="text-sm text-muted line-clamp-2">{event.description}</p>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted">
                            <Calendar className="w-4 h-4" />
                            {new Date(event.start_date).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted">
                            <MapPin className="w-4 h-4" />
                            {event.location || "Ubicación por definir"}
                          </div>
                        </div>

                        {/* Availability */}
                        <div className="pt-3 border-t border-border/50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="w-4 h-4 text-muted" />
                              <span className="text-foreground font-semibold">{availableSpots}</span>
                              <span className="text-muted">lugares disponibles</span>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="h-2 bg-surface rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                percentFull > 80
                                  ? "bg-gradient-to-r from-error to-warning"
                                  : percentFull > 50
                                    ? "bg-gradient-to-r from-warning to-success"
                                    : "bg-gradient-to-r from-primary to-secondary"
                              }`}
                              style={{ width: `${percentFull}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* CTA */}
                      <div className="mt-4 pt-4 border-t border-border/50">
                        <GradientButton className="w-full" size="sm">
                          Ver Detalles
                        </GradientButton>
                      </div>
                    </GlassCard>
                  </Link>
                )
              })}
            </div>
          )}
        </main>
      </div>
    </FuturisticBackground>
  )
}
