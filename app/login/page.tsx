"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/lib/stores/auth-store"
import { GradientButton } from "@/components/ui/gradient-button"
import { GlassCard } from "@/components/ui/glass-card"
import { Mail, Lock, Sparkles } from "lucide-react"
import toast from "react-hot-toast"
import { FuturisticBackground } from "@/components/futuristic-background"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const user = await login(formData.email, formData.password)
      toast.success("¡Bienvenido de vuelta!")

      // Lógica de redirección basada en roles
      if (user.roles.includes("administrador")) {
        router.push("/profile")
      } else {
        router.push("/dashboard")
      }

    } catch (error) {
      toast.error("Error al iniciar sesión. Verifica tus credenciales.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <FuturisticBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div
            className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#f1c6ff] to-[#ffddff] glow-primary mb-4 animate-float">
              <Sparkles className="w-10 h-10 text-[#1e1732]" />
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-2">HYPE</h1>
            <p className="text-[#b8a3ff]">Experiencias inmersivas en eventos</p>
          </div>

          {/* Login Form */}
          <GlassCard className="space-y-6" glow="primary">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#e2e2e2] mb-2">Iniciar Sesión</h2>
              <p className="text-sm text-[#b8a3ff]">Accede a tu cuenta para continuar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-surface/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-surface/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-foreground placeholder:text-muted"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <GradientButton type="submit" className="w-full" loading={loading} size="lg">
                Iniciar Sesión
              </GradientButton>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-surface/50 px-2 text-muted">o</span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-sm text-[#b8a3ff]">
                ¿No tienes cuenta?{" "}
                <Link href="/register" className="text-[#8b6bff] hover:text-[#a68fff] font-semibold transition-colors">
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </FuturisticBackground>
  )
}
