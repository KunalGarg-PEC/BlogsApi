import { ReactNode } from "react";

export interface Education {
    degree: string;
    institution: string;
    score: string;
    completionYear: string;
  }
  
  export interface Experience {
    jobTitle: string;
    employerName: string;
    startDate: string;
    endDate: string;
    currentJob: boolean;
  }
  
  export interface Project {
    title: string;
    description: string;
    date: string;
  }
  
  export interface Application {
    jobId: ReactNode;
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    state?: string;
    city?: string;
    addressLine1?: string;
    isOver18?: string;
    isAuthorizedToWork?: string;
    requiresSponsorship?: string;
    fullName?: string;
    resumePublicId?: string;  
    coverLetterPublicId?: string; 
    resumeUrl?: string;
    coverLetterUrl?: string;
    links?: string[];
    education?: Education[];
    experience?: Experience[];
    projects?: Project[];
    createdAt: Date;
  }