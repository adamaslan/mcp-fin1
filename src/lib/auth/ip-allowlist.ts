/**
 * IP Allowlist utilities for internal endpoint security
 *
 * Tier 1 Security: Validates requests come from allowed internal IPs
 * Combined with API key check for defense-in-depth authentication
 */

/**
 * GCP internal IP ranges - requests from Cloud Run, Cloud Scheduler, etc.
 * Reference: https://cloud.google.com/vpc/docs/firewalls#more_tcp_udp_rules
 */
const ALLOWED_IP_RANGES = [
  "10.0.0.0/8", // GCP internal VPC range (most common)
  "172.16.0.0/12", // Alternative GCP VPC range
  "127.0.0.1", // Localhost (for local testing)
  "::1", // IPv6 localhost
];

/**
 * Additional allowed IPs that can be set via environment variable
 * Format: comma-separated, e.g., "203.0.113.1,203.0.113.2"
 */
const EXTRA_ALLOWED_IPS = process.env.ALLOWED_INTERNAL_IPS?.split(",") || [];

/**
 * Check if IP address is in allowed ranges using CIDR notation
 *
 * @param ip - IP address to check (IPv4 or IPv6)
 * @returns true if IP is in allowed ranges
 *
 * @example
 * isAllowedIP("10.0.0.5") // true
 * isAllowedIP("203.0.113.1") // false (unless in ALLOWED_INTERNAL_IPS)
 */
export function isAllowedIP(ip: string | null): boolean {
  if (!ip || ip === "unknown") {
    return false;
  }

  // Handle IPv4-mapped IPv6 addresses (e.g., ::ffff:127.0.0.1)
  const cleanIP = ip.replace(/^::ffff:/, "");

  // Check against GCP internal ranges
  for (const range of ALLOWED_IP_RANGES) {
    if (isCIDRMatch(cleanIP, range)) {
      return true;
    }
  }

  // Check against extra allowed IPs from environment
  if (EXTRA_ALLOWED_IPS.includes(cleanIP)) {
    return true;
  }

  return false;
}

/**
 * Check if an IP address matches a CIDR range
 *
 * @param ip - IP address to check
 * @param cidr - CIDR range (e.g., "10.0.0.0/8" or single IP "127.0.0.1")
 * @returns true if IP is within CIDR range
 */
function isCIDRMatch(ip: string, cidr: string): boolean {
  // Handle single IPs (no slash)
  if (!cidr.includes("/")) {
    return ip === cidr;
  }

  // For simplicity in Next.js (no npm deps), handle common ranges
  // In production, consider using 'ip-address' package for robust CIDR matching

  const [range, bits] = cidr.split("/");
  const bitsNum = parseInt(bits, 10);

  // IPv4 simple check
  if (ip.includes(".") && range.includes(".")) {
    return ipv4InRange(ip, range, bitsNum);
  }

  // IPv6 would require more complex logic - for now, exact match
  return ip === range;
}

/**
 * Simple IPv4 CIDR range check
 * Note: For production, use a dedicated library like 'ip-address'
 */
function ipv4InRange(ip: string, range: string, maskBits: number): boolean {
  const ipParts = ip.split(".").map(Number);
  const rangeParts = range.split(".").map(Number);

  if (
    ipParts.length !== 4 ||
    rangeParts.length !== 4 ||
    maskBits < 0 ||
    maskBits > 32
  ) {
    return false;
  }

  // Convert to 32-bit integers
  const ipNum =
    (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
  const rangeNum =
    (rangeParts[0] << 24) +
    (rangeParts[1] << 16) +
    (rangeParts[2] << 8) +
    rangeParts[3];

  // Create mask
  const mask = maskBits === 0 ? 0 : (0xffffffff << (32 - maskBits)) >>> 0;

  return (ipNum & mask) === (rangeNum & mask);
}

/**
 * Extract client IP from request headers
 *
 * Checks multiple headers as different proxies/load balancers set different ones:
 * - x-forwarded-for: Set by proxies, first IP is original client
 * - cf-connecting-ip: Set by Cloudflare
 * - x-real-ip: Set by some reverse proxies
 *
 * @param request - Next.js Request object
 * @returns Client IP address or "unknown"
 */
export function getClientIP(request: Request): string {
  const xForwardedFor = request.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, first is original client
    return xForwardedFor.split(",")[0].trim();
  }

  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  const xRealIp = request.headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp;
  }

  return "unknown";
}
