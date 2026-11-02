import type { CitizenCard, CitizenPreview } from 'types/entities';

export function toPreview({ citizen, related }: CitizenCard): CitizenPreview {
  return {
    citizen: {
      id: citizen.id,
      cardNumber: citizen.cardNumber,
      lastName: citizen.lastName,
      firstName: citizen.firstName,
      middleName: citizen.middleName,
      birthDate: citizen.birthDate,
      age: citizen.age,
      gender: citizen.gender,
      mobilePhone: citizen.mobilePhone,
      email: citizen.email,
      status: citizen.status,
      districtId: citizen.districtId,
      responsibleId: citizen.responsibleId,
    },
    addresses: related.addresses,
  };
}
