import { Router } from 'express';
import { userAuth } from '../middleware/userAuth.js';
import BeneficiaryController from '../controllers/BeneficiaryController.js';

const router = Router();

router.post('/users/:id/beneficiaries', userAuth, BeneficiaryController.create);
router.get('/users/:id/beneficiaries', userAuth, BeneficiaryController.list);
router.delete('/users/:id/beneficiaries/:beneficiaryId', userAuth, BeneficiaryController.remove);
router.put('/users/:id/beneficiaries/:beneficiaryId', userAuth, BeneficiaryController.update);
router.patch('/users/:id/beneficiaries/:beneficiaryId', userAuth, BeneficiaryController.update);

router.post('/beneficiaries', userAuth, BeneficiaryController.create);
router.get('/beneficiaries', userAuth, BeneficiaryController.list);
router.delete('/beneficiaries/:beneficiaryId', userAuth, BeneficiaryController.remove);
router.put('/beneficiaries/:beneficiaryId', userAuth, BeneficiaryController.update);
router.patch('/beneficiaries/:beneficiaryId', userAuth, BeneficiaryController.update);

router.post('/beneficiaries-public', BeneficiaryController.create);
router.get('/beneficiaries-public', BeneficiaryController.list);
router.delete('/beneficiaries-public/:beneficiaryId', BeneficiaryController.remove);
router.put('/beneficiaries-public/:beneficiaryId', BeneficiaryController.update);
router.patch('/beneficiaries-public/:beneficiaryId', BeneficiaryController.update);

export default router;
