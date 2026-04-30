'use client';

import Link from 'next/link';

// This page is for development/debugging only.
// It is blocked in production via the NODE_ENV check below.
export default function DebugEnv() {
  const allowed = process.env.NODE_ENV !== 'production';

  if (!allowed) {
    return (
      <div className="p-8 max-w-2xl mx-auto">
        <p className="text-slate-600">Ikke tilgjengelig i produksjon.</p>
        <Link href="/" className="underline text-indigo-600">Tilbake</Link>
      </div>
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = 
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Environment Debug</h1>
      <div className="space-y-4 font-mono text-sm">
        <div>
          <div className="font-bold">NEXT_PUBLIC_SUPABASE_URL:</div>
          <div className={supabaseUrl ? "text-green-600" : "text-red-600"}>
            {supabaseUrl ? `✓ Set (${supabaseUrl.slice(0, 30)}...)` : "✗ NOT SET"}
          </div>
        </div>
        <div>
          <div className="font-bold">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:</div>
          <div className={process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? "text-green-600" : "text-red-600"}>
            {process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 
              ? `✓ Set (${process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.slice(0, 20)}...)` 
              : "✗ NOT SET"}
          </div>
        </div>
        <div>
          <div className="font-bold">NEXT_PUBLIC_SUPABASE_ANON_KEY:</div>
          <div className={process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "text-green-600" : "text-red-600"}>
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
              ? `✓ Set (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(0, 20)}...)` 
              : "✗ NOT SET"}
          </div>
        </div>
        <div>
          <div className="font-bold">Resolved Key (used by app):</div>
          <div className={supabaseKey ? "text-green-600" : "text-red-600"}>
            {supabaseKey ? `✓ Set (${supabaseKey.slice(0, 20)}...)` : "✗ NOT SET"}
          </div>
        </div>
      </div>
      <div className="mt-8 text-sm text-slate-600">
        Besøk <Link href="/" className="underline">/ (home)</Link> for å gå tilbake
      </div>
    </div>
  );
}
