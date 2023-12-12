export interface AuthMetaDataEntryDTO {
  email: string;
  login: string;
  deviceIp: string;
  deviceId: string;
  deviceName: string;
  createdAt: Date; // main field to detect different RT
  userId: string;
}

export interface AuthMetaDataViewModel extends AuthMetaDataEntryDTO {
  id: string;
}
