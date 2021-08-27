// noinspection JSUnusedGlobalSymbols

export class RegexUtils {
  static escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  static startsWith(term: string): RegExp {
    return new RegExp(`^${RegexUtils.escapeRegExp(term)}`);
  }

  static contains(term: string): RegExp {
    return new RegExp(`${RegexUtils.escapeRegExp(term)}`);
  }
}
