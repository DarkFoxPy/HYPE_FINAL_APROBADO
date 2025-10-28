import { NextResponse } from "next/server"
import { getConnection } from "@/lib/oracle"
import oracledb from "oracledb"
import bcrypt from "bcryptjs"
import { createSession } from "@/lib/auth/session"

export async function POST(request: { json: () => Promise<any> }) {
  let connection: oracledb.Connection | undefined

  try {
    const { email, password } = await request.json()

    console.log("Login attempt for email:", email)

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    connection = await getConnection()

    // 1. LLAMADA AL PROCEDIMIENTO ALMACENADO CORRECTO
    // En lugar de un SELECT directo, llamamos al paquete que creamos.
    const result = await connection.execute<{ cursor: oracledb.ResultSet<any> }>(
      `BEGIN auth_pkg.get_user_for_login(:email, :cursor); END;`,
      {
        email,
        cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
      },
    )

    // 2. OBTENER LOS DATOS DEL CURSOR
    const resultSet = result.outBinds.cursor
    const userRow = await resultSet.getRow()
    await resultSet.close()

    if (!userRow) {
      console.log("No user found for email:", email)
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // 3. MAPEAR LOS DATOS DEL USUARIO
    // El procedimiento devuelve los roles como una cadena separada por comas.
    const user = {
      ID: userRow[0],
      USERNAME: userRow[1],
      EMAIL: userRow[2],
      PASSWORD_HASH: userRow[3],
      FULL_NAME: userRow[4],
      AVATAR_URL: userRow[5],
      // Convertimos la cadena de roles en un array
      ROLES: userRow[6] ? userRow[6].split(",") : [],
    }

    // --- NUEVA VALIDACIÓN ---
    // Si el usuario no tiene roles, se le niega el acceso.
    if (user.ROLES.length === 0) {
      console.log(`Login failed for user ${email}: No roles assigned.`)
      return NextResponse.json(
        { error: "No posee acceso al sistema. Contacte al administrador." },
        { status: 403 }, // 403 Forbidden es más apropiado que 401
      )
    }

    console.log("User found:", { ...user, PASSWORD_HASH: "***" })

    const isPasswordValid = await bcrypt.compare(password, user.PASSWORD_HASH)

    if (!isPasswordValid) {
      console.log("Invalid password for user:", email)
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    // 4. CREAR LA SESIÓN CON LOS ROLES
    // Pasamos el array de roles a la sesión.
    const sessionData = {
      userId: user.ID,
      email: user.EMAIL,
      roles: user.ROLES,
    }
    await createSession(sessionData)

    // Devolver los datos del usuario al frontend
    const responseUser = {
      id: user.ID,
      email: user.EMAIL,
      roles: user.ROLES,
      username: user.USERNAME,
      fullName: user.FULL_NAME,
    }

    console.log("Session created successfully for user:", email)
    return NextResponse.json({ user: responseUser })
  } catch (error: any) {
    console.error("Login error:", error.message, error.stack)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error.message,
      },
      { status: 500 },
    )
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
