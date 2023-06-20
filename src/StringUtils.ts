export class StringUtils {
  static toFloatOrNull(value: string): number | null {
    const floatVal = parseFloat(value);

    if (isNaN(floatVal)) {
      return null;
    }

    return floatVal;
  }

  static toFixedOrNull(value: string): number | null {
    const floatVal = parseFloat(value);

    if (isNaN(floatVal)) {
      return null;
    }

    return floatVal;
  }

  static hideZero(num: number): string {
    return num === 0 ? '' : num.toString();
  }

  static padDecimals(num: number, minDec = 0, maxDec = 4): string {
    // decimal part, without trailing 00
    // 1.000 ->  ''
    // 1.12345000 ->  12345
    // 1.12000 -> 12
    const str = num.toFixed(maxDec).toString();

    const dec = str.includes('.') ? str.split('.')[1].replace(/0+$/, '') : '';

    const len = dec.length <= minDec ? minDec : maxDec;

    return Number(num).toFixed(len);
  }

  static getDomainNameRegex(): RegExp {
    return /^([a-z0-9|-]+[a-z0-9]+\.)*[a-z0-9|-]+[a-z0-9]+\.[a-z]{2,}$/;
  }

  static localeCompare(
    a: string,
    b: string,
    sensitivity: 'base' | 'accent' | 'case' | 'variant'
  ): boolean {
    // https://www.techonthenet.com/js/string_localecompare.php
    return typeof a === 'string' && typeof b === 'string'
      ? a.localeCompare(b, undefined, { sensitivity }) === 0
      : a === b;
  }

  static properCase(sentence: string): string {
    if (!sentence || sentence.length === 0) {
      return sentence;
    }

    const makeCases = (str: string, glue: string): string => {
      const arr = str.split(glue);
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].length > 0) {
          arr[i] = arr[i][0].toUpperCase() + arr[i].slice(1);
        }
      }
      return arr.join(glue);
    };

    return [' ', '-'].reduce(
      (prev: string, glue: string) => makeCases(prev, glue),
      sentence.toLowerCase()
    );
  }

  static trimOrNull(str: string | undefined | null): string | null {
    if (typeof str !== 'string') {
      return null;
    }

    str = str.trim();

    if (str.length === 0) {
      return null;
    }

    return str;
  }
}
