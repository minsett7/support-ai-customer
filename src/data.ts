import { HelpArticle, Ticket, NotificationItem } from './types';

export const MOCK_CUSTOMER = {
  name: "John Smith",
  email: "john@example.com",
  plan: "Premium",
};

export const MOCK_TICKETS: Ticket[] = [
  {
    id: "TCK-001",
    subject: "Charged twice and still no refund",
    customerName: "John Smith",
    customerEmail: "john@example.com",
    category: "Billing & Refunds",
    priority: "High",
    status: "Under Review",
    created: "2026-06-08T04:20:00Z", // Today, about 38 mins ago relative to 04:58:53
    lastUpdated: "2026-06-08T04:48:53Z", // 10 mins ago
    message: "I was charged twice yesterday and I still have not received my refund. This is really frustrating.",
    attachments: ["receipt_duplicate_charge.pdf"],
    conversation: [
      {
        id: "msg-1",
        sender: "customer",
        senderName: "John Smith",
        text: "I was charged twice yesterday and I still have not received my refund. This is really frustrating.",
        timestamp: "2026-06-08T04:20:00Z",
        attachments: ["receipt_duplicate_charge.pdf"]
      },
      {
        id: "msg-2",
        sender: "agent",
        senderName: "Sarah (Support Specialist)",
        text: "Hi John, I’m sorry for the trouble. I understand how frustrating a duplicate charge can be. Could you please share the transaction ID or payment receipt so we can verify the payment and help process the refund if the duplicate charge is confirmed?",
        timestamp: "2026-06-08T04:48:53Z"
      }
    ]
  },
  {
    id: "TCK-002",
    subject: "Cannot log in to my account",
    customerName: "John Smith",
    customerEmail: "john@example.com",
    category: "Account & Login",
    priority: "Medium",
    status: "Agent Replied",
    created: "2026-06-07T10:15:00Z", // Yesterday
    lastUpdated: "2026-06-07T14:30:00Z",
    message: "I can't log in to my account. It says password incorrect but resetting password doesn't send the email.",
    conversation: [
      {
        id: "msg-3",
        sender: "customer",
        senderName: "John Smith",
        text: "I can't log in to my account. It says password incorrect but resetting password doesn't send the email.",
        timestamp: "2026-06-07T10:15:00Z"
      },
      {
        id: "msg-4",
        sender: "agent",
        senderName: "Michael (Account Security)",
        text: "Hi John, I have checked your registration and it seems there was a typo in the email address in our database (entered as john.s@... instead of john@...). I have corrected this to john@example.com. Could you please try resetting your password now? You should receive the email in seconds.",
        timestamp: "2026-06-07T14:30:00Z"
      }
    ]
  },
  {
    id: "TCK-003",
    subject: "API key not working",
    customerName: "John Smith",
    customerEmail: "john@example.com",
    category: "Technical Issue",
    priority: "High",
    status: "Waiting for Customer",
    created: "2026-06-06T09:00:00Z", // 2 days ago
    lastUpdated: "2026-06-06T11:45:00Z",
    message: "I am trying to run an integration using my API key and it keeps returning a 403 Forbidden error.",
    conversation: [
      {
        id: "msg-5",
        sender: "customer",
        senderName: "John Smith",
        text: "I am trying to run an integration using my API key and it keeps returning a 403 Forbidden error.",
        timestamp: "2026-06-06T09:00:00Z"
      },
      {
        id: "msg-6",
        sender: "agent",
        senderName: "David (Developer Support)",
        text: "Hi John, I see that your API key is currently restricted to the 'Development' phase which has a limit of 5 requests per minute, and doesn't have access to the production endpoint 'https://api.example.com/v1/live'. Could you check if you are targeting the sandbox endpoint or if you have exceeded the developer rate limit?",
        timestamp: "2026-06-06T11:45:00Z"
      }
    ]
  }
];

export const MOCK_ARTICLES: HelpArticle[] = [
  {
    id: "art-1",
    title: "What to do if you were charged twice",
    category: "Billing & Refunds",
    summary: "Instructions on verifying duplicate pending charges and initiating a refund request.",
    updatedDate: "June 1, 2026",
    helpfulCount: 342,
    unhelpfulCount: 12,
    contentSections: [
      {
        title: "Check your payment history",
        body: "Login to your bank or credit card dashboard and review your transactions list. Sometimes, a single order might trigger two notifications if the page was refreshed during check out, or if there is a pending pre-authorization hold."
      },
      {
        title: "Wait for pending authorization to clear",
        body: "Many temporary duplicate charges are 'authorization holds' created by payment processors to verify funds. These typically disappear or merge into a single settled transaction within 2 to 5 business days."
      },
      {
        title: "Prepare your transaction ID or receipt",
        body: "If both charges of identical amounts transition from 'Pending' to 'Settled' or 'Cleared', locate the transaction IDs, invoice reference numbers, or keep a copy of your bank statement screenshot showing both charges with matching dates."
      },
      {
        title: "Submit a billing ticket",
        body: "Use our ticket submission page and specify 'Billing & Refunds' as the category. Supply your transaction records so that our customer finance team can quickly trigger a refund directly to your original payment method."
      },
      {
        title: "When to contact support",
        body: "If the duplicate charges don't fall off within 5 business days, please open our Live Chat or submit a priority Billing Ticket with the proof of double settlement."
      }
    ]
  },
  {
    id: "art-2",
    title: "How refund verification works",
    category: "Billing & Refunds",
    summary: "Understand our step-by-step verification window and timeline for processing returned payments.",
    updatedDate: "May 28, 2026",
    helpfulCount: 198,
    unhelpfulCount: 5,
    contentSections: [
      {
        title: "Initiation",
        body: "Once you submit a ticket with a receipt, our finance team reviews the transaction ID in our payment gateway (eg. Stripe or PayPal) to verify the double payment."
      },
      {
        title: "Verification Window",
        body: "Verification is completed within 24 hours of ticket submission. We will notify you electronically as soon as the refund is approved."
      },
      {
        title: "Banking Hold Times",
        body: "After we trigger the refund, banks take between 5 to 10 standard business days to reflect the credit back to your credit card statement or bank ledger."
      }
    ]
  },
  {
    id: "art-3",
    title: "How to reset your password",
    category: "Account & Login",
    summary: "Simple steps for resetting a forgotten password and securing your dashboard credentials.",
    updatedDate: "April 15, 2026",
    helpfulCount: 512,
    unhelpfulCount: 20,
    contentSections: [
      {
        title: "Access the password reset portal",
        body: "If you are logged out, click 'Forgot Password' beneath our main sign-in form. Enter the exact email address linked to your account."
      },
      {
        title: "Check spam and filters",
        body: "Wait up to 2 minutes for the recovery link. If it hasn't arrived, check spam, promotional tab, or security filters for a subject line containing 'Reset your Password'."
      },
      {
        title: "Set a strong passphrase",
        body: "Passwords must contain at least 10 characters, including big letters, digits, and a select symbol to meet security guidelines."
      }
    ]
  },
  {
    id: "art-4",
    title: "How to recover your account",
    category: "Account & Login",
    summary: "Locked out due to lost two-factor authentication or an unrecognized login? Follow these recovery trails.",
    updatedDate: "April 29, 2026",
    helpfulCount: 220,
    unhelpfulCount: 15,
    contentSections: [
      {
        title: "Locate back-up codes",
        body: "When enabling 2FA, you were given 8-digit emergency recovery codes. Entering any of these in the code screen will grant bypass access."
      },
      {
        title: "Submit a secure identity ticket",
        body: "If you have lost backup keys and cannot log in, contact Account Recovery. We will request proof of identification (corporate domain email check, invoice matching, or billing cards) to securely verify ownership."
      }
    ]
  },
  {
    id: "art-5",
    title: "Login troubleshooting guide",
    category: "Account & Login",
    summary: "Resolve common login errors, browser cookie conflict issues, and account lockouts.",
    updatedDate: "May 10, 2026",
    helpfulCount: 405,
    unhelpfulCount: 28,
    contentSections: [
      {
        title: "Clear Cache and Cookies",
        body: "Outdated browser sessions often fail due to stale authentication tokens. Use an Incognito window or clear browser storage, then attempt to login again."
      },
      {
        title: "SSO / Google Identity conflict",
        body: "If your organization forces SSO or Google authentication, standard password recovery yields no effect. Utilize the 'Sign in with Google' option specifically."
      }
    ]
  },
  {
    id: "art-6",
    title: "How to contact billing support",
    category: "Billing & Refunds",
    summary: "Learn about the billing support operating hours and materials to speed up resolution.",
    updatedDate: "May 15, 2026",
    helpfulCount: 124,
    unhelpfulCount: 4,
    contentSections: [
      {
        title: "Priority Billing Hours",
        body: "Our credit and billing desks are active from Monday through Friday, 9:00 AM to 6:00 PM UTC. Tickets made after hours are queued for first-thing morning triage."
      },
      {
        title: "Required information",
        body: "To speak with billing, please specify: Last 4 digits of credit card on file, matching billing zip code, and billing email."
      }
    ]
  },
  {
    id: "art-7",
    title: "How to upload payment receipts",
    category: "Billing & Refunds",
    summary: "A practical guide to securing and attaching screenshot receipts to speed up refund requests.",
    updatedDate: "June 03, 2026",
    helpfulCount: 89,
    unhelpfulCount: 2,
    contentSections: [
      {
        title: "Accepted formats",
        body: "We support receipt uploads in JPEG, PNG, PDF, CSV, and standard web screenshots up to 10MB."
      },
      {
        title: "Privacy guard",
        body: "For security compliance, mask your complete credit card numbers and personal SSNs before uploading. Visible transaction timestamps and currency metrics must remain clear."
      }
    ]
  },
  {
    id: "art-8",
    title: "How to report a security issue",
    category: "Security",
    summary: "Report suspected data breaches, API key exposures, or unauthorized logins to our emergency response system.",
    updatedDate: "May 12, 2026",
    helpfulCount: 165,
    unhelpfulCount: 3,
    contentSections: [
      {
        title: "Immediate isolation",
        body: "If you detect an unauthorized login, head instantly to the active sessions monitor inside your settings and click 'Revoke All Sessions' to lock out potential intruders."
      },
      {
        title: "Emergency reporting channel",
        body: "For security events, choose 'Security Concern' with an Urgent flag in our ticket form. This escalates automatically to our 24/7 Security Operations Center (SOC)."
      }
    ]
  },
  {
    id: "art-9",
    title: "How to troubleshoot API key issues",
    category: "API & Integrations",
    summary: "Resolve standard developer API error codes like 403 Forbidden, rate limit excesses, and context bounds.",
    updatedDate: "May 25, 2026",
    helpfulCount: 290,
    unhelpfulCount: 9,
    contentSections: [
      {
        title: "Invalid Header / Bearer Format",
        body: "API calls mandate authorization headers formatted as 'Authorization: Bearer <API_KEY>'. Check that no whitespace, quotes, or trailing slashes are slipped in."
      },
      {
        title: "IP Whitelisting restrictions",
        body: "If your security keys have IP whitelists enabled, calls descending from unwhitelisted server farms or local VPNs provoke immediate 403 blocks."
      }
    ]
  },
  {
    id: "art-10",
    title: "How to check payment status",
    category: "Orders & Payments",
    summary: "Check if your order is pending processing, paid, or failed to clear standard authorization gateways.",
    updatedDate: "June 05, 2026",
    helpfulCount: 110,
    unhelpfulCount: 1,
    contentSections: [
      {
        title: "Order receipts status",
        body: "When you purchase, structured invoices are shot out electronic post. If the transaction fails, the email contains a specific failure log: 'nsufficient Funds' or 'Verification Gateway Fail'."
      },
      {
        title: "Updating payment routes",
        body: "If subscription payments decline twice, accounts enter a graceful 7-day retry period. Update cards via the dashboard to trigger natural retry runs."
      }
    ]
  }
];

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-init",
    ticketId: "TCK-001",
    subject: "Your support ticket TCK-001 has been received",
    body: "Hi John, we received your support request about 'Charged twice and still no refund.' Our support team will review it and reply as soon as possible.\n\nTicket Status: Under Review\nEst. Response: Within 24 hours",
    timestamp: "2026-06-08T04:21:00Z",
    isRead: false,
    type: "email"
  }
];
