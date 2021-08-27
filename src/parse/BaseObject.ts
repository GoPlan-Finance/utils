/**
 *
 *
 *
 */
// require('../../parseConfig')
// import Parse from 'parse'

/*abstract*/
import { PointerInterface } from '@utils/parse/Query';

export class BaseObject extends Parse.Object {
  // get  () : string{
  //   return this.get('')
  // }
  //
  // set (value : string ) {
  //   this.set('' , value)
  // }

  constructor(className: string) {
    super(className);
  }

  public static useMasterKey(use = false): { useMasterKey: boolean } | undefined {
    return use ? { useMasterKey: true } : undefined;
  }

  get createdAt(): Date {
    return this.get('createdAt');
  }

  get updatedAt(): Date {
    return this.get('updatedAt');
  }

  public static register(): void {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore  error TS2339: Property 'className' does not exist on type 'typeof BaseObject'.
    Parse.Object.registerSubclass(this.className, this);
  }

  static createPointer(id: string): PointerInterface {
    return {
      __type: 'Pointer',
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore  error TS2339: Property 'className' does not exist on type 'typeof BaseObject'.
      className: this.className,
      objectId: id,
    };
  }
}
