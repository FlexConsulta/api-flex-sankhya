export const showLog = (dataLength) => {
  let used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`The app uses approximately ${Math.round(used * 100) / 100} MB`);
  console.log(`Records ${dataLength || 0}`);
  used = null;
};
