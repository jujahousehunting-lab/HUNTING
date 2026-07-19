/*
# House Hunting App Schema (Juja)

1. New Tables
- `profiles` — extends auth.users with a role (seeker | landlord) and full name.
- `listings` — rental properties posted by landlords/caretakers. Building name is gated behind payment.
- `unlocks` — records when a seeker pays to reveal a listing's building name.

2. Security
- Enable RLS on all tables.
- profiles: owner can read/update/insert own.
- listings: all authenticated can SELECT (seekers browse); only owner landlord can INSERT/UPDATE/DELETE.
- unlocks: seeker can read/insert/delete own; building name gating is enforced in the frontend based on unlock row existence.

3. Important Notes
- Multi-user app with sign-in. Owner columns default to auth.uid().
- Policies scoped TO authenticated.
*/

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('seeker', 'landlord')),
  phone text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  building_name text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  location text NOT NULL,
  property_type text NOT NULL CHECK (property_type IN ('bedsitter', '1br', '2br', '3br', 'studio', 'single')),
  bedrooms int NOT NULL DEFAULT 0,
  bathrooms int NOT NULL DEFAULT 1,
  image_url text NOT NULL,
  gallery text[] DEFAULT '{}',
  available boolean NOT NULL DEFAULT true,
  unlocked_price numeric NOT NULL DEFAULT 100 CHECK (unlocked_price >= 0),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_listings" ON listings;
CREATE POLICY "select_listings" ON listings FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_listings" ON listings;
CREATE POLICY "insert_own_listings" ON listings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = landlord_id);

DROP POLICY IF EXISTS "update_own_listings" ON listings;
CREATE POLICY "update_own_listings" ON listings FOR UPDATE
  TO authenticated USING (auth.uid() = landlord_id) WITH CHECK (auth.uid() = landlord_id);

DROP POLICY IF EXISTS "delete_own_listings" ON listings;
CREATE POLICY "delete_own_listings" ON listings FOR DELETE
  TO authenticated USING (auth.uid() = landlord_id);

-- Unlocks table
CREATE TABLE IF NOT EXISTS unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seeker_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id uuid NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  amount_paid numeric NOT NULL CHECK (amount_paid >= 0),
  payment_method text NOT NULL CHECK (payment_method IN ('mpesa', 'card')),
  mpesa_code text,
  created_at timestamptz DEFAULT now(),
  UNIQUE (seeker_id, listing_id)
);

ALTER TABLE unlocks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_unlocks" ON unlocks;
CREATE POLICY "select_own_unlocks" ON unlocks FOR SELECT
  TO authenticated USING (auth.uid() = seeker_id);

DROP POLICY IF EXISTS "insert_own_unlocks" ON unlocks;
CREATE POLICY "insert_own_unlocks" ON unlocks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = seeker_id);

DROP POLICY IF EXISTS "delete_own_unlocks" ON unlocks;
CREATE POLICY "delete_own_unlocks" ON unlocks FOR DELETE
  TO authenticated USING (auth.uid() = seeker_id);

CREATE INDEX IF NOT EXISTS idx_unlocks_seeker_listing ON unlocks(seeker_id, listing_id);
CREATE INDEX IF NOT EXISTS idx_listings_landlord ON listings(landlord_id);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(location);
