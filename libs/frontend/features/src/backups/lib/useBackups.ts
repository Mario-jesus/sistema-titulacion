import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, BaseAppState } from '@shared/lib/redux/';
import type { BackupCreateRequest, ListBackupsParams } from '../model/types';
import {
  listBackupsThunk,
  getBackupByIdThunk,
  createBackupThunk,
  deleteBackupThunk,
  restoreBackupThunk,
  uploadBackupThunk,
} from '../model/backupsThunks';
import {
  clearListError,
  clearDetailError,
  clearCreateError,
  clearDeleteError,
  clearRestoreError,
  clearUploadError,
  clearCurrentBackup,
  clearAllErrors,
  type BackupsState,
} from '../model/backupsSlice';

interface AppState extends BaseAppState {
  backups: BackupsState;
}

export function useBackups() {
  const dispatch = useDispatch<AppDispatch>();

  // ========== SELECTORS ==========
  const backups = useSelector((state: AppState) => state.backups.backups);
  const pagination = useSelector((state: AppState) => state.backups.pagination);
  const currentBackup = useSelector(
    (state: AppState) => state.backups.currentBackup
  );

  // Estados de carga
  const isLoadingList = useSelector(
    (state: AppState) => state.backups.isLoadingList
  );
  const isLoadingDetail = useSelector(
    (state: AppState) => state.backups.isLoadingDetail
  );
  const isCreating = useSelector((state: AppState) => state.backups.isCreating);
  const isDeleting = useSelector((state: AppState) => state.backups.isDeleting);
  const isRestoring = useSelector(
    (state: AppState) => state.backups.isRestoring
  );
  const isUploading = useSelector(
    (state: AppState) => state.backups.isUploading
  );

  // Errores
  const listError = useSelector((state: AppState) => state.backups.listError);
  const detailError = useSelector(
    (state: AppState) => state.backups.detailError
  );
  const createError = useSelector(
    (state: AppState) => state.backups.createError
  );
  const deleteError = useSelector(
    (state: AppState) => state.backups.deleteError
  );
  const restoreError = useSelector(
    (state: AppState) => state.backups.restoreError
  );
  const uploadError = useSelector(
    (state: AppState) => state.backups.uploadError
  );

  // ========== ACTIONS ==========

  const listBackups = useCallback(
    (params?: ListBackupsParams) => {
      return dispatch(listBackupsThunk(params));
    },
    [dispatch]
  );

  const getBackupById = useCallback(
    (id: string) => {
      return dispatch(getBackupByIdThunk(id));
    },
    [dispatch]
  );

  const createBackup = useCallback(
    (data: BackupCreateRequest) => {
      return dispatch(createBackupThunk(data));
    },
    [dispatch]
  );

  const deleteBackup = useCallback(
    (id: string) => {
      return dispatch(deleteBackupThunk(id));
    },
    [dispatch]
  );

  const restoreBackup = useCallback(
    (id: string) => {
      return dispatch(restoreBackupThunk(id));
    },
    [dispatch]
  );

  const uploadBackup = useCallback(
    (file: File) => {
      return dispatch(uploadBackupThunk(file));
    },
    [dispatch]
  );

  // ========== CLEAR ERRORS ==========

  const clearListErrorAction = useCallback(() => {
    dispatch(clearListError());
  }, [dispatch]);

  const clearDetailErrorAction = useCallback(() => {
    dispatch(clearDetailError());
  }, [dispatch]);

  const clearCreateErrorAction = useCallback(() => {
    dispatch(clearCreateError());
  }, [dispatch]);

  const clearDeleteErrorAction = useCallback(() => {
    dispatch(clearDeleteError());
  }, [dispatch]);

  const clearRestoreErrorAction = useCallback(() => {
    dispatch(clearRestoreError());
  }, [dispatch]);

  const clearUploadErrorAction = useCallback(() => {
    dispatch(clearUploadError());
  }, [dispatch]);

  const clearCurrentBackupAction = useCallback(() => {
    dispatch(clearCurrentBackup());
  }, [dispatch]);

  const clearAllErrorsAction = useCallback(() => {
    dispatch(clearAllErrors());
  }, [dispatch]);

  return {
    // Data
    backups,
    pagination,
    currentBackup,

    // Loading states
    isLoadingList,
    isLoadingDetail,
    isCreating,
    isDeleting,
    isRestoring,
    isUploading,

    // Errors
    listError,
    detailError,
    createError,
    deleteError,
    restoreError,
    uploadError,

    // Actions
    listBackups,
    getBackupById,
    createBackup,
    deleteBackup,
    restoreBackup,
    uploadBackup,

    // Clear errors
    clearListError: clearListErrorAction,
    clearDetailError: clearDetailErrorAction,
    clearCreateError: clearCreateErrorAction,
    clearDeleteError: clearDeleteErrorAction,
    clearRestoreError: clearRestoreErrorAction,
    clearUploadError: clearUploadErrorAction,
    clearCurrentBackup: clearCurrentBackupAction,
    clearAllErrors: clearAllErrorsAction,
  };
}
