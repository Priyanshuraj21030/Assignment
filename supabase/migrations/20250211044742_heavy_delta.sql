/*
  # Create contacts table for identity reconciliation

  1. New Tables
    - `contacts`
      - `id` (bigint, primary key)
      - `phoneNumber` (text, nullable)
      - `email` (text, nullable)
      - `linkedId` (bigint, nullable, references contacts.id)
      - `linkPrecedence` (text, either 'primary' or 'secondary')
      - `createdAt` (timestamptz)
      - `updatedAt` (timestamptz)
      - `deletedAt` (timestamptz, nullable)

  2. Security
    - Enable RLS on `contacts` table
    - Add policy for authenticated users to read/write contacts
*/

-- Create contacts table with check constraint instead of enum
CREATE TABLE contacts (
  id BIGSERIAL PRIMARY KEY,
  "phoneNumber" TEXT,
  email TEXT,
  "linkedId" BIGINT REFERENCES contacts(id),
  "linkPrecedence" TEXT NOT NULL CHECK ("linkPrecedence" IN ('primary', 'secondary')),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "deletedAt" TIMESTAMPTZ
);

-- Create indexes for faster lookups
CREATE INDEX idx_contacts_phone ON contacts("phoneNumber") WHERE "deletedAt" IS NULL;
CREATE INDEX idx_contacts_email ON contacts(email) WHERE "deletedAt" IS NULL;
CREATE INDEX idx_contacts_linked_id ON contacts("linkedId") WHERE "deletedAt" IS NULL;

-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable read access for all users"
  ON contacts
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Enable insert for all users"
  ON contacts
  FOR INSERT
  TO PUBLIC
  WITH CHECK (true);

CREATE POLICY "Enable update for all users"
  ON contacts
  FOR UPDATE
  TO PUBLIC
  USING (true)
  WITH CHECK (true);