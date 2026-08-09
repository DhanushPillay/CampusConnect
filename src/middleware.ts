import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login");

    if (isAuthPage) {
      if (isAuth) {
        // Redirect to appropriate dashboard based on role
        if (token.role === "ADMIN") {
          return NextResponse.redirect(new URL("/admin", req.url));
        }
        if (token.role === "TEACHER") {
          return NextResponse.redirect(new URL("/teacher", req.url));
        }
        if (token.role === "STUDENT") {
          return NextResponse.redirect(new URL("/student", req.url));
        }
        return NextResponse.redirect(new URL("/", req.url));
      }
      return null;
    }

    if (!isAuth) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Role-based route protection
    if (req.nextUrl.pathname.startsWith("/admin") && token.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    if (req.nextUrl.pathname.startsWith("/teacher") && token.role !== "TEACHER") {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    if (req.nextUrl.pathname.startsWith("/student") && token.role !== "STUDENT") {
      return new NextResponse("Unauthorized", { status: 403 });
    }
  },
  {
    callbacks: {
      authorized: () => true, // We handle auth logic in the middleware function above
    },
  }
);

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*", "/login"],
};
