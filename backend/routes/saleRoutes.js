import { Router } from 'express';
import * as SaleCtrl from '../controllers/saleCtrl.js';

const router = Router();

router.get('/', SaleCtrl.list);               // ?period=day|month|year
router.get('/:id', SaleCtrl.getOne);
router.post('/', SaleCtrl.create);            // depuis le POS

export default router;
