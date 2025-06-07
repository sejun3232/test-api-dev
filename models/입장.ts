import { Schema, model, Document } from 'mongoose';

interface I입장로그 extends Document {
  guildID: string;
  channelID: string;
  eventType: string;
  enabled: boolean;
}

const 입장로그Schema = new Schema<I입장로그>({
  guildID: { type: String, required: true }, // 서버 ID
  channelID: { type: String, required: true }, // 로그를 기록할 채널 ID
  eventType: { type: String, required: true },
  enabled: { type: Boolean, default: false }, // 로그 기능 활성화 여부
});

const 입장로그 = model<I입장로그>("입장로그", 입장로그Schema);

export default 입장로그;
export { I입장로그 };