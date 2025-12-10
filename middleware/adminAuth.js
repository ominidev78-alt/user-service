import axios from 'axios'

/**
 * Middleware de autenticação de administradores via AUTH-SERVICE
 *
 * Este middleware valida o token JWT do admin chamando o endpoint:
 *   GET https://auth-service.omnigateway.site/api/auth/validate-admin
 *
 * O AUTH-SERVICE é o responsável pela validação das permissões,
 * verificando:
 *   - Token válido
 *   - Token não expirado
 *   - Role = ADMIN
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

    console.error('[adminAuth] Unexpected error:', err.message)

    return res.status(500).json({
      ok: false,
      error: 'AdminAuthError',
      detail: err.message
    })
  }
}
