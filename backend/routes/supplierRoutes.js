<<<<<<< HEAD
import { Router }  from 'express';
import * as SupplierCtrl from '../controllers/supplierCtrl.js';

const router = Router();

router.get('/', SupplierCtrl.list);
router.get('/:id', SupplierCtrl.getOne);
router.post('/', SupplierCtrl.create);
router.put('/:id', SupplierCtrl.update);
router.delete('/:id', SupplierCtrl.remove);

export default router;
=======
import { Router }  from 'express';
import * as SupplierCtrl from '../controllers/supplierCtrl.js';

const router = Router();

router.get('/', SupplierCtrl.list);
router.get('/:id', SupplierCtrl.getOne);
router.post('/', SupplierCtrl.create);
router.put('/:id', SupplierCtrl.update);
router.delete('/:id', SupplierCtrl.remove);

export default router;
>>>>>>> 2845e41692162b969f30320f9c10272d966a8b14
