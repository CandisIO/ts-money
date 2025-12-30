"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Money = void 0;
const lodash_1 = require("lodash");
const currencies_1 = require("./currencies");
const isInt = (n) => {
    return Number(n) === n && n % 1 === 0;
};
const decimalPlaces = (num) => {
    const match = ("" + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
    if (!match)
        return 0;
    return Math.max(0, (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0));
};
const assertSameCurrency = (left, right) => {
    if (left.currency !== right.currency) {
        throw new Error("Different currencies");
    }
};
const assertType = (other) => {
    if (!(other instanceof Money)) {
        throw new TypeError("Instance of Money required");
    }
};
const assertOperand = (operand) => {
    if ((0, lodash_1.isNaN)(parseFloat(operand.toString())) && !isFinite(operand))
        throw new TypeError("Operand must be a number");
};
const getCurrencyObject = (currency) => {
    const currencyObj = currencies_1.Currencies[currency];
    if (currencyObj) {
        return currencyObj;
    }
    for (const key in currencies_1.Currencies) {
        if (key.toUpperCase() === currency.toUpperCase()) {
            return currencies_1.Currencies[key];
        }
    }
    throw new TypeError("Invalid currency");
};
const isAmountObject = (amount) => (0, lodash_1.isObject)(amount);
class Money {
    constructor(amount, currency) {
        const currencyObj = (0, lodash_1.isString)(currency)
            ? getCurrencyObject(currency)
            : currency;
        if (!currencyObj || !(0, lodash_1.isPlainObject)(currencyObj)) {
            throw new TypeError("Invalid currency");
        }
        if (!isInt(amount)) {
            throw new TypeError("Amount must be an integer");
        }
        this.amount = amount;
        this.currency = currencyObj.code;
    }
    static fromInteger(amount, currency) {
        if (isAmountObject(amount)) {
            if (amount.amount === undefined || amount.currency === undefined)
                throw new TypeError("Missing required parameters amount,currency");
            currency = amount.currency;
            amount = amount.amount;
        }
        if (!isInt(amount)) {
            throw new TypeError("Amount must be an integer value");
        }
        if (!currency) {
            throw new TypeError("Invalid currency");
        }
        return new Money(amount, currency);
    }
    static fromDecimal(amount, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currency, rounder) {
        if (isAmountObject(amount)) {
            if (amount.amount === undefined || amount.currency === undefined)
                throw new TypeError("Missing required parameters amount,currency");
            currency = amount.currency;
            amount = amount.amount;
        }
        if ((0, lodash_1.isString)(currency))
            currency = getCurrencyObject(currency);
        if (!(0, lodash_1.isPlainObject)(currency))
            throw new TypeError("Invalid currency");
        if (rounder === undefined) {
            const decimals = decimalPlaces(amount);
            if (decimals > currency.decimal_digits)
                throw new Error(`The currency ${currency.code} supports only` +
                    ` ${currency.decimal_digits} decimal digits`);
            rounder = Math.round;
        }
        else {
            if (["round", "floor", "ceil"].indexOf(rounder) === -1 &&
                typeof rounder !== "function")
                throw new TypeError("Invalid parameter rounder");
            if ((0, lodash_1.isString)(rounder))
                rounder = Math[rounder];
        }
        const precisionMultiplier = Math.pow(10, currency.decimal_digits);
        let resultAmount = amount * precisionMultiplier;
        resultAmount = rounder(resultAmount);
        return new Money(resultAmount, currency);
    }
    /**
     * Returns true if the two instances of Money are equal, false otherwise.
     *
     * @param {Money} other
     * @returns {Boolean}
     */
    equals(other) {
        assertType(other);
        return this.amount === other.amount && this.currency === other.currency;
    }
    /**
     * Adds the two objects together creating a new Money instance that holds the result of the operation.
     *
     * @param {Money} other
     * @returns {Money}
     */
    add(other) {
        assertType(other);
        assertSameCurrency(this, other);
        return new Money(this.amount + other.amount, this.currency);
    }
    /**
     * Subtracts the two objects creating a new Money instance that holds the result of the operation.
     *
     * @param {Money} other
     * @returns {Money}
     */
    subtract(other) {
        assertType(other);
        assertSameCurrency(this, other);
        return new Money(this.amount - other.amount, this.currency);
    }
    multiply(multiplier, fn) {
        if (!(0, lodash_1.isFunction)(fn))
            fn = Math.round;
        assertOperand(multiplier);
        const amount = fn(this.amount * multiplier);
        return new Money(amount, this.currency);
    }
    divide(divisor, fn) {
        if (!(0, lodash_1.isFunction)(fn))
            fn = Math.round;
        assertOperand(divisor);
        const amount = fn(this.amount / divisor);
        return new Money(amount, this.currency);
    }
    allocate(ratios) {
        const results = [];
        let total = 0;
        ratios.forEach(function (ratio) {
            total += ratio;
        });
        let remainder = this.amount;
        const amount = this.amount;
        const currency = this.currency;
        ratios.forEach(function (ratio) {
            const share = Math.floor((amount * ratio) / total);
            results.push(new Money(share, currency));
            remainder -= share;
        });
        for (let i = 0; remainder > 0; i++) {
            results[i] = new Money(results[i].amount + 1, results[i].currency);
            remainder--;
        }
        return results;
    }
    compare(other) {
        assertType(other);
        assertSameCurrency(this, other);
        if (this.amount === other.amount)
            return 0;
        return this.amount > other.amount ? 1 : -1;
    }
    greaterThan(other) {
        return 1 === this.compare(other);
    }
    greaterThanOrEqual(other) {
        return 0 <= this.compare(other);
    }
    lessThan(other) {
        return -1 === this.compare(other);
    }
    lessThanOrEqual(other) {
        return 0 >= this.compare(other);
    }
    isZero() {
        return this.amount === 0;
    }
    isPositive() {
        return this.amount > 0;
    }
    isNegative() {
        return this.amount < 0;
    }
    toDecimal() {
        return Number(this.toString());
    }
    toString() {
        const currency = getCurrencyObject(this.currency);
        return (this.amount / Math.pow(10, currency.decimal_digits)).toFixed(currency.decimal_digits);
    }
    toJSON() {
        return {
            amount: this.amount,
            currency: this.currency,
        };
    }
    getAmount() {
        return this.amount;
    }
    getCurrency() {
        return this.currency;
    }
    getCurrencyInfo() {
        return getCurrencyObject(this.currency);
    }
}
exports.Money = Money;
