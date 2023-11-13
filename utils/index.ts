/**
 * Store data in the local storage
 * @param key The key to store the data under
 * @param value The value to store
 */
export function setStore(key: string, value: any): void {
  localStorage.setItem(key, JSON.stringify(value));
}

/**
 * Retrieve data from the local storage
 * @param key The key to retrieve the data from
 */
export function getStore(key: string): any {
  const item = localStorage.getItem(key);

  if (!item) {
    return null;
  }

  return JSON.parse(item);
}
