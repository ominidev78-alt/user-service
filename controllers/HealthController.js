export class HealthController {
  async health(req, res) {
    return res.json({ ok: true, service: 'user-service' });
  }
}

export const healthController = new HealthController();
