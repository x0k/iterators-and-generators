while (available(date))
  for (const year of years(date))
    for (const month of months(year))
      for (const day of days(month))
        for (const hour of hours(day))
          for (const minute of minutes(hour))
            yield { year, month, day, hour, minute }