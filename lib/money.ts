import { isFunction, isNaN, isObject, isPlainObject, isString } from "lodash";
import { Currencies } from "./currencies";
import { Currency } from "./currency";

type MathFunction = (num: number) => number;
type Rounder = "round" | "floor" | "ceil" | MathFunction;

interface Amount {
  amount: number;
  currency: string | Currency;
}

const isInt = (n: unknown) => {
  return Number(n) === n && n % 1 === 0;
};

const decimalPlaces = (num: number) => {
  const match = ("" + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);

  if (!match) return 0;

  return Math.max(
    0,
    (match[1] ? match[1].length : 0) - (match[2] ? +match[2] : 0)
  );
};

const assertSameCurrency = (left: Money, right: Money) => {
  if (left.currency !== right.currency) {
    throw new Error("Different currencies");
  }
};

const assertType = (other: unknown) => {
  if (!(other instanceof Money)) {
    throw new TypeError("Instance of Money required");
  }
};

const assertOperand = (operand: number) => {
  if (isNaN(parseFloat(operand.toString())) && !isFinite(operand))
    throw new TypeError("Operand must be a number");
};

const getCurrencyObject = (currency: string): Currency => {
  const currencyObj = Currencies[currency];

  if (currencyObj) {
    return currencyObj;
  }

  for (const key in Currencies) {
    if (key.toUpperCase() === currency.toUpperCase()) {
      return Currencies[key];
    }
  }

  throw new TypeError("Invalid currency");
};

const isAmountObject = (amount: number | Amount): amount is Amount =>
  isObject(amount);

class Money {
  amount: number;
  currency: string;

  constructor(amount: number, currency: Currency | string) {
    const currencyObj = isString(currency)
      ? getCurrencyObject(currency)
      : currency;

    if (!currencyObj || !isPlainObject(currencyObj)) {
      throw new TypeError("Invalid currency");
    }

    if (!isInt(amount)) {
      throw new TypeError("Amount must be an integer");
    }

    this.amount = amount;
    this.currency = currencyObj.code;
  }

  static fromInteger(amount: Amount): Money;
  static fromInteger(amount: number, currency: Currency | string): Money;
  static fromInteger(
    amount: number | Amount,
    currency?: Currency | string
  ): Money {
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

  static fromDecimal(amount: Amount, rounder?: MathFunction): Money;
  static fromDecimal(
    amount: number,
    currency: string | Currency,
    rounder?: Rounder
  ): Money;
  static fromDecimal(
    amount: number | Amount,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    currency: string | Currency | any,
    rounder?: Rounder
  ): Money {
    if (isAmountObject(amount)) {
      if (amount.amount === undefined || amount.currency === undefined)
        throw new TypeError("Missing required parameters amount,currency");

      currency = amount.currency;
      amount = amount.amount;
    }

    if (isString(currency)) currency = getCurrencyObject(currency);

    if (!isPlainObject(currency)) throw new TypeError("Invalid currency");

    if (rounder === undefined) {
      const decimals = decimalPlaces(amount);

      if (decimals > currency.decimal_digits)
        throw new Error(
          `The currency ${currency.code} supports only` +
            ` ${currency.decimal_digits} decimal digits`
        );

      rounder = Math.round;
    } else {
      if (
        ["round", "floor", "ceil"].indexOf(rounder as string) === -1 &&
        typeof rounder !== "function"
      )
        throw new TypeError("Invalid parameter rounder");

      if (isString(rounder)) rounder = Math[rounder];
    }

    const precisionMultiplier = Math.pow(10, currency.decimal_digits);
    let resultAmount = amount * precisionMultiplier;

    resultAmount = (rounder as MathFunction)(resultAmount);

    return new Money(resultAmount, currency);
  }

  /**
   * Returns true if the two instances of Money are equal, false otherwise.
   *
   * @param {Money} other
   * @returns {Boolean}
   */
  equals(other: Money): boolean {
    assertType(other);

    return this.amount === other.amount && this.currency === other.currency;
  }

  /**
   * Adds the two objects together creating a new Money instance that holds the result of the operation.
   *
   * @param {Money} other
   * @returns {Money}
   */
  add(other: Money): Money {
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
  subtract(other: Money): Money {
    assertType(other);
    assertSameCurrency(this, other);

    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(multiplier: number, fn?: MathFunction): Money {
    if (!isFunction(fn)) fn = Math.round;

    assertOperand(multiplier);
    const amount = fn(this.amount * multiplier);

    return new Money(amount, this.currency);
  }

  divide(divisor: number, fn?: MathFunction): Money {
    if (!isFunction(fn)) fn = Math.round;

    assertOperand(divisor);
    const amount = fn(this.amount / divisor);

    return new Money(amount, this.currency);
  }

  allocate(ratios: number[]): Money[] {
    const results: Money[] = [];
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

  compare(other: Money): number {
    assertType(other);
    assertSameCurrency(this, other);

    if (this.amount === other.amount) return 0;

    return this.amount > other.amount ? 1 : -1;
  }

  greaterThan(other: Money): boolean {
    return 1 === this.compare(other);
  }

  greaterThanOrEqual(other: Money): boolean {
    return 0 <= this.compare(other);
  }

  lessThan(other: Money): boolean {
    return -1 === this.compare(other);
  }

  lessThanOrEqual(other: Money): boolean {
    return 0 >= this.compare(other);
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  isPositive(): boolean {
    return this.amount > 0;
  }

  isNegative(): boolean {
    return this.amount < 0;
  }

  toDecimal(): number {
    return Number(this.toString());
  }

  toString(): string {
    const currency = getCurrencyObject(this.currency);

    return (this.amount / Math.pow(10, currency.decimal_digits)).toFixed(
      currency.decimal_digits
    );
  }

  toJSON(): { amount: number; currency: string } {
    return {
      amount: this.amount,
      currency: this.currency,
    };
  }

  getAmount(): number {
    return this.amount;
  }

  getCurrency(): string {
    return this.currency;
  }

  getCurrencyInfo(): Currency {
    return getCurrencyObject(this.currency);
  }
}

Object.assign(Money, Currencies);

export { Money };
