import mongoose, { Schema, Document } from "mongoose";

export interface IContract extends Document {
  // Hospital Details
  tenderTitle: string;
  tenderId: string;
  country: string;
  region: string;
  contactPerson: string;
  email: string;
  phone: string;

  // Medicines
  medicines: {
    code: string;
    desc: string;
    quantity: number;
    livery: string;
    pricePerUnit: number;
    description: string;
    status: "active" | "terminated";
  }[];

  // Contract Terms
  startDate: Date;
  endDate: Date;
  originalEndDate: Date;
  tenderValue: number;
  demandFrequency: string;

  // Stakeholders
  stakeholders: {
    name: string;
    role: string;
    email: string;
    phone: string;
  }[];

  // Other Terms
  specialTerms?: string; //

  // Metadata
  status: "active" | "upcoming" | "expired" | "draft" | "terminated";
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    // Hospital
    tenderTitle: { type: String, required: true },
    tenderId: { type: String, required: true, unique: true },
    country: { type: String, required: true },
    region: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },

    // Medicines
    medicines: [
      {
        code: { type: String, required: true },
        desc: { type: String, required: true },
        quantity: { type: Number, required: true },
        livery: { type: String, required: true },
        pricePerUnit: { type: Number, required: true },
        description: { type: String },
        status: {
          type: String,
          enum: ["active", "terminated"],
          default: "active",
        },
      },
    ],

    // Contract Terms
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    originalEndDate: { type: Date, required: true },
    tenderValue: { type: Number, required: true },
    demandFrequency: { type: String, required: true },

    // Stakeholders
    stakeholders: [
      {
        name: { type: String, required: true },
        role: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
      },
    ],

    // Other Terms
    specialTerms: { type: String },

    // Metadata
    createdBy: { type: String, required: true },
    status: {
      type: String,
      enum: ["active", "upcoming", "expired", "draft", "terminated"],
      default: "draft",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IContract>("Contract", ContractSchema);
