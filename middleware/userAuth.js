import axios from 'axios'

/**
 * Middleware de autenticação do usuário via AUTH-SERVICE
 *
 * O user-service NÃO valida JWT sozinho.
 * Quem valida é o auth-service:
 *
 *  GET https://auth-service.omnigateway.site/api/auth/validate-user
 *
 * Este middleware simplesmente:
 *  - pega o token do header
 *  - envia para o auth-service validar
 *  - recebe userId e dados do usuário.
 */

export async function userAuth(req, res, next) {
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
      'https://auth-service.omnigateway.site/api/auth/validate-user',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (!response.data?.ok) {
      return res.status(403).json({
        ok: false,
        error: 'Forbidden'
      })
    }

    req.user = response.data.user
    next()

  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data)
    }

    return res.status(500).json({
      ok: false,
      error: 'UserAuthError',
      detail: err.message
    })
  }
}
