import MasterDataModel from '@core/models/master-data/MasterDataModel';
import MasterDataItemModel from '@core/models/master-data/MasterDataItemModel';
import MasterDataCollection from '@core/types/MasterDataCollection';
import { withDb } from 'src/utils/sqlServer';
import { fetchAndCacheMasterData } from 'src/services/master-data-service';

type WritableMasterDataAll = {
  -readonly [T in keyof MasterDataModel]-?: MasterDataModel[T] extends readonly (infer I)[] ? (I extends MasterDataItemModel ? MasterDataCollection<I> : any) : any;
};
type MasterDataAll = Readonly<WritableMasterDataAll>;

const MasterData: {
  readonly all: MasterDataAll;
  recieve(masterData: MasterDataModel): void;
  initialize(): Promise<void>;
} = {
  all: {
    aircraftTypes: { items: [], id: {}, name: {} },
    aircraftRegisters: { items: [], id: {}, name: {} },
    airports: { items: [], id: {}, name: {} },
    seasonTypes: { items: [], id: {}, name: {} },
    seasons: { items: [], id: {}, name: {} },
    stcs: { items: [], id: {}, name: {} },
    aircraftRegisterGroups: { items: [], id: {}, name: {} },
    constraintTemplates: { items: [], id: {}, name: {} },
    constraints: { items: [], id: {}, name: {} }
  },
  recieve(masterData) {
    const all: WritableMasterDataAll = MasterData.all;
    (Object.keys(masterData) as (keyof MasterDataModel)[]).forEach(name => (all[name] = createCollection(masterData[name]) as any));
  },
  initialize() {
    return withDb(db => fetchAndCacheMasterData(Object.keys(MasterData.all) as (keyof MasterDataModel)[], db));
  }
};

export default MasterData;

function createCollection<T extends MasterDataItemModel>(items: readonly T[]): MasterDataCollection<T> {
  return {
    items,
    id: items.toDictionary(item => item.id),
    name: items.toDictionary(item => item.name)
  };
}
