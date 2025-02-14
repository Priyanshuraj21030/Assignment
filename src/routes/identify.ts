import { Router } from 'express';
import { z } from 'zod';
import { identifyContact } from '../services/contact';
import { Prisma } from '@prisma/client';
import { validateRequest } from '../middleware/validate';

const router = Router();

// Request validation schema
const ContactRequestSchema = z.object({
  email: z.string().email().optional(),
  phoneNumber: z.string().optional()
}).refine(data => data.email || data.phoneNumber, {
  message: "At least one of email or phoneNumber must be provided"
});

router.post('/identify', validateRequest, async (req, res, next) => {
  try {
    const result = await identifyContact(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res) => {
  try {
    // Validate request
    const result = ContactRequestSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: result.error.issues
      });
    }

    const response = await identifyContact(result.data);
    res.json(response);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as identifyRouter };