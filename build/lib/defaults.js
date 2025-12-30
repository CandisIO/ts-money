"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CURRENCY = exports.DEFAULT_CURRENCY_CODE = void 0;
const currencies_1 = require("./currencies");
const currencyCode_1 = require("./currencyCode");
exports.DEFAULT_CURRENCY_CODE = currencyCode_1.CurrencyCode.Eur;
exports.DEFAULT_CURRENCY = currencies_1.Currencies[exports.DEFAULT_CURRENCY_CODE];
