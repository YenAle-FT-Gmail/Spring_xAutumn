import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default auth((req) => {
    const { nextUrl } = req
    const isLoggedIn = !!req.auth

    // Protect admin routes
    if (nextUrl.pathname.startsWith("/admin")) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/auth/signin", nextUrl))
        }
    }

    // Protect API routes (except auth and webhooks)
    if (nextUrl.pathname.startsWith("/api") &&
        !nextUrl.pathname.startsWith("/api/auth") &&
        !nextUrl.pathname.startsWith("/api/webhooks")) {
        if (!isLoggedIn) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
    }

    return NextResponse.next()
})

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}