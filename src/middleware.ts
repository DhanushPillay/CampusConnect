import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith("/login");

    if (isAuthPage) {
      if (!isAuth) return null;
      if (token.role === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
      if (token.role === "TEACHER") return NextResponse.redirect(new URL("/teacher", req.url));
      if (token.role === "STUDENT") return NextResponse.redirect(new URL("/student", req.url));
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (!isAuth) return NextResponse.redirect(new URL("/login", req.url));

    if (req.nextUrl.pathname.startsWith("/admin") && token.role !== "ADMIN")
      return new NextResponse("Forbidden", { status: 403 });
    if (req.nextUrl.pathname.startsWith("/teacher") && token.role !== "TEACHER")
      return new NextResponse("Forbidden", { status: 403 });
    if (req.nextUrl.pathname.startsWith("/student") && token.role !== "STUDENT")
      return new NextResponse("Forbidden", { status: 403 });
  },
  { callbacks: { authorized: () => true } }
);

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*", "/login"],
};
