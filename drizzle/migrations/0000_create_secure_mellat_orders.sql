CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number bigint GENERATED ALWAYS AS IDENTITY,
  access_token_hash text NOT NULL UNIQUE,
  customer_name text NOT NULL,
  mobile text NOT NULL,
  province text NOT NULL,
  city text NOT NULL,
  address text NOT NULL,
  postal_code text NOT NULL,
  notes text,
  total_toman bigint NOT NULL CHECK (total_toman > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'reversed')),
  payment_provider text NOT NULL DEFAULT 'mellat' CHECK (payment_provider = 'mellat'),
  provider_ref_id text UNIQUE,
  sale_reference_id text,
  failure_code text,
  paid_at timestamptz,
  settled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.orders TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.orders_order_number_seq TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_slug text NOT NULL,
  product_name text NOT NULL,
  color text NOT NULL,
  option text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0 AND quantity <= 20),
  unit_price_toman integer NOT NULL CHECK (unit_price_toman > 0),
  line_total_toman bigint NOT NULL CHECK (line_total_toman > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  event text NOT NULL CHECK (event IN ('created', 'redirected', 'callback_failed', 'verified', 'settled', 'verification_failed', 'reversed')),
  response_code text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.payment_events TO service_role;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

CREATE INDEX order_items_order_id_idx ON public.order_items(order_id);
CREATE INDEX payment_events_order_id_idx ON public.payment_events(order_id);