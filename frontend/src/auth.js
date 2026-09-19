// Lightweight "who is this visitor" memory, local to their browser. There's no
// login system in this app — an agent code stored here just means the visitor
// has registered (or verified a code they already had) at some point.
const KEY = "atc_agent_code";

export function getAgentCode() {
  try {
    return localStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
}

export function setAgentCode(code) {
  try {
    if (code) localStorage.setItem(KEY, code);
  } catch {
    // localStorage unavailable (private browsing, blocked storage, etc.) - ignore.
  }
}
