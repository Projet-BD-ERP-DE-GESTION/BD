import { Router } from 'express';
import * as ProductCtrl from '../controllers/productCtrl.js';

const router = Router();

router.get('/', ProductCtrl.list);
router.get('/:id', ProductCtrl.getOne);
router.post('/', ProductCtrl.create);
router.put('/:id', ProductCtrl.update);
router.delete('/:id', ProductCtrl.remove);

export default router;
