/** Legacy franchise endpoint — out-of-orbit travel posts to /api/booking with scope=outside. */
export default async (request) => {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  return Response.redirect(new URL("/open", request.url), 303);
};

export const config = { path: "/api/franchise" };
