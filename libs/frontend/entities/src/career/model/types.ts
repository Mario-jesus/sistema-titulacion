import type { Modality } from '../../modality';

export interface Career {
  id: string;
  name: string;
  shortName: string;
  modalityId: string;
  modality: Modality;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
