import { Router }  from 'express';
import * as SupplierCtrl from '../controllers/supplierCtrl.js';

const router = Router();

router.get('/', SupplierCtrl.list);
router.get('/:id', SupplierCtrl.getOne);
router.post('/', SupplierCtrl.create);
router.put('/:id', SupplierCtrl.update);
router.delete('/:id', SupplierCtrl.remove);

export default router;
