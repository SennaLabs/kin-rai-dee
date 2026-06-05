import { RestaurantMatchApp } from "@/components/restaurant-match-app";

// Shareable invite link: app.xxx/j/{code} (wiki §2.2) — opens straight into the
// join flow with the code prefilled. params is a promise in the App Router.
export default async function JoinByCode({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <RestaurantMatchApp initialJoinCode={code} />;
}
