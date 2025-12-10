import { Router } from 'express';

import userRoutes from './user.routes.js';
import operatorRoutes from './operator.routes.js';
import internalRoutes from './internal.routes.js';
import healthRoutes from './health.routes.js';
import medRoutes from './med.routes.js';
import feesRoutes from './fees.routes.js';
import adminUserRoutes from './admin.user.routes.js';
import adminMaintenanceRoutes from './admin.maintenance.routes.js';
import adminProviderRoutes from './admin.provider.routes.js';
import publicMaintenanceRoutes from './public.maintenance.routes.js';
import beneficiariesRoutes from './beneficiaries.routes.js';

const router = Router();

router.use('/api', feesRoutes);
router.use('/api', userRoutes);
router.use('/api', operatorRoutes);

router.use('/api', medRoutes);

router.use('/api', adminUserRoutes);
router.use('/api', adminMaintenanceRoutes);
router.use('/api', adminProviderRoutes);
router.use('/api', publicMaintenanceRoutes);
router.use('/api', beneficiariesRoutes);

router.use('/api/internal', internalRoutes);

router.use('/', healthRoutes);

export default router;
