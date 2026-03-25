/** Non-production builds must not use live Stripe keys. */
export const isProd = process.env.NODE_ENV === "production";
export const stripeTestModeRequired = !isProd;
