import { Router } from 'express';

import userRoutes from './user.routes.js';
import adminUserRoutes from './admin.user.routes.js';
import beneficiariesRoutes from './beneficiaries.routes.js';
import operatorRoutes from './operator.routes.js';
import adminProviderRoutes from './admin.provider.routes.js';
import publicMaintenanceRoutes from './public.maintenance.routes.js';
import adminMaintenanceRoutes from './admin.maintenance.routes.js';
import healthRoutes from './health.routes.js';
import internalRoutes from './internal.routes.js';

const router = Router();

router.use('/api', internalRoutes);
router.use('/api', userRoutes);
router.use('/api', adminUserRoutes);
router.use('/api', beneficiariesRoutes);
router.use('/api', operatorRoutes);
router.use('/api', adminProviderRoutes);
router.use('/api', publicMaintenanceRoutes);
router.use('/api', adminMaintenanceRoutes);
router.use('/', healthRoutes);

export default router;
