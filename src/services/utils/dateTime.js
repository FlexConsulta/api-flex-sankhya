export const getDateTimeFromString = (str, nullLabel = false) => {
  if (nullLabel && !str) return null;
  if (!str) return new Date();

  const [dateValues, timeValues] = str.trim().includes(' ')
    ? str.split(' ')
    : `${str} 00:00:00`.split(' ');

  const [day, month, year] = dateValues.split('/');

  const [hours, minutes, seconds] = timeValues.split(':');

  let dateConverted = new Date(
    +year,
    +month - 1,
    +day,
    +hours + Number(process.env.UTC_TIME_ZONE || 0),
    +minutes,
    +seconds,
    0
  );

  if (dateConverted > new Date()) dateConverted = new Date();

  return dateConverted;
};

export const getDateTimeNow = () => {
  const str = new Date().toLocaleString();

  const [dateValues, timeValues] = str.split(' ');

  const [day, month, year] = dateValues.split('/');

  const [hours, minutes, seconds] = timeValues.split(':');

  return new Date(
    +year,
    +month - 1,
    +day,
    +hours + Number(process.env.UTC_TIME_ZONE || 0),
    +minutes,
    +seconds,
    0
  );
};

export const getDateFormated = (date) => {
  const dateArray = date.split(' ')[0];
  const time = date.split(' ')[1];
  const day = dateArray[0] + dateArray[1];
  const month = dateArray[2] + dateArray[3];
  const year = dateArray[4] + dateArray[5] + dateArray[6] + dateArray[7];

  const dateFormated = day + ' ' + month + ' ' + year + ' ' + time;
  return dateFormated;
};
