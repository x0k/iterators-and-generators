import { Interpreter, THandler } from './interpreter';


function getMonthLength(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

class DatePart {

  constructor(
    public value: number,
    public limitNames: string[] = [],
    private step: number,
    private handler: () => any,
    private limit = (() => Number.MAX_VALUE),
  ) { }

  public next(value?: number) {
    if (value) {
      if (value % this.step) {
        this.value = Math.ceil(value / this.step) * this.step
      } else {
        this.value += value
      }
    } else {
      this.value = this.step
    }
    const limit = this.limit();
    if (this.value < limit) {
      return 0;
    }
    const count = Math.floor(this.value / limit);
    this.value %= limit;
    return count;
  }

  get available(): boolean {
    return this.handler();
  }

}

export interface IConstraint {
  step?: number;
  expression?: any[];
}

export interface IConstraints {
  [name: string]: IConstraint;
}

type RuleRise = (id: string) => void;

export class DateTime {

  private parts: { [name: string]: DatePart } = {};
  private input = { dateTime: this };
  private out: any[] = [];
  private interpreter: Interpreter = new Interpreter(this.input, this.out);
  private handler: THandler;

  constructor(from: Date, end: Date, constraints: IConstraints) {
    const dateParts = [
      { name: 'year', get: (date: Date) => date.getFullYear() },
      {
        name: 'month',
        get: (date: Date) => date.getMonth(),
        limit: () => 12, limitNames: ['year'] },
      {
        name: 'date',
        get: (date: Date) => date.getDate(),
        limit: () => getMonthLength(this.get('year'), this.get('month')),
        limitNames: ['month'],
      },
      {
        name: 'week',
        get: (date: Date) => {
          const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
          const dayNum = d.getUTCDay() || 7;
          d.setUTCDate(d.getUTCDate() + 4 - dayNum);
          const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
          return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        },
      },
      {
        name: 'day',
        get: (date: Date) => date.getDay(),
        limit: () => 7,
        limitNames: ['week']
      },
      {
        name: 'hour',
        get: (date: Date) => date.getHours(),
        limit: () => 24,
        limitNames: ['day', 'date']
      },
      {
        name: 'minute',
        get: (date: Date) => date.getMinutes(),
        limit: () => 60, limitNames: ['hour']
      },
    ];
    for (const { name, get, limit, limitNames } of dateParts) {
      let step: number = 1;
      let handler: () => any = () => true;
      if (constraints && constraints[name]) {
        const con = constraints[name];
        if (con.step) {
          step = con.step;
        }
        if (con.expression) {
          handler = this.interpreter.toHandler(con.expression);
        }
      }
      this.parts[name] = new DatePart(get(from), limitNames, step, handler, limit);
    }
    this.handler = this.interpreter.toHandler([end, 'before']);
  }

  public next(level: RuleRise, name: string, value?: number): any {
    const part = this.parts[name];
    const count = part.next(value);
    let flag = true;
    if (count) {
      for (const limit of part.limitNames) {
        const val = this.next(level, limit, count);
        flag = flag && (val || val === 0);
      }
    }
    if (flag) {
      level(name);
    }
    return flag && part.available;
  }

  public get(name: string) {
    return this.parts[name].value;
  }

  get available(): boolean {
    return this.handler();
  }

}