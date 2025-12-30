import { Money } from "./money";

export class MoneyWithConversion extends Money {
  base?: Money | null;
  exchangeRate?: number | null;
  exchangeRateDate?: Date | null;

  constructor({
    amount,
    base,
    exchangeRate,
    exchangeRateDate,
  }: {
    amount: Money;
    base?: Money | null;
    exchangeRate?: number | null;
    exchangeRateDate?: Date | null;
  }) {
    super(amount.getAmount(), amount.getCurrency());

    this.base = base;
    this.exchangeRate = exchangeRate;
    this.exchangeRateDate = exchangeRateDate;
  }
}
