export const findFieldIndex = (fieldName, fields) => {
  return fields?.findIndex((item) => item.name === fieldName);
};
