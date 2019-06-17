import { FlightRequirementModel, FlightScope, WeekdayFlightRequirementModel, FlightModel } from '@business/FlightRequirement';
import { ObjectID } from 'mongodb';

type FlightTimeSchema = { stdLowerBound: number; stdUpperBound: number };
type FlightScopeSchema = Omit<FlightScope, 'times'> & { times: readonly Readonly<FlightTimeSchema>[] };
type FlightSchema = Omit<FlightModel, 'std'> & { std: number };
type WeekdayFlightRequirementSchema = Omit<WeekdayFlightRequirementModel, 'scope' | 'flight'> & { scope: Readonly<FlightScopeSchema>; flight: Readonly<FlightSchema> };
type FlightRequirementSchema = Omit<FlightRequirementModel, 'id' | 'scope' | 'days'> & {
  _id?: ObjectID;
  scope: Readonly<FlightScopeSchema>;
  days: readonly Readonly<WeekdayFlightRequirementSchema>[];
  preplanId: ObjectID;
};

export default FlightRequirementSchema;
