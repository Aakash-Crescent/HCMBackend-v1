import mongoose, { Schema, Document } from "mongoose";

export interface IContract extends Document {
  title: string;
  vendor: string;
  value: number;
  status: "active" | "pending" | "expired" | "draft";
  startDate: Date;
  endDate: Date;
  description: string;
  contractType: string;
  department: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  fullData?: any;
}

const contractSchema = new Schema<IContract>(
  {
    title: { type: String, required: true },
    vendor: { type: String, required: true },
    value: { type: Number, required: true },
    status: {
      type: String,
      enum: ["active", "pending", "expired", "draft"],
      default: "draft",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String },
    contractType: { type: String, required: true },
    department: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    createdBy: { type: String, required: true },
    fullData: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model<IContract>("Contract", contractSchema);
