type DeepOptional<O> = O extends object ? { [K in keyof O]?: DeepOptional<O[K]> } : O;

export default DeepOptional;
