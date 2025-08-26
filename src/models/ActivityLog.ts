import mongoose, { Schema, Document } from "mongoose";

export interface IActivityLog extends Document {
  contractId: mongoose.Types.ObjectId;
  type: "created" | "edited" | "activated" | "terminated" | "extended" | "payment" | "reminder";
  title: string;
  description: string;
  user: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

const activityLogSchema = new Schema<IActivityLog>(
  {
    contractId: { type: Schema.Types.ObjectId, ref: "Contract", required: true },
    type: {
      type: String,
      enum: ["created", "edited", "activated", "terminated", "extended", "payment", "reminder"],
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
