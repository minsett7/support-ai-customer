export interface Message {
  id: string;
  sender: 'customer' | 'agent' | 'system';
  senderName: string;
  text: string;
  timestamp: string;
  attachments?: string[];
}

export type TicketStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Waiting for Customer'
  | 'Agent Replied'
  | 'Resolved'
  | 'Closed';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Ticket {
  id: string;
  subject: string;
  customerName: string;
  customerEmail: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  created: string;
  lastUpdated: string;
  message: string;
  conversation: Message[];
  attachments?: string[];
}

export interface Section {
  title: string;
  body: string;
}

export interface HelpArticle {
  id: string;
  title: string;
  category: string;
  summary: string;
  updatedDate: string;
  contentSections: Section[];
  helpfulCount?: number;
  unhelpfulCount?: number;
}

export interface NotificationItem {
  id: string;
  ticketId?: string;
  subject: string;
  body: string;
  timestamp: string;
  isRead: boolean;
  type: 'email' | 'system';
}
