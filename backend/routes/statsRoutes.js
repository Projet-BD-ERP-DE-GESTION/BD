import { Router } from 'express';
import * as StatsCtrl from '../controllers/statsCtrl.js';

const router = Router();

router.get('/dashboard', StatsCtrl.dashboard);        // /api/stats/dashboard
router.get('/employees', StatsCtrl.employeePerf);    // /api/stats/employees
router.get('/departments', StatsCtrl.departmentPerf);// /api/stats/departments

export default router;
