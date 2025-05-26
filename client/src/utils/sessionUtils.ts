const SESSION_KEY = 'oceanBookingSession';
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

interface SessionData {
  email: string;
  timestamp: number;
}

export const setSessionData = (email: string): void => {
  const sessionData: SessionData = {
    email,
    timestamp: new Date().getTime()
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
};

export const getSessionData = (): SessionData | null => {
  const data = sessionStorage.getItem(SESSION_KEY);
  if (!data) return null;

  const sessionData: SessionData = JSON.parse(data);
  const currentTime = new Date().getTime();

  // Check if session has expired (30 minutes)
  if (currentTime - sessionData.timestamp > SESSION_TIMEOUT) {
    clearSession();
    return null;
  }

  // Update timestamp to extend session
  setSessionData(sessionData.email);
  return sessionData;
};

export const clearSession = (): void => {
  sessionStorage.removeItem(SESSION_KEY);
};

export const isSessionValid = (): boolean => {
  return getSessionData() !== null;
};

export const getEmailFromSession = (): string | null => {
  const sessionData = getSessionData();
  return sessionData ? sessionData.email : null;
}; 