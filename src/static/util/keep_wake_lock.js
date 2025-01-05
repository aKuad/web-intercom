/**
 * @file Keep WakeLock (no screen turn off, sleep or lock) even if document been re-visible
 *
 * @author aKuad
 */

/**
 * Start to keep WakeLock (no screen turn off, sleep or lock)
 *
 * If WakeLock released by document been inactive or hidden, re-acquire when document been visible.
 *
 * Note: For `WakeLock` API unsupported environment, do nothing
 */
export async function keep_wake_lock() {
  // WakeLock API availability check
  if(!("wakeLock" in navigator)) {
    console.error("WakeLock API unsupported environment");
    return;
  }

  // Try to WakeLock acquire
  try {
    await navigator.wakeLock.request("screen");
  } catch (e) {
    console.error("Failed to WakeLock acquiring:", e);
  }

  // Set event for Re-acquire when document been re-visible
  document.addEventListener("visibilitychange", () => {
    if(document.visibilityState === "visible") {
      navigator.wakeLock.request("screen")
      .then(() => console.info("WakeLock reacquired"))
      .catch(() => console.error("Failed to WakeLock reacquiring"));
    }
  });
}
