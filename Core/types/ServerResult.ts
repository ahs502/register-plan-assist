export default interface ServerResult<T = any> {
  message?: string;
  value?: T;
}
