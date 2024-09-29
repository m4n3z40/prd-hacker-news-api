export const empty = Symbol('Empty SQL Value');
export const raw = (value) => ({ sql: value });

export default function sql(strings, ...values) {
  return strings.reduce((acc, str, i) => {
    const value = values[i];

    if (value === undefined || value === empty) {
      acc.sql += str;
    } else if (value?.sql !== undefined) {
      acc.sql += str + value.sql;

      if (value.args && value.args.length) {
        acc.args.push(...value.args);
      }
    } else {
      acc.sql += str + '?';
      acc.args.push(value);
    }

    return acc;
  }, { sql: '', args: [] });
}
