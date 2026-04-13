import { format, parseISO } from 'date-fns';

// Currency helpers keep all money display consistent and localizable later.
export const formatCurrency = (value) => {
  if (value == null || Number.isNaN(Number(value))) return '₹0';
  return `₹${Number(value).toLocaleString('en-IN', {
    maximumFractionDigits: 2
  })}`;
};

export const formatDate = (date) => {
  try {
    if (!date) return '';
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd MMM yyyy');
  } catch {
    return '';
  }
};

export const formatTime = (time) => {
  // Expecting HH:mm strings, but tolerant to Date as well.
  if (!time) return '';
  if (typeof time !== 'string') {
    try {
      return format(time, 'h:mm a');
    } catch {
      return '';
    }
  }
  const [h, m] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(h);
  date.setMinutes(m || 0);
  return format(date, 'h:mm a');
};

export const formatDateTime = (date, time) => {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    const datePart = format(d, 'dd MMM, yyyy');
    const timePart = time ? formatTime(time) : format(d, 'h:mm a');
    return `${datePart} • ${timePart}`;
  } catch {
    return '';
  }
};

export const maskPhone = (phone) => {
  // Simple masking to make phone display consistent, not for security.
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length <= 4) return digits;
  return `${digits.slice(0, 3)}XXXX${digits.slice(-3)}`;
};

export const formatIndianMobile = (value) => {
  // Formats "9876543210" → "98 7654 3210" for readability.
  const digits = (value || '').replace(/\D/g, '').slice(0, 10);
  if (!digits) return '';
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
  return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
};

export const getInitials = (name = '') => {
  const parts = name.trim().split(' ').filter(Boolean);
  if (!parts.length) return '';
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '';
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

export const hashStringToColor = (str = '') => {
  // Simple deterministic hash → HSL color; good enough for avatars.
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
};

