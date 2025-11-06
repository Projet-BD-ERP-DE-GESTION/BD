import * as StatsModel from '../models/statsModel.js';

export const dashboard = async (req, res, next) => {
  try {
    const data = await StatsModel.getDashboardStats();
    res.json(data);
  } catch (e) { next(e); }
};

export const employeePerf = async (req, res, next) => {
  try {
    const data = await StatsModel.employeePerformance();
    res.json(data);
  } catch (e) { next(e); }
};

export const departmentPerf = async (req, res, next) => {
  try {
    const data = await StatsModel.departmentPerformance();
    res.json(data);
  } catch (e) { next(e); }
};
