import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const protectedRoutes = ["/profile", "/settings", "/exercise"];

export async function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const path = url.pathname;

  // skip if public route
  if (!protectedRoutes.some(route => path.startsWith(route))) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  console.log('🔍 MIDDLEWARE DEBUG:', path);
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    console.log('👤 User:', user?.email || 'None');
    
    if (error) {
      console.log('❌ Auth Error:', error.message);
    }

    if (!user) {
      console.log('❌ Redirecting to /login');
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    console.log('✅ Access granted');
    return response;
  } catch (error) {
    console.error('❌ Middleware error:', error);
    // On error, let the request through and let the page handle auth
    return response;
  }
}

export const config = {
  matcher: ["/profile/:path*", "/settings/:path*", "/exercise/:path*"]
};