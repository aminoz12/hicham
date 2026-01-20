/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly NEXT_PUBLIC_SUPABASE_URL?: string;
  readonly NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?: string;
  readonly VITE_SUMUP_MERCHANT_CODE?: string; // Your SumUp merchant code (e.g., MXQYJZNR)
  readonly VITE_SUMUP_MERCHANT_ID?: string;
  readonly VITE_SUMUP_SECRET_KEY?: string;
  readonly VITE_SUMUP_PUBLIC_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

