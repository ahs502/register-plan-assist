import { Router } from 'express';
import { requestMiddlewareWithDb, requestMiddlewareWithTransactionalDb } from 'src/utils/requestMiddleware';
import Id from '@core/types/Id';
import NewPreplanHeaderModel, { NewPreplanHeaderModelValidation } from '@core/models/preplan/NewPreplanHeaderModel';
import { convertNewPreplanHeaderModelToEntity } from 'src/entities/preplan/NewPreplanHeaderEntity';
import { Db } from 'src/utils/sqlServer';
import PreplanHeaderDataModel from '@core/models/preplan/PreplanHeaderDataModel';
import PreplanHeaderVersionEntity, { convertPreplanHeaderVersionEntitiesToDataModels } from 'src/entities/preplan/PreplanHeaderVersionEntity';
import ClonePreplanHeaderModel, { ClonePreplanHeaderModelValidation } from '@core/models/preplan/ClonePreplanHeaderModel';
import { convertClonePreplanHeaderModelToEntity } from 'src/entities/preplan/ClonePreplanHeaderEntity';
import EditPreplanHeaderModel, { EditPreplanHeaderModelValidation } from '@core/models/preplan/EditPreplanHeaderModel';
import { convertEditPreplanHeaderModelToEntity } from 'src/entities/preplan/EditPreplanHeaderEntity';

const router = Router();
export default router;

router.post(
  '/get-all',
  requestMiddlewareWithDb<{}, PreplanHeaderDataModel[]>(async (userId, {}, db) => {
    return await getPreplanHeaderDataModels(db, userId);
  })
);

router.post(
  '/create-empty',
  requestMiddlewareWithTransactionalDb<{ newPreplanHeader: NewPreplanHeaderModel }, Id>(async (userId, { newPreplanHeader }, db) => {
    const userPreplanHeaderNames = await db
      .select<{ name: string }>({ name: '[Name]' })
      .from('[Rpa].[PreplanHeader]')
      .where(`[Id_User] = '${userId}'`)
      .map(({ name }) => name);
    new NewPreplanHeaderModelValidation(newPreplanHeader, userPreplanHeaderNames).throw('Invalid API input.');

    const newPreplanHeaderEntity = convertNewPreplanHeaderModelToEntity(newPreplanHeader);
    const { preplanId } = await db
      .sp<{ preplanId: Id }>(
        '[Rpa].[SP_InsertEmptyPreplanHeader]',
        db.bigIntParam('userId', userId),
        db.nVarCharParam('name', newPreplanHeaderEntity.name, 200),
        db.dateTimeParam('startDate', newPreplanHeaderEntity.startDate),
        db.dateTimeParam('endDate', newPreplanHeaderEntity.endDate)
      )
      .one();

    return preplanId;
  })
);

router.post(
  '/clone',
  requestMiddlewareWithTransactionalDb<{ clonePreplanHeader: ClonePreplanHeaderModel }, Id>(async (userId, { clonePreplanHeader }, db) => {
    const userPreplanIds = await db
      .select<{ id: string }>({ id: 'convert(varchar(30), p.[Id])' })
      .from('[Rpa].[Preplan] as p join [Rpa].[PreplanHeader] as h on h.[Id] = p.[Id_PreplanHeader]')
      .where(`h.[Id_User] = '${userId}' or h.[Published] = 1`)
      .map(({ id }) => id, 'User do not have access to any preplans.');
    const userPreplanHeaderNames = await db
      .select<{ name: string }>({ name: '[Name]' })
      .from('[Rpa].[Preplan]')
      .where(`[Id_User] = '${userId}'`)
      .map(({ name }) => name);
    const { originalStartDate, originalEndDate } = await db
      .select<{ originalStartDate: string; originalEndDate: string }>({ originalStartDate: 'h.[StartDate]', originalEndDate: 'h.[EndDate]' })
      .from('[Rpa].[Preplan] as p join [Rpa].[PreplanHeader] as h on h.[Id] = p.[Id_PreplanHeader]')
      .where(`p.[Id] = '${clonePreplanHeader.sourcePreplanId}'`)
      .pick(
        ({ originalStartDate, originalEndDate }) => ({
          originalStartDate: new Date(originalStartDate),
          originalEndDate: new Date(originalEndDate)
        }),
        'Preplan is not found.'
      );
    new ClonePreplanHeaderModelValidation(clonePreplanHeader, userPreplanIds, userPreplanHeaderNames, originalStartDate, originalEndDate).throw('Invalid API input.');

    const clonePreplanHeaderEntity = convertClonePreplanHeaderModelToEntity(clonePreplanHeader);
    const { preplanId } = await db
      .sp<{ preplanId: Id }>(
        '[Rpa].[SP_ClonePreplanHeader]',
        db.bigIntParam('userId', userId),
        db.intParam('sourcePreplanId', clonePreplanHeaderEntity.sourcePreplanId),
        db.nVarCharParam('name', clonePreplanHeaderEntity.name, 200),
        db.dateTimeParam('startDate', clonePreplanHeaderEntity.startDate),
        db.dateTimeParam('endDate', clonePreplanHeaderEntity.endDate),
        db.bitParam('includeChanges', clonePreplanHeaderEntity.includeChanges),
        db.bitParam('includeAllVersions', clonePreplanHeaderEntity.includeAllVersions)
      )
      .one();

    return preplanId;
  })
);

router.post(
  '/edit',
  requestMiddlewareWithDb<{ editPreplanHeader: EditPreplanHeaderModel }, PreplanHeaderDataModel[]>(async (userId, { editPreplanHeader }, db) => {
    const userPreplanHeaderNames = await db
      .select<{ name: string }>({ name: '[Name]' })
      .from('[Rpa].[PreplanHeader]')
      .where(`[Id_User] = '${userId}' and [Id] <> '${editPreplanHeader.id}'`)
      .map(({ name }) => name);
    const { originalStartDate, originalEndDate } = await db
      .select<{ originalStartDate: string; originalEndDate: string }>({ originalStartDate: '[StartDate]', originalEndDate: '[EndDate]' })
      .from('[Rpa].[PreplanHeader]')
      .where(`[Id] = '${editPreplanHeader.id}'`)
      .pick(
        ({ originalStartDate, originalEndDate }) => ({
          originalStartDate: new Date(originalStartDate),
          originalEndDate: new Date(originalEndDate)
        }),
        'Preplan is not found.'
      );
    new EditPreplanHeaderModelValidation(editPreplanHeader, userPreplanHeaderNames, originalStartDate, originalEndDate).throw('Invalid API input.');

    const editPreplanHeaderEntity = convertEditPreplanHeaderModelToEntity(editPreplanHeader);
    await db
      .sp(
        '[Rpa].[SP_UpdatePreplanHeader]',
        db.bigIntParam('userId', userId),
        db.intParam('id', editPreplanHeaderEntity.id),
        db.nVarCharParam('name', editPreplanHeaderEntity.name, 200),
        db.dateTimeParam('startDate', editPreplanHeaderEntity.startDate),
        db.dateTimeParam('endDate', editPreplanHeaderEntity.endDate)
      )
      .all();

    return await getPreplanHeaderDataModels(db, userId);
  })
);

router.post(
  '/set-published',
  requestMiddlewareWithDb<{ id: Id; published: boolean }, PreplanHeaderDataModel[]>(async (userId, { id, published }, db) => {
    await db.sp('[Rpa].[SP_SetPreplanHeaderPublished]', db.bigIntParam('userId', userId), db.intParam('id', id), db.bitParam('published', published)).all();

    return await getPreplanHeaderDataModels(db, userId);
  })
);

router.post(
  '/remove',
  requestMiddlewareWithTransactionalDb<{ id: Id }, PreplanHeaderDataModel[]>(async (userId, { id }, db) => {
    await db.sp('[Rpa].[SP_DeletePreplanHeader]', db.bigIntParam('userId', userId), db.intParam('id', id)).all();

    return await getPreplanHeaderDataModels(db, userId);
  })
);

export async function getPreplanHeaderDataModels(db: Db, userId: Id): Promise<PreplanHeaderDataModel[]> {
  const preplanHeaderVersionEntities = await db.sp<PreplanHeaderVersionEntity>('[Rpa].[SP_GetPreplanHeaderVersions]', db.bigIntParam('userId', userId)).all();
  const preplanHeaderDataModels = convertPreplanHeaderVersionEntitiesToDataModels(preplanHeaderVersionEntities);
  return preplanHeaderDataModels;
}
