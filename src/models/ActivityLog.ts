import mongoose, { Schema, Document } from "mongoose";

export interface IActivityLog extends Document {
  tenderId: mongoose.Types.ObjectId;
  type: "created" | "edited" | "fulfilled" | "terminated" | "extended" | "deleted";
  title: string;
  description: string;
  user: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    tenderId: { type: Schema.Types.ObjectId, ref: "Contract", required: true },
    type: {
      type: String,
      enum: ["created", "edited", "fulfilled", "terminated", "extended", "deleted"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    user: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: Map, of: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model<IActivityLog>("ActivityLog", activityLogSchema);
