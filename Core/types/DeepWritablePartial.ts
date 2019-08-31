type DeepWritablePartial<O> = O extends readonly (infer I)[]
  ? { [index: number]: DeepWritablePartial<I> | undefined }
  : O extends object
  ? { -readonly [K in keyof O]+?: DeepWritablePartial<O[K]> }
  : O;

export default DeepWritablePartial;
