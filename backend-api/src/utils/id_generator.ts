export const generateUniqueId = (prefix?: string): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${prefix ? prefix + "_" : ""}${timestamp}_${randomPart}`;
};
