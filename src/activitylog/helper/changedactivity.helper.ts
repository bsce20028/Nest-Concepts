export function changedactivityHelper(
  oldData: Record<string, unknown>,
  newData: Record<string, unknown>,
) {
  const oldValue: Record<string, unknown> = {};
  const newValue: Record<string, unknown> = {};

  for (const key in newData) {
    if (oldData[key] !== newData[key]) {
      oldValue[key] = oldData[key];
      newValue[key] = newData[key];
    }
  }

  if (Object.keys(newValue).length === 0) {
    return { oldValue: null, newValue: null };
  }

  return { oldValue, newValue };
}
