const realSetInterval = window.setInterval;
const realClearInterval = window.clearInterval;
export const realSetTimeout = window.setTimeout;
const realClearTimeout = window.clearTimeout;

export function randName () {
  return `test_` + Math.floor(Math.random() * 10000000);
}

export function untilDone (func, timeout = 5000) {
  var interval;
  return new Promise(function(resolve, reject) {
    var timeoutId = realSetTimeout(function() {
      realClearInterval(interval);
      reject(new Error(`untilDone timed out`));
      console.trace(`untilDone timed out`);
    }, timeout);
    interval = realSetInterval(function() {
      try {
        if (func()) {
          realClearTimeout(timeoutId);
          realClearInterval(interval);
          resolve();
        }
      } catch (_err) { /* ignore - keep polling */ }
    }, 20);
  });
}

// does obj a contain all of obj b?
export function containsObj(a, b) {
  for (const key in b) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
}

export async function clearLibInstance(mixpanel, instance, clear_opt_in_out) {
  var name = instance.config.name;
  console.log(`Clearing lib instance: ${name}`);
  clear_opt_in_out = typeof clear_opt_in_out === `undefined` ? true : clear_opt_in_out;

  if (name === `mixpanel`) {
    throw `Cannot clear main lib instance`;
  }

  instance.set_config({autocapture: false, track_pageview: false});
  instance.persistence.clear();
  instance.stop_batch_senders();

  await instance.stop_session_recording();

  if (clear_opt_in_out) {
    instance.clear_opt_in_out_tracking();
  }

  delete mixpanel[name];
  console.log(`Lib instance ${name} cleared.`);
}

export async function clearAllLibInstances(mixpanel) {
  var clearPromises = [];
  for (var key in mixpanel) {
    var maybeLibInstance = mixpanel[key];
    if (
      typeof(maybeLibInstance) === `object`
            && maybeLibInstance.config
            && maybeLibInstance.config.name
            && maybeLibInstance.config.name !== `mixpanel`
            && maybeLibInstance.config.name !== `nonbatching` // set in the HTML wrapper, don't clear
    ) {
      clearPromises.push(clearLibInstance(mixpanel, maybeLibInstance));
    }
  }
  await Promise.all(clearPromises);
}

export async function clearIDB() {
  console.log(`Clearing IndexedDB...`);
  if (!window.indexedDB) {
    console.warn(`IndexedDB is not supported in this browser.`);
    return;
  }

  const openRequest = window.indexedDB.open(`mixpanelBrowserDb`, 1);

  let isFresh = false;
  await new Promise((resolve, reject) => {
    openRequest.onsuccess = async function () {
      if (isFresh) {
        resolve();
        return;
      }

      const db = openRequest.result;

      const existingStores = Array.from(db.objectStoreNames);
      if (existingStores.length === 0) {
        db.close();
        resolve();
        return;
      }

      let transaction;
      try {
        transaction = db.transaction(existingStores, `readwrite`);
      } catch(error) {
        console.error(`Error creating transaction:`, error);
        db.close();
        resolve();
        return;
      }

      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        reject(transaction.error);
      };

      for (let i = 0; i < existingStores.length; i++) {
        const store = transaction.objectStore(existingStores[i]);
        store.clear();
      }
    };

    openRequest.onupgradeneeded = function () {
      isFresh = true; // idb doesn't exist yet, the sdk will make it
      resolve();
    };

    openRequest.onerror = reject;
  });
  console.log(`IndexedDB cleared.`);
}

export function clearMixpanelCookies() {
  const cookies = document.cookie.split(`;`);
  const hostname = window.location.hostname;
  const domainParts = hostname.split(`.`);

  // Build list of domain variations to try (for cross-subdomain cookies)
  const domains = [``];
  if (hostname !== `localhost` && domainParts.length > 1) {
    for (let i = 0; i < domainParts.length - 1; i++) {
      domains.push(`.` + domainParts.slice(i).join(`.`));
    }
  }

  for (const cookie of cookies) {
    const name = cookie.split(`=`)[0].trim();
    if (name && (name.startsWith(`mp_`) || name.startsWith(`__mp`))) {
      // Try clearing with various domain options
      // Use both expires and max-age=0 for Safari compatibility
      for (const domain of domains) {
        const domainAttr = domain ? `; domain=${domain}` : ``;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; max-age=0; path=/${domainAttr}`;
      }
    }
  }
}

/**
 * Reset targeting loader state (for testing)
 * Clears all cached state and removes script tags to allow re-initialization.
 */
export function resetTargeting() {
  // Clear promise global
  if (window['__mp_targeting']) {
    delete window['__mp_targeting'];
  }

  // Remove script tags so they can be re-added and re-executed
  const scripts = document.querySelectorAll('script[src*="mixpanel-targeting"]');
  for (let i = 0; i < scripts.length; i++) {
    scripts[i].remove();
  }
}

export async function clearAllStorage() {
  if (window.localStorage) {
    window.localStorage.clear();
  }

  if (window.sessionStorage) {
    window.sessionStorage.clear();
  }

  if (window.indexedDB) {
    await clearIDB();
  }

  clearMixpanelCookies();
}

export function simulateMouseClick(element) {
  if (element.click) {
    element.click();
  } else {
    var evt = element.ownerDocument.createEvent(`MouseEvents`);
    evt.initMouseEvent(`click`, true, true, element.ownerDocument.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    element.dispatchEvent(evt);
  }
}

export function makeFakeFetchResponse(status, body) {
  body = body || {};
  var response = new Response(JSON.stringify(body), {
    status: status,
    headers: {
      'Content-type': `application/json`
    }
  });

  return new Promise(function(resolve) {
    resolve(response);
  });
}

export function makeDelayedFetchResponse(status, body, delay) {
  return new Promise(function(resolve) {
    setTimeout(function() {
      resolve(makeFakeFetchResponse(status, body));
    }, delay);
  });
}
