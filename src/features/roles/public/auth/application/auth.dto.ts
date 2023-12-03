export type EmailDataDTO = {
  email: string;
  code: string;
  letterTitle: string;
  letterText: string;
  codeText: string;
};

//registration types
export type RegistrationUserResultDTO = {
  isLoginAlreadyExist: boolean;
  isEmailAlreadyExist: boolean;
  isUserRegistered: boolean,
  isUserCreated: boolean,
};
export type RegistrationUserDTO = {
  login: string;
  password: string;
  email: string;
};

// registration confirmation types
export type RegistrationConfirmationResultDTO = {
  isUserByConfirmCodeFound: boolean;
  isEmailAlreadyConfirmed: boolean;
  isConfirmDateExpired: boolean;
  isRegistrationConfirmed: boolean;
};
export type RegistrationConfirmationDTO = {
  code: string;
};
