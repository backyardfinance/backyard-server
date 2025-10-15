const getValueOrDefault = (key: string, defaultValue: any) => {
  const value = process.env[key];

  if (value === undefined) {
    if (defaultValue === undefined) {
      throw new Error(`Missing environment variable - "${key}"`);
    }

    return defaultValue;
  }

  return value.toString().trim();
};

const types = {
  int: (key: string, defaultValue?: number) => {
    const value = getValueOrDefault(key, defaultValue);
    const numberValue = parseInt(value, 10);

    if (!Number.isSafeInteger(numberValue)) {
      throw new Error(
        `Environment variable "${key}" should contain an integer value, got ${typeof numberValue} - ${value}`,
      );
    }

    return numberValue;
  },
  string: (key: string, defaultValue?: string) => {
    return getValueOrDefault(key, defaultValue);
  },
  bool: (key: string, defaultValue?: boolean) => {
    const value = getValueOrDefault(key, defaultValue?.toString());

    if (typeof value === 'string') {
      const normalized = value.toLowerCase().trim();
      if (['true', '1', 'yes'].includes(normalized)) return true;
      if (['false', '0', 'no'].includes(normalized)) return false;

      throw new Error(
        `Environment variable "${key}" should be a boolean (true/false), got "${value}"`,
      );
    }

    return Boolean(value);
  },
};

export const env = {
  ...types,
};
