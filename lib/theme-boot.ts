/**
 * Inline <head> script: applies the saved dark mode and language before first paint.
 * Kept out of the "use client" theme module so the server layout gets a real string.
 */
export const THEME_BOOT_SCRIPT = `try{var d=document.documentElement;if(localStorage.getItem("merchie.theme")==="dark")d.dataset.theme="dark";var l=localStorage.getItem("merchie.lang");if(l)d.lang=l}catch(e){}`;
