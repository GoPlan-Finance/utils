/**
 *
 *
 *
 */
// require('../../parseConfig')

Parse.User.allowCustomUserClass(true);

/*abstract*/
export class User extends Parse.User {
  static className = "_User";

  // get  () : string{
  //   return this.get('')
  // }
  //
  // set (value : string ) {
  //   this.set('' , value)
  // }

  public static useMasterKey(use = false): { useMasterKey: boolean } | undefined {
    return use ? { useMasterKey: true } : undefined;
  }

  get createdAt(): Date {
    return this.get("createdAt");
  }

  get updatedAt(): Date {
    return this.get("updatedAt");
  }

  public static register(): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error  error TS2339: Property 'className' does not exist on type 'typeof BaseObject'.
    Parse.Object.registerSubclass(this.className, this);
  }
}

User.register();
