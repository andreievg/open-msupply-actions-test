export const patient = {
  id: '1234',
  gender: 'Female',
  firstName: 'Carl',
  lastName: 'Smith',
  healthCenter: {
    id: 'healthCenterId',
    name: 'My Health Center',
  },
  addresses: [
    {
      key: 'primary',
      address1: 'address1',
      address2: 'address2',

      country: 'NZ',
    },
  ],
  contactDetails: [
    {
      key: 'primary',
      phone: '012345',
      mobile: '+023456',
      email: 'email',
      website: 'website',
    },
  ],
  socioEconomics: {
    education: 'education',
    occupation: 'occupation',
    literate: 'literate',
  },

  family: {
    maritalStatus: 'single',

    nextOfKin: {
      id: 'nextOfKinId',
      firstName: 'namekin',
      lastName: 'lastNameKin',
      addresses: [],
      contactDetails: [],
      socioEconomics: {},
    },
    caregiver: {
      id: 'cargiverId',
      firstName: 'caregiver',
      lastName: 'caregiverLastName',
      addresses: [],
      contactDetails: [],
      socioEconomics: {},
    },

    mother: {
      id: 'motherId',
      firstName: 'mother',
      lastName: 'motherLastName',
      addresses: [],
      contactDetails: [],
      socioEconomics: {},
    },
  },
};
