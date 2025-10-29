import mongoose, { Schema, Document } from "mongoose";

export interface IActivityLog extends Document {
  tenderId: mongoose.Types.ObjectId;
  type: "created" | "edited" | "fulfilled" | "terminated" | "extended" | "deleted" | "activated" | "expired";
  title: string;
  description: string;
  user: {
    name: string;
    email: string;
    role: string;
  };
  timestamp: Date;
  metadata?: Record<string, any>;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    tenderId: { type: Schema.Types.ObjectId, ref: "Contract", required: true },
    type: {
      type: String,
      enum: ["created", "edited", "fulfilled", "terminated", "extended", "deleted", "activated", "expired"],
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String },
    user: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      role: { type: String, required: true },
    },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: Map, of: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model<IActivityLog>("ActivityLog", activityLogSchema);
