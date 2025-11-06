"use client"

import { useState } from "react"
import { useRouter } from "next/navigation" 
import { Bell, Menu, Search, X } from "lucide-react"
import { useUIStore } from "@/lib/stores/ui-store"
import { useNotificationsStore } from "@/lib/stores/notifications-store"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useEventsStore } from "@/lib/stores/events-store"
import { GradientButton } from "@/components/ui/gradient-button"
import Link from "next/link"
import toast from "react-hot-toast"

export function Header() {
  const router = useRouter()
  const { toggleSidebar } = useUIStore()
  const { unreadCount } = useNotificationsStore()
  const { logout } = useAuthStore()
  const { events } = useEventsStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearchResults, setShowSearchResults] = useState(false)

  const searchResults =
    searchQuery.length > 0
      ? events
          .filter(
            (event) =>
              event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
              event.location.toLowerCase().includes(searchQuery.toLowerCase()),
          )
          .slice(0, 5)
      : []

  const handleSearchSelect = (eventId: string) => {
    setSearchQuery("")
    setShowSearchResults(false)
    const event = events.find((e) => e.id === eventId)
    if (event) {
      router.push(`/events/${event.slug}/${eventId}`)
    }
  }

  const handleLogout = async () => {
    await logout()
    toast.success("Sesión cerrada exitosamente")
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-30 glass border-b border-border/50 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button onClick={toggleSidebar} className="p-2 hover:bg-surface rounded-lg transition-colors">
            <Menu className="w-5 h-5" />
          </button>

          {/* Search */}
          <div className="hidden md:block relative">
            <div className="flex items-center gap-2 px-4 py-2 bg-surface/50 rounded-lg border border-border/50 w-96">
              <Search className="w-4 h-4 text-muted" />
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowSearchResults(true)
                }}
                onFocus={() => setShowSearchResults(true)}
                className="bg-transparent border-none outline-none text-sm flex-1 text-foreground placeholder:text-muted"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery("")
                    setShowSearchResults(false)
                  }}
                  className="p-1 hover:bg-surface rounded transition-colors"
                >
                  <X className="w-3 h-3 text-muted" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchQuery && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSearchResults(false)} />
                <div className="absolute top-full left-0 right-0 mt-2 glass border border-border/50 rounded-lg overflow-hidden z-50 max-h-96 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((event) => (
                        <button
                          key={event.id}
                          onClick={() => handleSearchSelect(event.id)}
                          className="w-full px-4 py-3 hover:bg-surface/50 transition-colors text-left"
                        >
                          <div className="font-medium text-foreground text-sm mb-1">{event.title}</div>
                          <div className="text-xs text-muted line-clamp-1">{event.description}</div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-8 text-center text-muted text-sm">No se encontraron eventos</div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Link href="/notifications">
            <button className="relative p-2 hover:bg-surface rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {unreadCount() > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent-pink rounded-full text-xs flex items-center justify-center font-bold glow-pink">
                  {unreadCount()}
                </span>
              )}
            </button>
          </Link>

          {/* Logout */}
          <GradientButton variant="outline" size="sm" onClick={handleLogout} glow={false}>
            Salir
          </GradientButton>
        </div>
      </div>
    </header>
  )
}
