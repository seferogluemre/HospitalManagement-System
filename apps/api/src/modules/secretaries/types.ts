import type { Secretary, User } from "@onlyjs/db/client";
import type { Gender } from "@onlyjs/db/enums";

export interface SecretaryCreatePayload {
  firstName: string;
  lastName: string;
  email: string;
  tcNo: string;
  gender: Gender;
  password: string;

  // Secretary specific fields
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: Date;
}

export interface SecretaryUpdatePayload {
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: Date;
}

export interface SecretaryIndexQuery {
  page?: string;
  limit?: string;
  search?: string;
}

export interface SecretaryShowWhere {
  id: string;
}
export type SecretaryWithRelations = Secretary & {
  user: Pick<User, "id" | "firstName" | "lastName" | "email" | "tcNo" | "gender" >;
};