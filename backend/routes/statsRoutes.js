<<<<<<< HEAD
import { Router } from 'express';
import * as StatsCtrl from '../controllers/statsCtrl.js';

const router = Router();

router.get('/dashboard', StatsCtrl.dashboard);        // /api/stats/dashboard
router.get('/employees', StatsCtrl.employeePerf);    // /api/stats/employees
router.get('/departments', StatsCtrl.departmentPerf);// /api/stats/departments

export default router;
=======
import { Router } from 'express';
import * as StatsCtrl from '../controllers/statsCtrl.js';

const router = Router();

router.get('/dashboard', StatsCtrl.dashboard);        // /api/stats/dashboard
router.get('/employees', StatsCtrl.employeePerf);    // /api/stats/employees
router.get('/departments', StatsCtrl.departmentPerf);// /api/stats/departments

export default router;
>>>>>>> 2845e41692162b969f30320f9c10272d966a8b14
