import { type NextRequest, NextResponse } from "next/server"
import { getConnection } from "@/lib/oracle"
import oracledb from "oracledb"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  let connection: oracledb.Connection | undefined

  try {
    const {
      email,
      password,
      name: fullName,
      username,
      role: roleName, // Renombramos para claridad, ej: 'organizer'
      companyName,
      ruc,
      businessSector,
    } = await request.json()

    // Validación de entrada básica
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email || !password || !username || !fullName || !roleName) {
      return NextResponse.json(
        { error: "Email, password, username, fullName y role son requeridos." },
        { status: 400 },
      )
    }

    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "El formato del email no es válido." }, { status: 400 })
    }

    // Validación de contraseña más robusta
    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres." },
        { status: 400 },
      )
    }

    // Hashear la contraseña antes de guardarla
    const passwordHash = await bcrypt.hash(password, 10)

    connection = await getConnection()

    // Usamos el procedimiento almacenado del paquete auth_pkg
    const sql = `BEGIN auth_pkg.register_user(:username, :email, :passwordHash, :fullName, :roleName, :new_user_id); END;`

    // Insertar el nuevo usuario y obtener el ID generado
    const result = await connection.execute<{ new_user_id: number[] }>(
      sql,
      {
        username,
        email,
        passwordHash,
        fullName,
        roleName,
        new_user_id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
      },
      { autoCommit: true },
    )

    if (!result.outBinds || !result.outBinds.new_user_id) {
      throw new Error("No se pudo obtener el ID del nuevo usuario.")
    }

    const newUserId = result.outBinds.new_user_id[0]

    const newUser = {
      id: newUserId,
      username,
      email,
      fullName,
      roles: [roleName], // Devolvemos un array de roles
    }

    return NextResponse.json({ user: newUser }, { status: 201 })
  } catch (error: any) {
    // Manejo de errores específico para Oracle
    if (error.errorNum === 1) {
      // ORA-00001: unique constraint violated
      const message = error.message.toLowerCase()
      if (message.includes("users_email_uk")) {
        return NextResponse.json({ error: "El email ya está en uso." }, { status: 409 })
      }
      if (message.includes("users_username_uk")) {
        return NextResponse.json({ error: "El nombre de usuario ya está en uso." }, { status: 409 })
      }
      return NextResponse.json({ error: "El email o el nombre de usuario ya existen." }, { status: 409 })
    }

    console.error("Error en el registro:", error)
    return NextResponse.json({ error: "Error interno del servidor", details: error.message }, { status: 500 })
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
