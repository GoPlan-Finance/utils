import { padDecimals } from 'common/MathUtils';
import { Currencies } from 'ts-money';

interface CurrencyInfoInterface {
  decimal_digits: number;
  symbol: string;
}

export const getCurrencyInfo = (currency: string | null): CurrencyInfoInterface => {
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
};

export const formatCurrency = (
  value: /*Money |*/ number,
  currency: string,
  fixedDecimals = true
): string => {
  // return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: currency }).format(value)

  const currencyInfo = getCurrencyInfo(currency);

  if (value === null || value === undefined) {
    return '';
  }

  /* if (value instanceof Money) {
   value = value.toDecimal()
   } else */
  if (!isNaN(Number(value))) {
    value = Number(value);
  }

  /* cap max decimals to either currency, or 4 */
  const valueStr = padDecimals(
    value,
    currencyInfo.decimal_digits,
    fixedDecimals ? currencyInfo.decimal_digits : Math.max(currencyInfo.decimal_digits, 4)
  );

  if (['EUR', 'GBP'].includes(currency)) {
    return `${currencyInfo.symbol} ${valueStr}`;
  }

  return `${valueStr} ${currencyInfo.symbol}`;
};
