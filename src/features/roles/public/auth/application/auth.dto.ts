export type EmailDataDTO = {
    email: string;
    code: string;
    letterTitle: string;
    letterText: string;
    codeText: string;
  };
  
export type RegistrationUserResultDTO = {
  isLoginAlreadyExist: boolean;
  isEmailAlreadyExist: boolean;
}

export type RegistrationUserDTO = {
  login: string;
  password: string;
  email: string;
};