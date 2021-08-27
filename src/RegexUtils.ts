// noinspection JSUnusedGlobalSymbols

export class RegexUtils {
  static escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }

  static startsWith(term: string) {
    return new RegExp(`^${RegexUtils.escapeRegExp(term)}`);
  }

  static contains(term: string) {
    return new RegExp(`${RegexUtils.escapeRegExp(term)}`);
  }
}
