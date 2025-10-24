import { type NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/oracle"
import oracledb from "oracledb"
import bcrypt from "bcryptjs"
import { createSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  let connection: oracledb.Connection | undefined

  try {
    const { email, password } = await request.json()

    // Add debug logging
    console.log("Login attempt for email:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    connection = await getConnection()

    const result = await connection.execute<any>(
      `SELECT id, username, email, password_hash, full_name, role FROM users WHERE email = :email`,
      [email],
      { outFormat: oracledb.OUT_FORMAT_OBJECT } // Add explicit output format
    )

    if (!result.rows || result.rows.length === 0) {
      console.log("No user found for email:", email)
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    const user = result.rows[0]
    console.log("User found:", { ...user, PASSWORD_HASH: '***' }) // Log user data without password

    const isPasswordValid = await bcrypt.compare(password, user.PASSWORD_HASH)

    if (!isPasswordValid) {
      console.log("Invalid password for user:", email)
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // Crear la sesión usando el sistema JWT que ya tienes
    const sessionData = {
      userId: user.ID,
      email: user.EMAIL,
      role: user.ROLE,
    }

    await createSession(sessionData)

    // Devolver los datos del usuario al frontend para el store de Zustand
    const responseUser = {
      id: user.ID,
      email: user.EMAIL,
      role: user.ROLE,
      username: user.USERNAME,
      fullName: user.FULL_NAME,
    }

    console.log("Session created successfully for user:", email)
    return NextResponse.json({ user: responseUser })

  } catch (error: any) {
    console.error("Login error:", error.message)
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error.message 
    }, { status: 500 })
  } finally {
    if (connection) {
      try {
        await connection.close()
      } catch (err) {
        console.error("Error al cerrar la conexión:", err)
      }
    }
  }
}