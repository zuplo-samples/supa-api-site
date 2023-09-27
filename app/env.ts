// Sets the sample fallbacks are for demo purposes only,
// they should be removed in your deployment
const vars = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  NEXT_PUBLIC_ZUPLO_API_URL: process.env.NEXT_PUBLIC_ZUPLO_API_URL!,
  ZUPLO_BUCKET_URL: process.env.ZUPLO_BUCKET_URL!,
  ZUPLO_API_KEY: process.env.ZUPLO_API_KEY!,
};

export function getRequiredEnvVar(name: keyof typeof vars): string {
  const val = vars[name];
  if (!val) {
    throw new Error(`The environment variable '${name}' must be set.`);
  }
  return val;
}
