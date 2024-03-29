export const getDateTimeFromString = (str, nullLabel = false) => {
  if (nullLabel && !str) return null;
  if (!str) return new Date();

  const [dateValues, timeValues] = str.trim().includes(" ")
    ? str.split(" ")
    : `${str} 00:00:00`.split(" ");

  const [day, month, year] = dateValues.split("/");

  const [hours, minutes, seconds] = timeValues.split(":");

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

export const getDateTimeNow = (value) => {
  let str = new Date().toLocaleString("pt-BR", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });
  if (value)
    str = new Date(value).toLocaleString("pt-BR", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    });

  return str;
};
export const dateLessThanNow = ({ lastSync }) => {
  const currentDate = new Date();
  const dateRef = new Date(lastSync);

  return (
    currentDate > dateRef &&
    currentDate.toLocaleDateString() !== lastSync.toLocaleDateString()
  );
};

export const getDateFormated = (value, nullable = true) => {
  //2023-02-11T13:56:57

  const dateAux = new Date();
  const [, timezone] = dateAux.toISOString().split(".");

  if (nullable && !value) return null;

  if (!nullable && !value) return new Date();

  const [date, time] = value.split(" ");
  const newDate = [
    date.slice(4, 8),
    "-",
    date.slice(2, 4),
    "-",
    date.slice(0, 2),
    "T",
    time,
    ".",
    timezone,
  ].join("");

  return newDate;
};
