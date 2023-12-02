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
