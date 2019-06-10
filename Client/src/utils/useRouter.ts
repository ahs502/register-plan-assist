import { useContext, Context } from 'react';
import { __RouterContext, RouteComponentProps } from 'react-router';

export default function useRouter<Params = {}>() {
  return useContext((__RouterContext as unknown) as Context<RouteComponentProps<Params>>);
}
