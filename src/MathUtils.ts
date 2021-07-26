export class MathUtils {
  static between(i: number, min: number, max: number): number {
    return Math.max(min, Math.min(i, max));
  }

  static isBetweenInclusive(i: number, min: number, max: number): boolean {
    return i <= max && i >= min;
  }

  static randomNumber(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
