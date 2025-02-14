import { PrismaClient } from '@prisma/client'
import type { Contact } from '@prisma/client'

const prisma = new PrismaClient()

type ContactRequest = {
  email?: string | null
  phoneNumber?: string | null
}

type ContactResponse = {
  contact: {
    primaryContactId: number
    emails: string[]
    phoneNumbers: string[]
    secondaryContactIds: number[]
  }
}

export async function identifyContact(request: ContactRequest): Promise<ContactResponse> {
  try {
    const { email, phoneNumber } = request

    // Validate input
    if (!email && !phoneNumber) {
      throw new Error('At least one of email or phoneNumber must be provided');
    }

    // Find existing contacts with matching email or phone
    const existingContacts = await prisma.contact.findMany({
      where: {
        OR: [
          { email: email || undefined },
          { phoneNumber: phoneNumber || undefined }
        ],
        deletedAt: null
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // If no existing contacts, create a new primary contact
    if (existingContacts.length === 0) {
      const newContact = await prisma.contact.create({
        data: {
          email: email || null,
          phoneNumber: phoneNumber || null,
          linkPrecedence: 'primary'
        }
      })

      return {
        contact: {
          primaryContactId: newContact.id,
          emails: email ? [email] : [],
          phoneNumbers: phoneNumber ? [phoneNumber] : [],
          secondaryContactIds: []
        }
      }
    }

    // Get the primary contact (oldest contact)
    const primaryContact = existingContacts.find(c => c.linkPrecedence === 'primary') || existingContacts[0]

    // Check if we need to create a new secondary contact
    const hasNewInfo = (email && !existingContacts.some(c => c.email === email)) ||
      (phoneNumber && !existingContacts.some(c => c.phoneNumber === phoneNumber))

    if (hasNewInfo) {
      await prisma.contact.create({
        data: {
          email: email || null,
          phoneNumber: phoneNumber || null,
          linkedId: primaryContact.id,
          linkPrecedence: 'secondary'
        }
      })
    }

    // Update any primary contacts that should be secondary
    const contactsToUpdate = existingContacts.filter(c =>
      c.id !== primaryContact.id &&
      c.linkPrecedence === 'primary'
    )

    if (contactsToUpdate.length > 0) {
      await prisma.contact.updateMany({
        where: {
          id: {
            in: contactsToUpdate.map(c => c.id)
          }
        },
        data: {
          linkPrecedence: 'secondary',
          linkedId: primaryContact.id
        }
      })
    }

    // Get all linked contacts after updates
    const allLinkedContacts = await prisma.contact.findMany({
      where: {
        OR: [
          { id: primaryContact.id },
          { linkedId: primaryContact.id }
        ],
        deletedAt: null
      }
    })

    // Prepare response
    const emails = Array.from(new Set(
      allLinkedContacts
        .map(c => c.email)
        .filter((email): email is string => email !== null)
    ))
    const phoneNumbers = Array.from(new Set(
      allLinkedContacts
        .map(c => c.phoneNumber)
        .filter((phone): phone is string => phone !== null)
    ))

    // Ensure primary contact's email and phone are first in the arrays
    if (primaryContact.email && emails.includes(primaryContact.email)) {
      emails.splice(emails.indexOf(primaryContact.email), 1)
      emails.unshift(primaryContact.email)
    }
    if (primaryContact.phoneNumber && phoneNumbers.includes(primaryContact.phoneNumber)) {
      phoneNumbers.splice(phoneNumbers.indexOf(primaryContact.phoneNumber), 1)
      phoneNumbers.unshift(primaryContact.phoneNumber)
    }

    return {
      contact: {
        primaryContactId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds: allLinkedContacts
          .filter(c => c.id !== primaryContact.id)
          .map(c => c.id)
      }
    }
  } catch (error) {
    // Log the error
    console.error('Error in identifyContact:', error);
    throw error;
  } finally {
    // Clean up any resources if needed
  }
}