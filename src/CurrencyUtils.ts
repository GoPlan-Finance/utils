import { Currencies, Money } from 'ts-money';

interface CurrencyInfoInterface {
  decimal_digits: number;
  symbol: string;
}

export class CurrencyUtils {
  public static getCurrencyInfo(currency: string | null): CurrencyInfoInterface {
    const info = {
      decimal_digits: 2,
      symbol: '$',
    };

    if (!currency) {
      return info;
    }

    currency = currency.toUpperCase();

    if (!Currencies[currency as keyof typeof Currencies]) {
      throw `Currency not found ${currency}`;
    }

    return Currencies[currency.toUpperCase() as keyof typeof Currencies];
  }

  public static formatCurrency(
    value: number,
    currency: string,
    fixedDecimals = true,
    locale = 'en-US',
    signDisplay: 'auto' | 'never' | 'always' | undefined
  ): string {

    if (value === null || value === undefined) {
      return '';
    }

    if (!isNaN(Number(value))) {
      value = Number(value);
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat#parameters
    const options: Intl.NumberFormatOptions = {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 4,
      signDisplay,
    };

    if (fixedDecimals) {
      options.minimumFractionDigits = 2;
    }

    return new Intl.NumberFormat(locale, options).format(value);
  }
}
