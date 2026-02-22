import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get("redirect_url");

  // Redirect to the specified URL or dashboard
  if (redirectUrl) {
    redirect(redirectUrl);
  }

  redirect("/dashboard");
}

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectUrl = searchParams.get("redirect_url");

  // Redirect to the specified URL or dashboard
  if (redirectUrl) {
    redirect(redirectUrl);
  }

  redirect("/dashboard");
}
