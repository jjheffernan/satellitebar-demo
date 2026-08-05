/** Legacy franchise endpoint — out-of-orbit travel now posts to /api/booking with scope=outside. */
export async function onRequestPost(context) {
  return Response.redirect(new URL("/open", context.request.url), 303);
}
