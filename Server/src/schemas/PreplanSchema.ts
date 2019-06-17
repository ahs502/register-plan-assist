import { PreplanModel } from '@business/Preplan';
import { ObjectID } from 'mongodb';

type PreplanSchema = Omit<PreplanModel, 'id' | 'flightRequirements' | 'parentPreplanId'> & { _id?: ObjectID; parentPreplanId?: ObjectID };

export default PreplanSchema;

export type PreplanHeaderSchema = Omit<PreplanSchema, 'autoArrangerOptions' | 'dummyAircraftRegisters' | 'aircraftRegisterOptionsDictionary'>;
