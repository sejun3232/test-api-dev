import { Schema, model, Document } from 'mongoose';

interface ILogChannel extends Document {
  guildID: string;
  channelID: string;
  eventType: string;
  enabled: boolean;
}

const logChannelSchema = new Schema<ILogChannel>({
  guildID: { type: String, required: true },
  channelID: { type: String, required: true },
  eventType: { type: String, required: true }, // 예: "join", "leave", "warn" 등
  enabled: { type: Boolean, default: true },
});

const LogChannel = model<ILogChannel>('LogChannel', logChannelSchema);

export default LogChannel;
export { ILogChannel };