// src/controllers/admin.controller.js
/*  Ce fichier ne fait qu’exposer les fonctions déjà écrites
    dans analytics.controller.js.  Ça nous permet d’appliquer
    le middleware d’autorisation uniquement aux routes admin. */

import * as analytics from './analytics.controller.js';

/* ----- INDICATEURS GLOBAUX ----- */
export const getTotalRevenue            = analytics.getTotalRevenue;
export const getTotalSalesCount        = analytics.getTotalSalesCount;
export const getAverageTicket          = analytics.getAverageTicket;
export const getTotalDiscount          = analytics.getTotalDiscount;
export const getRevenueByPayment       = analytics.getRevenueByPayment;

/* ----- SUPERMARCHÉ & QUARTIER ----- */
export const getTopStoreByRevenue      = analytics.getTopStoreByRevenue;
export const getTopQuartierBySales     = analytics.getTopQuartierBySales;
export const getAverageTicketByStore   = analytics.getAverageTicketByStore;
export const getPeakHourByStore        = analytics.getPeakHourByStore;
export const getAverageDiscountByStore = analytics.getAverageDiscountByStore;

/* ----- CATÉGORIES & PRODUITS ----- */
export const getRevenueByCategory          = analytics.getRevenueByCategory;
export const getTopProductsByQuantity      = analytics.getTopProductsByQuantity;
export const getTopProductsByRevenue       = analytics.getTopProductsByRevenue;
export const getAvgUnitPriceByCategory     = analytics.getAvgUnitPriceByCategory;
export const getProductsWithHighestDiscount = analytics.getProductsWithHighestDiscount;

/* ----- CAISSIERS & CAISSES ----- */
export const getTopCashierBySales          = analytics.getTopCashierBySales;
export const getTopRegisterBySales         = analytics.getTopRegisterBySales;
export const getAverageTicketByCashier     = analytics.getAverageTicketByCashier;
export const getCashiersAboveAvgDiscount   = analytics.getCashiersAboveAvgDiscount;

/* ----- ANALYSE TEMPORELLE ----- */
export const getSalesPerHour               = analytics.getSalesPerHour;
export const getPeakHourOverall            = analytics.getPeakHourOverall;
export const getRevenueByPaymentPerHour    = analytics.getRevenueByPaymentPerHour;

/* ----- CLIENTS & COMPORTEMENTS ----- */
export const getClientIdentificationRate   = analytics.getClientIdentificationRate;
export const getTopClientsBySpending       = analytics.getTopClientsBySpending;
export const getRevenueHeatmapStorePayment = analytics.getRevenueHeatmapStorePayment;
