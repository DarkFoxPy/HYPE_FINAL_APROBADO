"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuthStore } from "@/lib/stores/auth-store"
import { GradientButton } from "@/components/ui/gradient-button"
import { GlassCard } from "@/components/ui/glass-card"
import { FuturisticBackground } from "@/components/futuristic-background"
import { Mail, Lock, User, AtSign, Sparkles, Building2, FileText, Briefcase, Upload } from "lucide-react"
import toast from "react-hot-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [accountType, setAccountType] = useState<"attendee" | "organizer">("organizer")
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    ruc: "",
    businessSector: "",
  })

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePicture(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden")
      return
    }

    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres")
      return
    }

    if (accountType === "organizer") {
      if (!formData.companyName || !formData.ruc || !formData.businessSector) {
        toast.error("Por favor completa todos los campos de empresa")
        return
      }
    }

    setLoading(true)

    try {
      await register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        roleName: accountType, // Cambiamos 'role' por 'roleName' para que coincida con la API
        companyName: accountType === "organizer" ? formData.companyName : "",
        ruc: accountType === "organizer" ? formData.ruc : "",
        businessSector: accountType === "organizer" ? formData.businessSector : "",
      })
      toast.success("¡Cuenta creada! Por favor verifica tu email.")
      router.push("/login")
    } catch (error) {
      toast.error("Error al crear la cuenta. El email puede estar en uso.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <FuturisticBackground>
      <div className="min-h-screen flex items-center justify-center p-4 relative">
        <div className="w-full max-w-2xl relative z-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#f1c6ff] to-[#ffddff] glow-secondary mb-4 animate-float">
              <Sparkles className="w-10 h-10 text-[#1e1732]" />
            </div>
            <h1 className="text-4xl font-bold gradient-text mb-2">HYPE</h1>
            <p className="text-[#e2e2e2]">Crea tu cuenta y comienza</p>
          </div>

          {/* Register Form */}
          <GlassCard className="space-y-6" glow="secondary">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#ffddff] mb-2">Crear Cuenta</h2>
              <p className="text-sm text-[#e2e2e2]">Únete a la revolución de eventos 3D</p>
            </div>

          

            {/* Profile Picture Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#ffddff]">Foto de Perfil (Opcional)</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-[#1e1732]/50 border-2 border-[#f1c6ff]/20 flex items-center justify-center overflow-hidden">
                  {profilePicture ? (
                    <img
                      src={profilePicture || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-[#78767b]" />
                  )}
                </div>
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#f1c6ff]/20 bg-[#1e1732]/50 hover:bg-[#f1c6ff]/10 transition-all">
                    <Upload className="w-4 h-4 text-[#f1c6ff]" />
                    <span className="text-sm text-[#ffddff]">Subir Imagen</span>
                  </div>
                  <input type="file" accept="image/*" onChange={handleProfilePictureChange} className="hidden" />
                </label>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#ffddff]">Nombre Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#78767b]" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-[#1e1732]/50 border border-[#f1c6ff]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f1c6ff]/50 focus:border-[#f1c6ff] transition-all text-[#ffddff] placeholder:text-[#78767b]"
                    placeholder="Juan Pérez"
                  />
                </div>
              </div>

              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#ffddff]">Usuario</label>
                <div className="relative">
                  <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#78767b]" />
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/\s/g, "") })
                    }
                    className="w-full pl-10 pr-4 py-3 bg-[#1e1732]/50 border border-[#f1c6ff]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f1c6ff]/50 focus:border-[#f1c6ff] transition-all text-[#ffddff] placeholder:text-[#78767b]"
                    placeholder="juanperez"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#ffddff]">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#78767b]" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-[#1e1732]/50 border border-[#f1c6ff]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f1c6ff]/50 focus:border-[#f1c6ff] transition-all text-[#ffddff] placeholder:text-[#78767b]"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              {/* Coordinator-specific fields */}
              {accountType === "organizer" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#ffddff]">Nombre de Empresa</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#78767b]" />
                      <input
                        type="text"
                        required
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 bg-[#1e1732]/50 border border-[#f1c6ff]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f1c6ff]/50 focus:border-[#f1c6ff] transition-all text-[#ffddff] placeholder:text-[#78767b]"
                        placeholder="Mi Empresa S.A."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#ffddff]">RUC</label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#78767b]" />
                        <input
                          type="text"
                          required
                          value={formData.ruc}
                          onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                          className="w-full pl-10 pr-4 py-3 bg-[#1e1732]/50 border border-[#f1c6ff]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f1c6ff]/50 focus:border-[#f1c6ff] transition-all text-[#ffddff] placeholder:text-[#78767b]"
                          placeholder="20123456789"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#ffddff]">Sector</label>
                      <select
                        required
                        value={formData.businessSector}
                        onChange={(e) => setFormData({ ...formData, businessSector: e.target.value })}
                        className="w-full px-4 py-3 bg-[#1e1732]/50 border border-[#f1c6ff]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f1c6ff]/50 focus:border-[#f1c6ff] transition-all text-[#ffddff]"
                      >
                        <option value="">Seleccionar</option>
                        <option value="tecnologia">Tecnología</option>
                        <option value="entretenimiento">Entretenimiento</option>
                        <option value="educacion">Educación</option>
                        <option value="salud">Salud</option>
                        <option value="finanzas">Finanzas</option>
                        <option value="retail">Retail</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#ffddff]">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#78767b]" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-[#1e1732]/50 border border-[#f1c6ff]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f1c6ff]/50 focus:border-[#f1c6ff] transition-all text-[#ffddff] placeholder:text-[#78767b]"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#ffddff]">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#78767b]" />
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-[#1e1732]/50 border border-[#f1c6ff]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f1c6ff]/50 focus:border-[#f1c6ff] transition-all text-[#ffddff] placeholder:text-[#78767b]"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <GradientButton type="submit" variant="secondary" className="w-full" loading={loading} size="lg">
                Crear Cuenta
              </GradientButton>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#f1c6ff]/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#1e1732]/50 px-2 text-[#78767b]">o</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-[#e2e2e2]">
                ¿Ya tienes cuenta?{" "}
                <Link href="/login" className="text-[#f1c6ff] hover:text-[#ffddff] font-semibold transition-colors">
                  Inicia sesión
                </Link>
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </FuturisticBackground>
  )
}
