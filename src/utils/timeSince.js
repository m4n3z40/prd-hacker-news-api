const simpleInflection = (value, unit) => `${value} ${unit}${value > 1 ? "s" : ""}`;

export default function timeSince(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) return simpleInflection(Math.floor(interval), 'year');

  interval = seconds / 2592000;
  if (interval > 1) return simpleInflection(Math.floor(interval), 'month');

  interval = seconds / 86400;
  if (interval > 1) return simpleInflection(Math.floor(interval), 'day');

  interval = seconds / 3600;
  if (interval > 1) return simpleInflection(Math.floor(interval), 'hour');

  interval = seconds / 60;
  if (interval > 1) return simpleInflection(Math.floor(interval), 'minute');

  return simpleInflection(Math.floor(interval), 'second');
}
