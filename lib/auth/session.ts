import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import { getDb } from "@/lib/db/client"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"
const SESSION_COOKIE = "session"

export interface SessionData {
  userId: string
  email: string
  roles: string[]
}

export async function createSession(data: SessionData) {
  const token = jwt.sign(data, JWT_SECRET, { expiresIn: "7d" })
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function getSession(): Promise<SessionData | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(SESSION_COOKIE)?.value

    if (!token) return null

    const decoded = jwt.verify(token, JWT_SECRET) as SessionData
    return decoded
  } catch {
    return null
  }
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getUserFromRequest(request: NextRequest) {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value

    if (!token) return null

    const decoded = jwt.verify(token, JWT_SECRET) as SessionData

    // Get full user data from database
    const db = getDb()
    const user = db.prepare("SELECT * FROM profiles WHERE id = ?").get(decoded.userId) as any

    if (!user) return null

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
            roles: user.roles,
      avatar: user.avatar,
      bio: user.bio,
      companyName: user.company_name,
      ruc: user.ruc,
      businessSector: user.business_sector,
      website: user.website,
      linkedin: user.linkedin,
      twitter: user.twitter,
      instagram: user.instagram,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
    }
  } catch (error) {
    console.error("[v0] Error getting user from request:", error)
    return null
  }
}
