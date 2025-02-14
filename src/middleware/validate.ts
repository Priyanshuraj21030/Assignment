import { Request, Response, NextFunction } from 'express';

export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const { email, phoneNumber } = req.body;

  // Basic validation
  if (!email && !phoneNumber) {
    return res.status(400).json({
      error: 'At least one of email or phoneNumber must be provided'
    });
  }

  // Email format validation if provided
  if (email && typeof email !== 'string') {
    return res.status(400).json({
      error: 'Email must be a string'
    });
  }

  // Phone number format validation if provided
  if (phoneNumber && typeof phoneNumber !== 'string') {
    return res.status(400).json({
      error: 'Phone number must be a string'
    });
  }

  next();
}; 