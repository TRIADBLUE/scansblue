import { Request, Response, NextFunction } from 'express';

export function verifyApiKey(req: Request, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;
  
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required',
      message: 'Please provide an API key in the x-api-key header'
    });
  }
  
  next();
}

export function requirePremiumTier(req: Request, res: Response, next: NextFunction) {
  next();
}
