import apiRequest from 'src/utils/apiRequest';
import MasterDataModel from '@core/models/master-data/MasterDataModel';
import AircraftGroupModel from '@core/models/master-data/AircraftGroupModel';
import ConstraintModel from '@core/models/master-data/ConstraintModel';

const request = apiRequest.bind(null, 'master-data');

export default class MasterDataService {
  /**
   * Provides all or some of master data collections.
   */
  static async getAll(collectionSelector?: { readonly [collectionName in keyof MasterDataModel]?: true }): Promise<Partial<MasterDataModel>> {
    return await request('get-all', { collectionSelector });
  }

  /**
   * Adds/edits (according to the given id in model) some aircraft group in master data and
   * provides a partial master data model feed containing all aircraft group models.
   */
  static async addOrEditAircraftGroup(aircraftGroup: Readonly<AircraftGroupModel>): Promise<Readonly<Pick<MasterDataModel, 'aircraftGroups'>>> {
    return await request('add-or-edit-aircraft-group', { aircraftGroup });
  }

  /**
   * Removes some aircraft group in master data and provides a partial master data model feed containing all aircraft group models.
   */
  static async removeAircraftGroup(aircraftGroupId: string): Promise<Readonly<Pick<MasterDataModel, 'aircraftGroups'>>> {
    return await request('remove-aircraft-group', { aircraftGroupId });
  }

  /**
   * Adds/edits (according to the given id in model) some constraint in master data and
   * provides a partial master data model feed containing all constraint models.
   */
  static async addOrEditConstraint(constraint: Readonly<ConstraintModel>): Promise<Readonly<Pick<MasterDataModel, 'constraints'>>> {
    return await request('add-or-edit-constraint', { constraint });
  }

  /**
   * Removes some constraint in master data and provides a partial master data model feed containing all constraint models.
   */
  static async removeConstraint(constraintId: string): Promise<Readonly<Pick<MasterDataModel, 'constraints'>>> {
    return await request('remove-constraint', { constraintId });
  }
}
