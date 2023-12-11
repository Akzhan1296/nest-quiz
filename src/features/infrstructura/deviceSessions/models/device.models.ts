export type AuthMetaDataEntryDTO = {
  email: string;
  login: string;
  deviceIp: string;
  deviceId: string;
  deviceName: string;
  createdAt: Date; // main field to detect different RT
  userId: string;
};
