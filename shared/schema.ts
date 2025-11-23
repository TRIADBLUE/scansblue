import { z } from "zod";

// API request schema for the agent endpoint
export const agentRequestSchema = z.object({
  content: z.string().min(1, "Question cannot be empty"),
});

export type AgentRequest = z.infer<typeof agentRequestSchema>;

// API response schema
export const agentResponseSchema = z.object({
  content: z.string(),
});

export type AgentResponse = z.infer<typeof agentResponseSchema>;

// Internal analysis result types
export interface ButtonAnalysis {
  total: number;
  breakdown: { location: string; count: number }[];
}

export interface LogoAnalysis {
  found: boolean;
  logos: {
    src: string;
    alt: string;
    width: number;
    height: number;
    location: string;
  }[];
}

export interface FaviconAnalysis {
  found: boolean;
  href?: string;
  type?: string;
  message: string;
}

export interface NavigationAnalysis {
  menuItems: number;
  structure: {
    label: string;
    href: string;
  }[];
}

export interface ComparisonResult {
  devResult: any;
  prodResult: any;
  differences: string[];
}
