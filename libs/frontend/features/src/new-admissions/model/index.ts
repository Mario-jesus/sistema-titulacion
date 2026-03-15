export * from './types';
export { newAdmissionsReducer } from './newAdmissionsSlice';
export {
  listNewAdmissionsThunk,
  getNewAdmissionByIdThunk,
  createNewAdmissionThunk,
  updateNewAdmissionThunk,
  patchNewAdmissionThunk,
  deleteNewAdmissionThunk,
  activateNewAdmissionThunk,
  deactivateNewAdmissionThunk,
} from './newAdmissionsThunks';
