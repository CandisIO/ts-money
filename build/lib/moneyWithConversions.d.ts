import { Money } from "./money";
export declare class MoneyWithConversion extends Money {
    base?: Money | null;
    exchangeRate?: number | null;
    exchangeRateDate?: Date | null;
    constructor({ amount, base, exchangeRate, exchangeRateDate, }: {
        amount: Money;
        base?: Money | null;
        exchangeRate?: number | null;
        exchangeRateDate?: Date | null;
    });
}
