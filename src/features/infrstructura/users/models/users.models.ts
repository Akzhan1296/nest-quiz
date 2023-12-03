export type CreateUserEntryDTO = {
  login: string;
  passwordHash: string;
  email: string;
};

export type RegistrationEntryDTO = {
  userId: {Id: string};
  confirmCode: string;
  isConfirmed: boolean;
  emailExpDate: Date;
  createdAt: Date;
};

export type ConfirmRegistrationEntryDTO = {
  confirmCode: string,
  isConfirmed: boolean
}

export type RegistrationViewDTO = {
  createdAt: Date;
  emailExpDate: Date;
  isConfirmed: boolean;
  confirmCode: string;
  registrationId: string;
}

export type UserViewDTO = {
  id: string;
  login: string;
  password: string;
  email: string;
}