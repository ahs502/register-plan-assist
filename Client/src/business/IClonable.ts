/**
 * A clonable object which can clone itself by implementing a clone method.
 */
export default interface IClonable<T> {
  /**
   * Returns a fully deep clone of this object.
   */
  clone(): T;
}
