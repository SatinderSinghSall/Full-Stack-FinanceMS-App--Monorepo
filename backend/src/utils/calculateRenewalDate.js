const calculateRenewalDate = (startDate, billingCycle) => {
  const date = new Date(startDate);

  switch (billingCycle) {
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;

    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;

    case "quarterly":
      date.setMonth(date.getMonth() + 3);
      break;

    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;

    default:
      date.setMonth(date.getMonth() + 1);
  }

  return date;
};

module.exports = calculateRenewalDate;
