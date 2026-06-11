This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Firebase setup

Realtime Database security rules live in [`database.rules.json`](database.rules.json)
(see [`database.rules.md`](database.rules.md) for the per-rule rationale). The
CLI is pinned to the `mairuukinrai` project via `.firebaserc`; deploy rules with:

```bash
firebase deploy --only database
```

### App Check — remaining setup

App Check is wired in [`lib/firebase.ts`](lib/firebase.ts) but stays a no-op
until a reCAPTCHA key is set, so local dev works without it. To turn it on:

- [ ] Create a **reCAPTCHA v3** site key and register the web app under Firebase Console → App Check.
- [ ] Set `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` in `.env` (currently empty = App Check off).
- [ ] Enable **Enforcement** for Realtime Database in the App Check console.
- [ ] Add a debug token for local dev / CI — once enforced, unregistered origins are blocked.

> The client uses `ReCaptchaV3Provider`, so use a classic reCAPTCHA **v3** key — not Enterprise.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
