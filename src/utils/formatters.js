export const formatTimeAgo = (timestamp) => {
  // Handle both Date objects and timestamps
  const time = timestamp instanceof Date ? timestamp.getTime() : timestamp;
  
  // Calculate difference in seconds
  const seconds = Math.floor((Date.now() - time) / 1000);
  
  // Handle future dates (shouldn't happen but protects against bugs)
  if (seconds < 0) return 'just now';
  
  if (seconds < 60) return `${seconds}s ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
};

export const formatDuration = (seconds) => {
  // Handle invalid/undefined duration
  if (seconds === undefined || seconds === null || isNaN(seconds)) {
    return '0:00';
  }
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const calculateAgreementPercentage = (agrees, disagrees) => {
  const total = agrees + disagrees;
  if (total === 0) return 50;
  return Math.round((agrees / total) * 100);
};

export const getControversyLevel = (agrees, disagrees) => {
  const percentage = calculateAgreementPercentage(agrees, disagrees);
  if (percentage >= 80 || percentage <= 20) return 'consensus';
  if (percentage >= 60 || percentage <= 40) return 'divided';
  return 'controversial';
};

export const calculateScore = (thread) => {
  const ageHours = (Date.now() - thread.createdAt) / (1000 * 60 * 60);
  const engagement = thread.stats.agrees + thread.stats.disagrees + (thread.stats.replies * 2);
  return engagement / Math.log(ageHours + 2);
};