<<<<<<< HEAD
import { Router } from 'express';
import * as EmployeeCtrl from '../controllers/employeeCtrl.js';

const router = Router();

router.get('/', EmployeeCtrl.list);               // GET /api/employees
router.get('/:id', EmployeeCtrl.getOne);          // GET /api/employees/:id
router.post('/', EmployeeCtrl.create);            // POST /api/employees
router.put('/:id', EmployeeCtrl.update);          // PUT /api/employees/:id
router.delete('/:id', EmployeeCtrl.remove);       // DELETE /api/employees/:id

export default router;
=======
import { Router } from 'express';
import * as EmployeeCtrl from '../controllers/employeeCtrl.js';

const router = Router();

router.get('/', EmployeeCtrl.list);               // GET /api/employees
router.get('/:id', EmployeeCtrl.getOne);          // GET /api/employees/:id
router.post('/', EmployeeCtrl.create);            // POST /api/employees
router.put('/:id', EmployeeCtrl.update);          // PUT /api/employees/:id
router.delete('/:id', EmployeeCtrl.remove);       // DELETE /api/employees/:id

export default router;
>>>>>>> 2845e41692162b969f30320f9c10272d966a8b14
