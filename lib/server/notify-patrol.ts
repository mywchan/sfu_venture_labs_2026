// Notifications to ski patrol about missing children. Server only.

export async function onMissingReported(_search: { emergencyId: string; childId: string; lastSeenPlace: string }) {}
export async function clearRemindersOnAcknowledged(_emergencyId: string) {}
export async function onSearchClosed(_emergencyId: string) {}
export async function sendDueReminders() {}
