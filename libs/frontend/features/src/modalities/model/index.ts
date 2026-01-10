export * from './types';
export { modalitiesReducer } from './modalitiesSlice';
export {
  listModalitiesThunk,
  getModalityByIdThunk,
  createModalityThunk,
  updateModalityThunk,
  patchModalityThunk,
  deleteModalityThunk,
  activateModalityThunk,
  deactivateModalityThunk,
} from './modalitiesThunks';
