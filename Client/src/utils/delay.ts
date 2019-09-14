export default function delay<T = void>(milliseconds: number, data?: T, reason?: any): Promise<T> {
  return new Promise((resolve, reject) => setTimeout(() => (reason ? reject(reason) : resolve(data)), milliseconds));
}
