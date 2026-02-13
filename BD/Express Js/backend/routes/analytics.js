// src/routes/analytics.js
import { Router } from 'express';
import * as ctrl from '../controllers/analytics.controller.js';

const router = Router();

/* ==================== Indicateurs globaux ==================== */
router.get('/revenue/total',            ctrl.getTotalRevenue);
router.get('/sales/count',              ctrl.getTotalSalesCount);
router.get('/ticket/average',           ctrl.getAverageTicket);
router.get('/discount/total',           ctrl.getTotalDiscount);
router.get('/revenue/by-payment',       ctrl.getRevenueByPayment);

/* ==================== Supermarché & Quartier ==================== */
router.get('/store/top-revenue',        ctrl.getTopStoreByRevenue);
router.get('/quartier/top-sales',       ctrl.getTopQuartierBySales);
router.get('/store/average-ticket',    ctrl.getAverageTicketByStore);
router.get('/store/peak-hour',          ctrl.getPeakHourByStore);
router.get('/store/average-discount',  ctrl.getAverageDiscountByStore);

/* ==================== Catégories & Produits ==================== */
router.get('/category/revenue',        ctrl.getRevenueByCategory);
router.get('/product/top-quantity',    ctrl.getTopProductsByQuantity);
router.get('/product/top-revenue',     ctrl.getTopProductsByRevenue);
router.get('/category/avg-price',      ctrl.getAvgUnitPriceByCategory);
router.get('/product/high-discount',   ctrl.getProductsWithHighestDiscount);

/* ==================== Caissiers & Caisses ==================== */
router.get('/cashier/top-sales',       ctrl.getTopCashierBySales);
router.get('/register/top-sales',      ctrl.getTopRegisterBySales);
router.get('/cashier/average-ticket',  ctrl.getAverageTicketByCashier);
router.get('/cashier/above-avg-discount', ctrl.getCashiersAboveAvgDiscount);

/* ==================== Analyse temporelle ==================== */
router.get('/sales/per-hour',          ctrl.getSalesPerHour);
router.get('/sales/peak-hour',         ctrl.getPeakHourOverall);
router.get('/revenue/payment-per-hour', ctrl.getRevenueByPaymentPerHour);

/* ==================== Clients & comportements ==================== */
router.get('/clients/identification-rate', ctrl.getClientIdentificationRate);
router.get('/clients/top-spending',    ctrl.getTopClientsBySpending);
router.get('/heatmap/store-payment',   ctrl.getRevenueHeatmapStorePayment);

export default router;
