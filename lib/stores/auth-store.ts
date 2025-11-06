import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: number;
  email: string;
  username: string;
  fullName: string;
  roles: string[]; // <-- CAMBIADO DE 'role' a 'roles'
}

interface RegisterData {
  email: string
  password: string
  name: string
  username: string
  roleName?: string; // <-- CAMBIADO DE 'role' a 'roleName'
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  register: (data: RegisterData) => Promise<void>
  login: (email: string, password: string) => Promise<User>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      register: async (data) => {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al registrar el usuario.")
        }

        // Opcional: Iniciar sesión automáticamente después del registro
      },

      login: async (email, password) => {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Error al iniciar sesión")
        }

        const { user } = await response.json()
        console.log("Usuario recibido en el frontend:", user) // Añadimos este log para depurar
        set({ user, isAuthenticated: true })
        return user
      },

      logout: async () => {
        try {
          await fetch("/api/auth/logout", { method: "POST" })
        } catch (error) {
          console.error("Error al cerrar sesión en el servidor:", error)
        } finally {
          set({ user: null, isAuthenticated: false })
        }
      },

      setUser: (user) => {
        set({ user, isAuthenticated: !!user })
      },
    }),
    {
      name: "auth-storage", // name of the item in the storage (must be unique)
      onRehydrateStorage: () => (state) => {
        // Opcional: puedes verificar la validez del token/sesión aquí al rehidratar
        // state?.setUser(state.user)
      },
    },
  ),
)