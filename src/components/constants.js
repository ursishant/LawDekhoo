/**
 * -----------------------------------------------------------------------------
 * Constants
 * -----------------------------------------------------------------------------
 *
 * This file contains shared constants used throughout the application.
 *
 */

// --- Navigation Links ---
export const navLinks = [
    { path: "/", label: "Home" },
    { path: "/chat", label: "AI Chat" },
    { path: "/documents", label: "Documents" },
    { path: "/legalaid", label: "Legal Aid" },
    { path: "/activity", label: "Recent Activity" },
    { path: "/blog", label: "Blog" },
];

/**
 * -----------------------------------------------------------------------------
 * API Key Configuration
 * -----------------------------------------------------------------------------
 *
 * --- ⚠️ CRITICAL SECURITY WARNING ⚠️ ---
 * This file contains your secret API key.
 *
 * - DO NOT share this file or commit it to a public repository like GitHub.
 * - For production applications, it is essential to move this key to a secure
 * backend server and access it through environment variables to prevent theft.
 *
 * This key grants access to your Google AI account and can incur charges.
 *
 */
// Get your API key from: https://makersuite.google.com/app/apikey
export const API_KEY = 'AIzaSyAxDSI4leBdg4wToGaEAjj7EDTSl7P6bo0';
