
export interface ClinicCreatePayload {
  phoneNumber?: string;
  address?: string;
  name:string;
  description:string;
}

export interface ClinicUpdatePayload {
  phoneNumber?: string;
  address?: string;
  name?:string;
  description?:string;
}

export interface ClinicIndexQuery {
  page?: string;
  limit?: string;
  search?: string;
}

export interface ClinicShowWhere {
  uuid: string;
}