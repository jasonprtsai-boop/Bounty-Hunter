export function eventRouteKey(eventId: string) {
  return eventId.replace(/^evt_demo_/, "").replace(/_/g, "-");
}

export function eventPath(eventId: string) {
  return `/events/${eventRouteKey(eventId)}`;
}
