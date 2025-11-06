<<<<<<< HEAD
import { Router } from 'express';
import * as SaleCtrl from '../controllers/saleCtrl.js';

const router = Router();

router.get('/', SaleCtrl.list);               // ?period=day|month|year
router.get('/:id', SaleCtrl.getOne);
router.post('/', SaleCtrl.create);            // depuis le POS

export default router;
=======
import { Router } from 'express';
import * as SaleCtrl from '../controllers/saleCtrl.js';

const router = Router();

router.get('/', SaleCtrl.list);               // ?period=day|month|year
router.get('/:id', SaleCtrl.getOne);
router.post('/', SaleCtrl.create);            // depuis le POS

export default router;
>>>>>>> 2845e41692162b969f30320f9c10272d966a8b14
