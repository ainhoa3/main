import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookieService {
  constructor() { }

  /**
   * Set a cookie with optional parameters
   * @param name Cookie name
   * @param value Cookie value
   * @param days Optional number of days until expiration
   * @param path Optional cookie path (default: '/')
   */
  setCookie(name: string, value: string, days?: number, path: string = '/'): void {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=${path}`;
  }

  /**
   * Get a cookie by name
   * @param name Cookie name to retrieve
   * @returns Cookie value or null if not found
   */
  getCookie(name: string): string | null {
    const cookieName = `${name}=`;
    const cookieArray = document.cookie.split(';');
    
    for (let cookie of cookieArray) {
      cookie = cookie.trim();
      if (cookie.startsWith(cookieName)) {
        return decodeURIComponent(cookie.substring(cookieName.length));
      }
    }
    return null;
  }

  /**
   * Delete a cookie by name
   * @param name Cookie name to delete
   * @param path Optional cookie path (default: '/')
   */
  deleteCookie(name: string, path: string = '/'): void {
    // Set cookie expiration to past date to delete it
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
  }

  /**
   * Check if a cookie exists
   * @param name Cookie name to check
   * @returns Boolean indicating cookie existence
   */
  hasCookie(name: string): boolean {
    return this.getCookie(name) !== null;
  }

  /**
   * Update an existing cookie or create a new one
   * @param name Cookie name
   * @param value New cookie value
   * @param days Optional number of days until expiration
   * @param path Optional cookie path (default: '/')
   */
  updateCookie(name: string, value: string, days?: number, path: string = '/'): void {
    this.setCookie(name, value, days, path);
  }
}
