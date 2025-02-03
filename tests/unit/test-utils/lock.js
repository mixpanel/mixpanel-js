// pre-acquire SharedLock for a given pid
function acquireLockForPid(lock, pid) {
  lock.storage.setItem(lock.storageKey + ':X', pid);
  lock.storage.setItem(lock.storageKey + ':Y', pid);
}

export { acquireLockForPid };
