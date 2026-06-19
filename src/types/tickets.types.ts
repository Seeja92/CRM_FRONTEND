
export interface Ticket {
  id: number;
  ticket_name: string;

  company_name?: string;
  deal_name?: string;
  owner_name?: string;

  status: string;
  priority: string;
  source: string;
  created_at: string;

  associated_lead?: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

export interface CreateTicketForm {
  ticketName:  string;
  companyId?:  string
  dealId:      string;
  status:      string;
  source:      string;
  priority:    string;
  ownerId:     string;

}

export interface TicketFormErrors {
  ticketName?: string;
  companyId?:  string;
  dealId?:     string;
  status?:     string;
  source?:     string;
  priority?:   string;
  ownerId?:    string;
}