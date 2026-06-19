
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
  city?: string; 
  contactOwner?: number;
  companyName?:string;
}

export interface LeadFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  jobTitle: string;
  contactOwner: number;
  leadStatus: string;
  companyName?:string;
  city?: string; 
}