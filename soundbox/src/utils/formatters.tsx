/**
 * Formats a date to a readable string
 * @param date - Date to format
 * @returns Formatted date string
 */
export const formatDate = (date: number | Date): string => {
  const dateObj = typeof date === "number" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(dateObj);
};

/**
 * Generates a random room code
 * @returns 6-character alphanumeric code
 */
export const generateRoomCode = (): string => {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

/**
 * Truncates text if it exceeds the max length
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number = 25): string => {
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

/**
 * Formats a number with a K suffix for thousands
 * @param num - Number to format
 * @returns Formatted number string
 */
export const formatNumberWithSuffix = (num: number): string => {
  return num >= 1000 ? `${(num / 1000).toFixed(1)}K` : num.toString();
};

/**
 * Converts BPM to milliseconds for a quarter note
 */
export const bpmToMs = (bpm: number): number => {
  return 60000 / bpm;
};

/**
 * Format a timestamp to show time since (e.g. "2 minutes ago")
 * @param timestamp - Timestamp in milliseconds
 * @returns Formatted time string
 */
export const formatTimeSince = (timestamp: number): string => {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  // Less than a minute ago
  if (seconds < 60) {
    return "just now";
  }

  // Minutes
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  }

  // Hours
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  // Days
  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }

  // Use standard date for older tracks
  return formatDate(timestamp);
};
