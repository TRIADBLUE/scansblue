import { Request, Response, NextFunction } from 'express';

interface AuthenticatedRequest extends Request {
  apiClient?: {
    name: string;
    tier: 'free' | 'premium';
    rateLimit: number;
  };
}

const API_KEYS: Record<string, { name: string; tier: 'free' | 'premium'; rateLimit: number }> = {
  // BusinessBlueprint Production Key
  [process.env.BUSINESSBLUEPRINT_API_KEY || 'BBAPI_live_changeme']: {
    name: 'BusinessBlueprint',
    tier: 'premium' as const,
    rateLimit: 10000 // requests per day
  },
  // BusinessBlueprint Test Key
  [process.env.BUSINESSBLUEPRINT_TEST_KEY || 'BBAPI_test_changeme']: {
    name: 'BusinessBlueprint (Test)',
    tier: 'premium' as const,
    rateLimit: 1000
  }
};

export function verifyApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const apiKey = req.headers['x-api-key'] as string || req.body.apiKey;

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: 'API key required',
      message: 'Include API key in X-API-Key header or request body'
    });
  }

  const client = API_KEYS[apiKey];

  if (!client) {
    return res.status(401).json({
      success: false,
      error: 'Invalid API key',
      message: 'The provided API key is not valid'
    });
  }

  // Attach client info to request
  req.apiClient = client;

  // TODO: Check rate limits here if needed

  next();
}

export function requirePremiumTier(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (req.apiClient?.tier !== 'premium') {
    return res.status(403).json({
      success: false,
      error: 'Premium tier required',
      message: 'This endpoint requires a premium API key'
    });
  }

  next();
}
