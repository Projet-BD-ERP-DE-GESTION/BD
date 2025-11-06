<<<<<<< HEAD
import { Router } from 'express';
import * as ProductCtrl from '../controllers/productCtrl.js';

const router = Router();

router.get('/', ProductCtrl.list);
router.get('/:id', ProductCtrl.getOne);
router.post('/', ProductCtrl.create);
router.put('/:id', ProductCtrl.update);
router.delete('/:id', ProductCtrl.remove);

export default router;
=======
import { Router } from 'express';
import * as ProductCtrl from '../controllers/productCtrl.js';

const router = Router();

router.get('/', ProductCtrl.list);
router.get('/:id', ProductCtrl.getOne);
router.post('/', ProductCtrl.create);
router.put('/:id', ProductCtrl.update);
router.delete('/:id', ProductCtrl.remove);

export default router;
>>>>>>> 2845e41692162b969f30320f9c10272d966a8b14
