import mongoose, { Schema, Document } from "mongoose";

export interface IContract extends Document {
  // Hospital Details
  hospitalName: string;
  hospitalAddress: string;
  country: string;
  city: string;
  postalCode: string;
  contactPerson: string;
  email: string;
  phone: string;
  hospitalType: string;
  bedCapacity: number;

  // Medicines
  medicines: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    pricePerUnit: number;
    description?: string;
  }[];

  // Contract Terms
  startDate: Date;
  endDate: Date;
  contractValue: number;
  paymentTerms: string;
  deliverySchedule: string;

  // Stakeholders
  stakeholders: {
    name: string;
    role: string;
    email: string;
    phone: string;
  }[];

  // Other Terms
  specialTerms?: string;
  renewalOption: boolean;

  // Metadata
  status: "draft" | "active" | "expired" | "pending";
  createdAt: Date;
  updatedAt: Date;
}

const ContractSchema = new Schema<IContract>(
  {
    // Hospital
    hospitalName: { type: String, required: true },
    hospitalAddress: { type: String, required: true },
    country: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    contactPerson: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    hospitalType: { type: String, required: true },
    bedCapacity: { type: Number, required: true },

    // Medicines
    medicines: [
      {
        name: { type: String, required: true },
        category: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true },
        pricePerUnit: { type: Number, required: true },
        description: { type: String },
      },
    ],

    // Contract Terms
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    contractValue: { type: Number, required: true },
    paymentTerms: { type: String, required: true },
    deliverySchedule: { type: String, required: true },

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
    renewalOption: { type: Boolean, required: true },

    // Metadata
    status: {
      type: String,
      enum: ["draft", "active", "expired", "pending"],
      default: "draft",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IContract>("Contract", ContractSchema);
