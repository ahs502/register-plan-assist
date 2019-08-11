export const Envs = <const>['development', 'test', 'production'];

type Env = typeof Envs[number];

export default Env;
