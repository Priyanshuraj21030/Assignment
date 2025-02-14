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

-- Create enum for link precedence
CREATE TYPE link_precedence AS ENUM ('primary', 'secondary');

-- Create contacts table
CREATE TABLE contacts (
  id BIGSERIAL PRIMARY KEY,
  "phoneNumber" TEXT,
  email TEXT,
  "linkedId" BIGINT REFERENCES contacts(id),
  "linkPrecedence" link_precedence NOT NULL,
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
CREATE POLICY "Enable read access for authenticated users"
  ON contacts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable write access for authenticated users"
  ON contacts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);