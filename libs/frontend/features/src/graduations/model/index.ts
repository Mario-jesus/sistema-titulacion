export * from './types';

export { graduationsReducer } from './graduationsSlice';
export {
  getGraduationByIdThunk,
  createGraduationThunk,
  updateGraduationThunk,
  patchGraduationThunk,
  deleteGraduationThunk,
  graduateStudentThunk,
  ungraduateStudentThunk,
} from './graduationsThunks';
