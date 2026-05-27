// src/types/lead.types.ts

export type LeadStatus =
  | "Open"
  | "New"
  | "In Progress"
  | "Qualified"
  | "Converted"
  | "Unqualified"
  | "Attempted to Contact"
  | "Contacted"
  | "Closed";

export interface Lead {
  id: number;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  createdDate: string;
  status: LeadStatus;
  jobTitle?: string;
  contactOwner?: string;
  companyName?:string;
}

export interface LeadFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  jobTitle: string;
  contactOwner: string;
  leadStatus: string;
  companyName?:string;
}