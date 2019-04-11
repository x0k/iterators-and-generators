import { decorate, wrap } from './wrapper'

function getMonthLength (year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

interface Dictionary {
  [key: string]: number
}

interface Years extends Dictionary {
  year: number
}
interface Months extends Years {
  month: number
}

interface Days extends Months {
  day: number
}

interface Hours extends Days {
  hour: number
}

interface Minutes extends Hours {
  minute: number
}

function * years ({ year }: Years) {
  while (true) {
    yield { year: year++ }
  }
}
function * months ({ month }: Months, { year }: Years) {
  while (month < 12) {
    yield { month: month++, year }
  }
  return { month: month % 12, year }
}
function * days ({ day }: Days, { month, year }: Months) {
  const len = getMonthLength(year, month)
  while (day < len) {
    yield { day: day++, month, year }
  }
  return { day: day % len, month, year }
}
function * hours ({ hour }: Hours, date: Days) {
  while (hour < 24) {
    yield { hour: hour++, ...date }
  }
  return { hour: hour % 24, ...date }
}
function * minutes ({ minute }: Minutes, date: Hours) {
  while (minute < 60) {
    yield { minute: minute++, ...date }
  }
  return { minute: minute % 60, ...date }
}

export default (from: Minutes, to: Minutes) => {
  const condition = ({ year, month, day, hour, minute }: Minutes) => year < to.year
    || month < to.month
    || day < to.day
    || hour < to.hour
    || minute <= to.minute
  const period = wrap(
    decorate<Hours, Minutes>(
      decorate<Days, Hours>(
        decorate<Months, Days>(
          decorate<Years, Months>(
            years,
            months
          ),
          days
        ),
        hours
      ),
      minutes
    ),
    condition
  )
  return period(from)
}