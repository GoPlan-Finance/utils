export class NumberUtils {

  public static  isInt (n : number) : boolean {
    return Number(n) === n && n % 1 === 0;
  };
}
