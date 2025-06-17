// models/Job.ts
import mongoose, { Document, Model, Schema } from "mongoose";

export interface IJob extends Document {
  title: string;
  location: string;
  type: "Full Time" | "Part Time" | "Internship" | "Contract" | "Remote";
  description: string;
  datePosted: Date;
  jobId: string;
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema<IJob> = new Schema<IJob>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["Full Time", "Part Time", "Internship", "Contract", "Remote"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    datePosted: {
      type: Date,
      required: true,
      default: Date.now,
    },
    jobId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    skills: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model overwrite on hot reloads in development
const Job: Model<IJob> = mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);
export default Job;
