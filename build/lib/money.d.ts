import { Currency } from "./currency";
type MathFunction = (num: number) => number;
type Rounder = "round" | "floor" | "ceil" | MathFunction;
interface Amount {
    amount: number;
    currency: string | Currency;
}
declare class Money {
    amount: number;
    currency: string;
    constructor(amount: number, currency: Currency | string);
    static fromInteger(amount: Amount): Money;
    static fromInteger(amount: number, currency: Currency | string): Money;
    static fromDecimal(amount: Amount, rounder?: MathFunction): Money;
    static fromDecimal(amount: number, currency: string | Currency, rounder?: Rounder): Money;
    /**
     * Returns true if the two instances of Money are equal, false otherwise.
     *
     * @param {Money} other
     * @returns {Boolean}
     */
    equals(other: Money): boolean;
    /**
     * Adds the two objects together creating a new Money instance that holds the result of the operation.
     *
     * @param {Money} other
     * @returns {Money}
     */
    add(other: Money): Money;
    /**
     * Subtracts the two objects creating a new Money instance that holds the result of the operation.
     *
     * @param {Money} other
     * @returns {Money}
     */
    subtract(other: Money): Money;
    multiply(multiplier: number, fn?: MathFunction): Money;
    divide(divisor: number, fn?: MathFunction): Money;
    allocate(ratios: number[]): Money[];
    compare(other: Money): number;
    greaterThan(other: Money): boolean;
    greaterThanOrEqual(other: Money): boolean;
    lessThan(other: Money): boolean;
    lessThanOrEqual(other: Money): boolean;
    isZero(): boolean;
    isPositive(): boolean;
    isNegative(): boolean;
    toDecimal(): number;
    toString(): string;
    toJSON(): {
        amount: number;
        currency: string;
    };
    getAmount(): number;
    getCurrency(): string;
    getCurrencyInfo(): Currency;
}
export { Money, Amount };
