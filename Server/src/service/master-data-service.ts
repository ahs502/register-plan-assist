import { Router } from 'express';
import asyncMiddleware from '../utils/asyncMiddleware';

import { MasterDataModel } from '@business/master-data';
import { AircraftGroupModel } from '@business/master-data/AircraftGroup';
import { ConstraintModel } from '@business/master-data/Constraint';

const router = Router();
export default router;

router.post(
  'get-all',
  asyncMiddleware(async data => {
    const collectionSelector: { readonly [collectionName in keyof MasterDataModel]?: true } | undefined = data.collectionSelector;

    if (!collectionSelector || collectionSelector.aircraftTypes) {
      // do it...
    }

    return {} as Partial<MasterDataModel>;
  })
);

router.post(
  'add-or-edit-aircraft-group',
  asyncMiddleware(async data => {
    const aircraftGroup: Readonly<AircraftGroupModel> = data.aircraftGroup;

    // do it...

    return { aircraftGroups: [aircraftGroup] as AircraftGroupModel[] } as Pick<MasterDataModel, 'aircraftGroups'>;
  })
);

router.post(
  'remove-aircraft-group',
  asyncMiddleware(async data => {
    const aircraftGroupId: string = data.aircraftGroupId;

    // do it...

    return { aircraftGroups: [] as AircraftGroupModel[] } as Pick<MasterDataModel, 'aircraftGroups'>;
  })
);

router.post(
  'add-or-edit-constraint',
  asyncMiddleware(async data => {
    const constraint: Readonly<ConstraintModel> = data.constraint;

    // do it...

    return { constraints: [constraint] as ConstraintModel[] } as Pick<MasterDataModel, 'constraints'>;
  })
);

router.post(
  'remove-constraint',
  asyncMiddleware(async data => {
    const constraintId: string = data.constraintId;

    // do it...

    return { constraints: [] as ConstraintModel[] } as Pick<MasterDataModel, 'constraints'>;
  })
);
