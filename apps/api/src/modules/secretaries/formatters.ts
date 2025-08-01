import type {  SecretaryWithRelations } from "./types";

export abstract class SecretaryFormatter {
  static response(secretary: SecretaryWithRelations) {
    return {
      id: secretary?.id,
      uuid: secretary?.uuid,
      phoneNumber: secretary?.phoneNumber,
      address: secretary?.address,
      dateOfBirth: secretary?.dateOfBirth,
      createdAt: secretary?.createdAt,
      updatedAt: secretary?.updatedAt,
      user: {
        id: secretary?.user?.id,
        firstName: secretary?.user?.firstName,
        lastName: secretary?.user?.lastName,
        email: secretary?.user?.email,
        tcNo: secretary?.user?.tcNo,
        gender: secretary?.user?.gender,
      },
    };
  }
}
