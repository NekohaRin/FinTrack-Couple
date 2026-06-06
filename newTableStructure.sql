-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  display_name text,
  avatar_url text,
  theme_color text DEFAULT '#7F77DD'::text,
  dashboard_layout jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.couples (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user1_id uuid NOT NULL,
  user2_id uuid,
  invite_code text NOT NULL UNIQUE,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'disconnected'::text])),
  visibility_consent boolean DEFAULT true,
  linked_at timestamp with time zone,
  CONSTRAINT couples_pkey PRIMARY KEY (id),
  CONSTRAINT couples_user1_id_fkey FOREIGN KEY (user1_id) REFERENCES public.profiles(user_id),
  CONSTRAINT couples_user2_id_fkey FOREIGN KEY (user2_id) REFERENCES public.profiles(user_id)
);
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  icon text DEFAULT 'tag'::text,
  color text DEFAULT '#888780'::text,
  scope text DEFAULT 'personal'::text CHECK (scope = ANY (ARRAY['personal'::text, 'shared'::text])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(user_id)
);
CREATE TABLE public.transactions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category_id uuid,
  amount numeric NOT NULL CHECK (amount <> 0::numeric),
  type text NOT NULL CHECK (type = ANY (ARRAY['income'::text, 'expense'::text])),
  note text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT transactions_pkey PRIMARY KEY (id),
  CONSTRAINT transactions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id),
  CONSTRAINT transactions_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.budgets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category_id uuid NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  period text DEFAULT 'monthly'::text CHECK (period = ANY (ARRAY['monthly'::text, 'weekly'::text])),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  CONSTRAINT budgets_pkey PRIMARY KEY (id),
  CONSTRAINT budgets_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(user_id),
  CONSTRAINT budgets_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.shared_wallet (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL,
  added_by uuid NOT NULL,
  category_id uuid,
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  type text NOT NULL CHECK (type = ANY (ARRAY['income'::text, 'expense'::text])),
  note text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT shared_wallet_pkey PRIMARY KEY (id),
  CONSTRAINT shared_wallet_couple_id_fkey FOREIGN KEY (couple_id) REFERENCES public.couples(id),
  CONSTRAINT shared_wallet_added_by_fkey FOREIGN KEY (added_by) REFERENCES public.profiles(user_id),
  CONSTRAINT shared_wallet_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id)
);
CREATE TABLE public.wishlist_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL,
  added_by uuid NOT NULL,
  title text NOT NULL,
  target_price numeric,
  saved_amount numeric DEFAULT 0,
  priority_votes integer DEFAULT 0,
  status text DEFAULT 'active'::text CHECK (status = ANY (ARRAY['active'::text, 'achieved'::text])),
  created_at timestamp with time zone DEFAULT now(),
  product_link text,
  maps_link text,
  emoji text DEFAULT '🎯'::text,
  category text DEFAULT 'liburan'::text,
  note text,
  CONSTRAINT wishlist_items_pkey PRIMARY KEY (id),
  CONSTRAINT wishlist_items_couple_id_fkey FOREIGN KEY (couple_id) REFERENCES public.couples(id),
  CONSTRAINT wishlist_items_added_by_fkey FOREIGN KEY (added_by) REFERENCES public.profiles(user_id)
);
CREATE TABLE public.savings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL,
  added_by uuid NOT NULL,
  amount numeric NOT NULL,
  note text,
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamp with time zone DEFAULT now(),
  wishlist_item_id uuid,
  CONSTRAINT savings_pkey PRIMARY KEY (id),
  CONSTRAINT savings_couple_id_fkey FOREIGN KEY (couple_id) REFERENCES public.couples(id),
  CONSTRAINT savings_added_by_fkey FOREIGN KEY (added_by) REFERENCES public.profiles(user_id),
  CONSTRAINT savings_wishlist_item_id_fkey FOREIGN KEY (wishlist_item_id) REFERENCES public.wishlist_items(id)
);