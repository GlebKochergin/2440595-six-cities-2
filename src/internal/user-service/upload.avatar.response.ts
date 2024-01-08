import { Expose } from 'class-transformer';

export default class UploadAvatarResponse {
  @Expose()
  public filepath!: string;
}
