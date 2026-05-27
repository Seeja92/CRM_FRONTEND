export interface Deal {
  id: string;
  dealName: string;
  dealStage: string;
  closeDate: string;
  dealOwner: string;
  amount: number;
  priority?: string;

 associatedLead: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  } | null;
}

export type DealStage =
  | 'Presentation Scheduled'
  | 'Qualified to Buy'
  | 'Contract Sent'
  | 'Closed Won'
  | 'Closed Lost'
  | 'Appointment Scheduled'
  | 'Decision Maker Bought In';