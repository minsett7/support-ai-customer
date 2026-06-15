  create extension if not exists pgcrypto;

  create table if not exists support_tickets (
    id uuid primary key default gen_random_uuid(),
    tracking_code text not null unique,
    customer_full_name text not null,
    category text not null,
    priority text not null default 'medium',
    subject text not null,
    description text not null,
    status text not null default 'submitted',
    assigned_agent_id text null,
    created_at timestamp with time zone not null default now(),
    accepted_at timestamp with time zone null,
    updated_at timestamp with time zone not null default now(),
    resolved_at timestamp with time zone null,
    closed_at timestamp with time zone null,
    constraint support_tickets_status_check
      check (status in ('submitted', 'accepted', 'in_progress', 'resolved', 'closed')),
    constraint support_tickets_priority_check
      check (priority in ('high', 'medium', 'low')),
    constraint support_tickets_customer_name_length_check
      check (char_length(customer_full_name) between 1 and 100),
    constraint support_tickets_category_length_check
      check (char_length(category) between 1 and 80),
    constraint support_tickets_subject_length_check
      check (char_length(subject) between 1 and 150),
    constraint support_tickets_description_length_check
      check (char_length(description) between 1 and 2000)
  );

  alter table support_tickets
    add column if not exists priority text not null default 'medium';

  do $$
  begin
    if not exists (
      select 1
      from pg_constraint
      where conname = 'support_tickets_priority_check'
    ) then
      alter table support_tickets
        add constraint support_tickets_priority_check
        check (priority in ('high', 'medium', 'low'));
    end if;
  end
  $$;

  create table if not exists support_ticket_replies (
    id uuid primary key default gen_random_uuid(),
    ticket_id uuid not null references support_tickets(id) on delete cascade,
    tracking_code text not null,
    sender_type text not null default 'agent',
    sender_id text null,
    sender_name text not null,
    message text not null,
    created_at timestamp with time zone not null default now(),
    constraint support_ticket_replies_sender_type_check
      check (sender_type in ('customer', 'agent', 'system')),
    constraint support_ticket_replies_sender_name_length_check
      check (char_length(sender_name) between 1 and 100),
    constraint support_ticket_replies_message_length_check
      check (char_length(message) between 1 and 4000)
  );

  create index if not exists idx_support_tickets_tracking_code
    on support_tickets (tracking_code);

  create index if not exists idx_support_tickets_status_created_at
    on support_tickets (status, created_at);

  create index if not exists idx_support_tickets_agent_status
    on support_tickets (assigned_agent_id, status);

  create index if not exists idx_support_ticket_replies_ticket_created_at
    on support_ticket_replies (ticket_id, created_at);

  create index if not exists idx_support_ticket_replies_tracking_code
    on support_ticket_replies (tracking_code);
