import { Schema, model, Document } from 'mongoose';

interface IWarning extends Document {
  guildID: string;
  userID: string;
  count: number;
}

const Warning = model<IWarning>(
  "경고",
  new Schema<IWarning>({
    guildID: String,
    userID: String,
    count: Number,
  })
);

export default Warning;
export { IWarning };