import { NextRequest } from "next/server";
import type { RateLimitStore } from "@/types/chat";

// Configuration
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute
const UPLOAD_RATE_LIMIT_MAX_REQUESTS = 5; // 5 uploads per minute

// In-memory rate limiting store (resets on server restart)
const rateLimitStore: RateLimitStore = {};
const uploadRateLimitStore: RateLimitStore = {};

/**
 * Extract client identifier from request headers.
 * Uses X-Forwarded-For header for proxied requests.
 */
export const getClientIdentifier = (request: NextRequest): string => {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return ip;
};

/**
 * Check if a client has exceeded the rate limit.
 * Returns true if the request is allowed, false if rate limited.
 */
export const checkRateLimit = (identifier: string): boolean => {
  return checkRateLimitForStore(identifier, rateLimitStore, RATE_LIMIT_MAX_REQUESTS);
};

export const checkUploadRateLimit = (identifier: string): boolean => {
  return checkRateLimitForStore(
    identifier,
    uploadRateLimitStore,
    UPLOAD_RATE_LIMIT_MAX_REQUESTS
  );
};

const checkRateLimitForStore = (
  identifier: string,
  store: RateLimitStore,
  maxRequests: number
): boolean => {
  const now = Date.now();
  const entry = rateLimitStore[identifier];

  if (!entry || now > entry.resetTime) {
    rateLimitStore[identifier] = {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    };
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
};

/**
 * Rate limit error message for API responses.
 */
export const RATE_LIMIT_ERROR =
  "Too many requests. Please wait a moment before sending another message.";

export const UPLOAD_RATE_LIMIT_ERROR =
  "Too many uploads. Please wait a moment before trying again.";
