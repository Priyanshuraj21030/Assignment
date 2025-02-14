# Bitespeed Identity Reconciliation

A service that identifies and links customer contacts across multiple purchases using Node.js, TypeScript, Express.js, and PostgreSQL with Prisma ORM.

## Project Structure

```
project/
├── src/
│   ├── routes/
│   │   └── identify.ts
│   │   └── contact.ts
│   │   └── validate.ts
│   └── index.ts
├── prisma/
│   └── schema.prisma
├── tests/
├── package.json
└── tsconfig.json
```

## Database Schema

```prisma
model Contact {
  id             Int       @id @default(autoincrement())
  phoneNumber    String?
  email          String?
  linkedId       Int?      // References another Contact
  linkPrecedence String    @default("primary") // "primary" | "secondary"
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  deletedAt      DateTime?

  @@index([email])
  @@index([phoneNumber])
  @@index([linkedId])
}
```

### POST /identify

Identifies and consolidates contact information based on email and phone number.

#### Request Format

```json
{
  "email": "string?",
  "phoneNumber": "string?"
}
```

#### Success Response (200)

```json
{
  "contact": {
    "primaryContactId": number,
    "emails": string[],
    "phoneNumbers": string[],
    "secondaryContactIds": number[]
  }
}
```

#### Error Responses

- `400 Bad Request`: Invalid input data
  ```json
  {
    "error": "Invalid request",
    "details": ["At least one of email or phoneNumber must be provided"]
  }
  ```
- `500 Internal Server Error`: Server-side error

#### Example Usage

```bash
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "lorraine@hillvalley.edu",
    "phoneNumber": "123456"
  }'
```

## Business Logic

The service implements the following identity reconciliation rules:

1. **New Contact Creation**

   - Creates a new primary contact if no matching contact exists

2. **Contact Linking**

   - Links contacts that share either email or phone number
   - The oldest contact becomes the primary contact
   - Newer contacts become secondary contacts

3. **Contact Merging**

   - When two primary contacts are found to be related, they are merged
   - The older contact remains primary
   - The newer contact becomes secondary

4. **Response Ordering**
   - Primary contact's email and phone number appear first in arrays
   - Secondary contact information follows

## Setup Instructions

1. **Clone the repository**

```bash
git clone [your-repo-url]
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment**
   Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/identity_reconciliation"
PORT=3000
```

4. **Database setup**

```bash
npx prisma generate
npx prisma db push
```

5. **Run development server**

```bash
npm run dev
```

## Development Commands

```bash
# Start development server
npm run dev

# Run tests
npm run test
```

## Error Handling

The service includes comprehensive error handling:

- Request validation using Zod
- Database error handling
- Runtime error catching
- Input validation middleware
- Detailed error responses

## Logging

The service implements logging for:

- API requests and responses
- Error tracking
- Database operations
- Performance metrics

## Production Deployment

1. **Set production environment variables**

- DATABASE_URL
- PORT
- NODE_ENV=production

2. **Start the server**

```bash
npm start
```

## Testing

The service includes tests for:

- API endpoints
- Business logic
- Data validation
- Error handling

Run tests with:

```bash
npm run test
```

## Running the Service

1. After starting the server with `npm run dev`, you should see:

```bash
Server is running on port 3000
Connected to database successfully
```

2. Test the API using curl:

```bash
# Test with both email and phone
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phoneNumber": "1234567890"
  }'

# Test with email only
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'

# Test with phone only
curl -X POST http://localhost:3000/identify \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "1234567890"
  }'
```

3. Example Response:

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["test@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
  }
}
```

4. You can also test using tools like:

   - Postman
   - Thunder Client (VS Code Extension)
   - Your browser's developer tools

5. Common test scenarios:
   - Create a new contact
   - Link a new contact to existing one
   - Merge two primary contacts
   - Retrieve consolidated contact information


#### Success Scenarios

1. **Create New Contact**

```bash
curl -X POST http://localhost:3000/identify \
-H "Content-Type: application/json" \
-d '{
  "email": "test@example.com",
  "phoneNumber": "1234567890"
}'
```

2. **Link Existing Contacts**

```bash
curl -X POST http://localhost:3000/identify \
-H "Content-Type: application/json" \
-d '{
  "email": "test2@example.com",
  "phoneNumber": "1234567890"
}'
```

#### Error Scenarios

1. **Invalid Email Format**

```bash
curl -X POST http://localhost:3000/identify \
-H "Content-Type: application/json" \
-d '{
  "email": "invalid-email"
}'
```

2. **Missing Required Fields**

```bash
curl -X POST http://localhost:3000/identify \
-H "Content-Type: application/json" \
-d '{}'
```

### Health Check

GET /health - Returns server status

```bash
curl http://localhost:3000/health
```

## Error Codes

- 200: Success
- 400: Bad Request (validation failed)
- 500: Internal Server Error

## Response Formats

### Success Response

```json
{
  "contact": {
    "primaryContactId": number,
    "emails": string[],
    "phoneNumbers": string[],
    "secondaryContactIds": number[]
  }
}
```

### Error Response

```json
{
  "error": string,
  "details": string[] | object
}
```

## Demo & Testing Results

### Test Scenarios with Screenshots

1. **Initial Contact Creation**
   Request:

```json
{
  "email": "test@example.com",
  "phoneNumber": "1234567890"
}
```

Response:

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["test@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": []
  }
}
```

![Initial Contact Creation](./screenshots/initial-commit.png)

2. **Secondary Contact Creation**
   Request:

```json
{
  "email": "test2@example.com",
  "phoneNumber": "1234567890"
}
```

Response:

```json
{
  "contact": {
    "primaryContactId": 1,
    "emails": ["test@example.com", "test2@example.com"],
    "phoneNumbers": ["1234567890"],
    "secondaryContactIds": [2]
  }
}
```

![Secondary Contact Creation](./screenshots/secondary.png)

3. **Query by Email**
   Request:

```json
{
  "email": "test@example.com"
}
```

![Query by Email](./screenshots/email.png)

4. **Query by Phone**
   Request:

```json
{
  "phoneNumber": "1234567890"
}
```

![Query by Phone](./screenshots/phone.png)

5. **Invalid Email Test**
   Request:

```json
{
  "email": "invalid-email"
}
```

![Invalid Email Test](./screenshots/invalid.png)

6. **Empty Request Test**
   Request:

```json
{}
```

![Empty Request Test](./screenshots/empty.png)

### Test Coverage

- ✅ Initial contact creation
- ✅ Secondary contact linking
- ✅ Email query functionality
- ✅ Phone query functionality
- ✅ Error handling (Invalid email)
- ✅ Error handling (Empty request)
- ✅ Response format validation

### Local Testing Instructions

1. Clone repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run server: `npm run dev`
5. Import Postman collection
6. Run test scenarios as shown in screenshots
