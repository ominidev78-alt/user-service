import { Router } from 'express';
import BeneficiaryController from '../controllers/BeneficiaryController.js';
import { userAuth } from '../middlewares/userAuth.js';
// Rotas em formato semelhante ao ledger: /api/users/:id/... e rotas autenticadas sem :id

const router = Router();

// Pix Favorecidos
// Compatibilidade com ledger (passa :id na URL)
router.post('/users/:id/beneficiaries', BeneficiaryController.create);
router.get('/users/:id/beneficiaries', BeneficiaryController.list);
router.delete('/users/:id/beneficiaries/:beneficiaryId', BeneficiaryController.remove);
router.put('/users/:id/beneficiaries/:beneficiaryId', BeneficiaryController.update);
router.patch('/users/:id/beneficiaries/:beneficiaryId', BeneficiaryController.update);

// Rotas autenticadas sem :id (usa req.user.id do JWT)
router.post('/beneficiaries', userAuth, BeneficiaryController.create);
router.get('/beneficiaries', userAuth, BeneficiaryController.list);
router.delete('/beneficiaries/:beneficiaryId', userAuth, BeneficiaryController.remove);
router.put('/beneficiaries/:beneficiaryId', userAuth, BeneficiaryController.update);
router.patch('/beneficiaries/:beneficiaryId', userAuth, BeneficiaryController.update);

// Rotas públicas baseadas em userId via query/header (sem exigir JWT)
router.post('/beneficiaries-public', BeneficiaryController.create);
router.get('/beneficiaries-public', BeneficiaryController.list);
router.delete('/beneficiaries-public/:beneficiaryId', BeneficiaryController.remove);
router.put('/beneficiaries-public/:beneficiaryId', BeneficiaryController.update);
router.patch('/beneficiaries-public/:beneficiaryId', BeneficiaryController.update);

export default router;
