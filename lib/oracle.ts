import oracledb from "oracledb"

// Configuración de la conexión a la base de datos Oracle.
// Es una buena práctica usar variables de entorno para esta información.
const dbConfig = {
  user: process.env.ORACLE_USER,
  password: process.env.ORACLE_PASSWORD,
  connectString: process.env.ORACLE_CONNECTION_STRING,
}

/**
 * Establece y devuelve una conexión con la base de datos Oracle.
 */
export async function getConnection(): Promise<oracledb.Connection> {
  // Validar que las variables de entorno necesarias estén presentes y dar un error más específico.
  const missingVars: string[] = []

  if (!process.env.ORACLE_USER) missingVars.push("ORACLE_USER")
  if (!process.env.ORACLE_PASSWORD) missingVars.push("ORACLE_PASSWORD")
  if (!process.env.ORACLE_CONNECTION_STRING) missingVars.push("ORACLE_CONNECTION_STRING")

  if (missingVars.length > 0) {
    const errorMessage = `La configuración de la base de datos está incompleta. Faltan las siguientes variables de entorno en tu archivo .env.local: ${missingVars.join(", ")}`
    console.error(errorMessage)
    throw new Error(errorMessage)
  }

  try {
    const connection = await oracledb.getConnection(dbConfig)
    console.log("Conexión a la base de datos Oracle establecida correctamente.")
    return connection
  } catch (err) {
    console.error("Error al conectar con Oracle DB:", err)
    throw new Error("No se pudo conectar a la base de datos.")
  }
}