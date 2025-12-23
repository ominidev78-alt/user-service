import { HttpError } from '../core/HttpError.js';
import { authService } from '../app.js';

/**
 * Middleware to require 2FA verification for protected operations
 * Expects 2FA code in req.body.code or req.body.recoveryCode
 */
export async function require2FA(req, res, next) {
  try {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) {
      throw new HttpError(401, 'Unauthorized');
    }

    // Get code from body
    const code = req.body.code;
    const recoveryCode = req.body.recoveryCode;

    if (!code && !recoveryCode) {
      // First, check if 2FA is even enabled for this user
      try {
        const statusResp = await authService.get('/api/2fa/status', {
          headers: { Authorization: req.headers.authorization }
        });
        
        if (statusResp.data && statusResp.data.enabled) {
          throw new HttpError(400, 'TwoFactorCodeRequired', {
            message: 'Código 2FA é obrigatório (code ou recoveryCode)',
          });
        }
        // If not enabled, we can proceed
        return next();
      } catch (err) {
        if (err.response?.status === 401) throw new HttpError(401, 'Unauthorized');
        if (err instanceof HttpError) throw err;
        // If we can't check status, assume it might be required if it's a sensitive route
        throw new HttpError(400, 'TwoFactorCodeRequired', {
          message: 'Código 2FA é obrigatório.',
        });
      }
    }

    // Verify code via auth-service
    try {
      const endpoint = recoveryCode ? '/api/2fa/verify-recovery' : '/api/2fa/verify';
      const payload = recoveryCode ? { code: recoveryCode } : { code };

      const verifyResp = await authService.post(endpoint, payload, {
        headers: { Authorization: req.headers.authorization }
      });

      if (verifyResp.data && verifyResp.data.ok) {
        // Remove code from body to prevent logging
        delete req.body.code;
        delete req.body.recoveryCode;
        return next();
      } else {
        throw new HttpError(400, 'InvalidCode', {
          message: 'Código 2FA inválido',
        });
      }
    } catch (err) {
      const status = err.response?.status || 500;
      const data = err.response?.data || {};

      if (status === 423) {
        throw new HttpError(423, 'TwoFactorLocked', {
          message: data.message || '2FA bloqueado temporariamente.',
        });
      }
      
      throw new HttpError(status === 401 ? 401 : 400, data.error || 'InvalidCode', {
        message: data.message || 'Erro ao verificar código 2FA.',
        attemptsRemaining: data.attemptsRemaining
      });
    }
  } catch (err) {
    return next(err);
  }
}
