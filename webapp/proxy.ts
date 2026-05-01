import { NextRequest, NextResponse } from "next/server";

/**
 * HTTP Basic Auth gate. Only enforced when SITE_PASSWORD env var is set
 * (i.e. on the deployed Vercel app). Local dev passes through.
 */
export function proxy(request: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return NextResponse.next();

  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Basic ")) {
    const decoded = Buffer.from(auth.slice(6), "base64").toString("utf8");
    const [, provided] = decoded.split(":");
    if (provided === password) return NextResponse.next();
  }

  return new NextResponse("Auth required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="cusoOS"' },
  });
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|robots.txt).*)"],
};
