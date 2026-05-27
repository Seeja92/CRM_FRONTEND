export interface Company {
  id: number;
  name: string;
  domainName: string;
  owner: string;
  phone: string;
  industry: string;
  type: string;
  city: string;
  country: string;
  noOfEmployees: string;
  annualRevenue: string;
  createdDate: string;
}

export interface CreateCompanyForm {
  domainName: string;
  companyName: string;
  ownerIds: number[];
  industry: string;
  type: string;
  city: string;
  country: string;
  noOfEmployees: string;
  annualRevenue: string;
  email: string;
  phoneNumber: string;
  phoneCode: string;
}