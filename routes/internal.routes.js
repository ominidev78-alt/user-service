import { Router } from 'express';
import { UserModel } from '../models/UserModel.js';

const router = Router();

/**
 * Internal endpoint to validate app_id/app_secret credentials
 * Used by other microservices for authentication
 */
router.post('/internal/validate-credentials', async (req, res) => {
  try {
    const { app_id, app_secret } = req.body;

    if (!app_id || !app_secret) {
      return res.status(400).json({
        ok: false,
        error: 'ValidationError',
        message: 'app_id e app_secret são obrigatórios.',
      });
    }

    // Find user by app_id
    const user = await UserModel.findByAppId(String(app_id));

    if (!user) {
      return res.status(401).json({
        ok: false,
        error: 'Unauthorized',
        message: 'app_id inválido.',
      });
    }

    // Verify app_secret
    const storedSecret = user.client_secret || user.app_secret_hash;
    if (storedSecret !== String(app_secret)) {
      return res.status(401).json({
        ok: false,
        error: 'Unauthorized',
        message: 'app_secret inválido.',
      });
    }

    // Return user data
    return res.json({
      ok: true,
      user: {
        id: user.id,
        app_id: user.app_id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (err) {
    console.error('[internal.routes] Error validating credentials:', err);
    return res.status(500).json({
      ok: false,
      error: 'InternalServerError',
      message: 'Erro ao validar credenciais.',
    });
  }
});

export default router;
