import axios from 'axios'

/**
 * Middleware de autenticação de administradores via AUTH-SERVICE
 *
 * O user-service não valida JWT diretamente.
 * A validação de token e permissão é 100% responsabilidade do auth-service.
 *
 * Endpoint chamado:
 *   GET https://auth-service.omnigateway.site/api/auth/validate-admin
 *
 * O auth-service deve retornar:
 *   {
 *     ok: true,
 *     admin: {
 *       id: number,
 *       email: string,
 *       role: "ADMIN"
 *     }
 *   }
 */

export async function adminAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      return res.status(401).json({
        ok: false,
        error: 'MissingAuthorizationHeader'
      })
    }

    const token = authHeader.replace('Bearer ', '').trim()

    if (!token) {
      return res.status(401).json({
        ok: false,
        error: 'InvalidToken'
      })
    }

   
    const response = await axios.get(
      'https://auth-service.omnigateway.site/api/auth/validate-admin',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )


    if (!response.data?.ok) {
      return res.status(403).json({
        ok: false,
        error: 'Forbidden',
        detail: 'Admin permission required'
      })
    }

    
    req.admin = response.data.admin
    next()

  } catch (err) {
    
    if (err.response) {
      return res.status(err.response.status).json(err.response.data)
    }

    return res.status(500).json({
      ok: false,
      error: 'AdminAuthError',
      detail: err.message
    })
  }
}
