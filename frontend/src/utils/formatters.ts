export const formatDate = (iso: string): string => {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
};

export const formatDateTime = (iso: string): string => {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const truncate = (text: string, length = 80): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

export const capitalize = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
