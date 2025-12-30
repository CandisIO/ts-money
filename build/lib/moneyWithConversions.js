"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoneyWithConversion = void 0;
const money_1 = require("./money");
class MoneyWithConversion extends money_1.Money {
    constructor({ amount, base, exchangeRate, exchangeRateDate, }) {
        super(amount.getAmount(), amount.getCurrency());
        this.base = base;
        this.exchangeRate = exchangeRate;
        this.exchangeRateDate = exchangeRateDate;
    }
}
exports.MoneyWithConversion = MoneyWithConversion;
