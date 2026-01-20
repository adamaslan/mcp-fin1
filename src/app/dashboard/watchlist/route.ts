import { NextResponse } from "next/server";

/**
 * Redirect /dashboard/watchlist to /api/watchlist
 * This handles the 404 error by routing to the correct endpoint
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const redirectUrl = new URL("/api/watchlist", url.origin);

  // Copy query parameters
  url.searchParams.forEach((value, key) => {
    redirectUrl.searchParams.append(key, value);
  });

  // Forward the request to the correct API endpoint
  return fetch(redirectUrl.toString(), {
    method: "GET",
    headers: request.headers,
  });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const redirectUrl = new URL("/api/watchlist", url.origin);

  // Forward the request body
  const body = await request.text();

  return fetch(redirectUrl.toString(), {
    method: "POST",
    headers: request.headers,
    body,
  });
}

export async function PUT(request: Request) {
  const url = new URL(request.url);
  const redirectUrl = new URL("/api/watchlist", url.origin);

  const body = await request.text();

  return fetch(redirectUrl.toString(), {
    method: "PUT",
    headers: request.headers,
    body,
  });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const redirectUrl = new URL("/api/watchlist", url.origin);

  // Copy query parameters
  url.searchParams.forEach((value, key) => {
    redirectUrl.searchParams.append(key, value);
  });

  return fetch(redirectUrl.toString(), {
    method: "DELETE",
    headers: request.headers,
  });
}
