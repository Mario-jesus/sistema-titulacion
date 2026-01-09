import type { ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

/**
 * Tipo genérico para dispatch de Redux que soporta thunks
 *
 * Este tipo puede ser usado por features sin violar FSD,
 * ya que shared es una capa inferior accesible por todas las capas superiores.
 *
 * Usa ThunkDispatch para soportar tanto acciones síncronas como asíncronas (thunks).
 *
 * Las features pueden usar este tipo en sus hooks personalizados:
 *
 * @example
 * ```typescript
 * import type { AppDispatch } from '@shared/lib/redux/types';
 *
 * export function useMyFeature() {
 *   const dispatch = useDispatch<AppDispatch>();
 *   // ...
 * }
 * ```
 */
export type AppDispatch = ThunkDispatch<unknown, unknown, UnknownAction>;

/**
 * Tipo base para el estado de la aplicación
 *
 * Las features pueden crear sus propios tipos extendiendo este
 * para definir la estructura del estado en sus hooks.
 *
 * @example
 * ```typescript
 * import type { BaseAppState } from '@shared/lib/redux/types';
 *
 * interface AppState extends BaseAppState {
 *   myFeature: MyFeatureState;
 * }
 * ```
 */
export type BaseAppState = Record<string, unknown>;
