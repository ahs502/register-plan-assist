import { ObjectID } from 'mongodb';
import PreplanModel from '@core/models/PreplanModel';

type PreplanSchema = Omit<PreplanModel, 'id' | 'flightRequirements' | 'parentPreplanId'> & { _id?: ObjectID; parentPreplanId?: ObjectID };

export default PreplanSchema;

export type PreplanHeaderSchema = Omit<PreplanSchema, 'autoArrangerOptions' | 'dummyAircraftRegisters' | 'aircraftRegisterOptionsDictionary'>;
