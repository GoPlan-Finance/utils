import { Money } from 'ts-money';

export class MoneyUtils {
  public static fromAmount(rawVal: number | null): null | Money {
    const val = Number.isInteger(rawVal) ? rawVal : null;

    if (val === null || val === undefined) {
      return null;
    }

    return new Money(val, 'CAD');
  }

  public static toAmount(val: Money | null): number | null {
    if (val === null || val === undefined) {
      return null;
    }

    return val.getAmount();
  }
}
