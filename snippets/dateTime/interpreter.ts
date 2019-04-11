export type THandler = () => any;

interface IValues {
  [name: string]: any;
}

const operations = {}

const getter = (el: any) => {
  if (el in operations) {
    return operations[el];
  }
  return el;
};

type TGetter = (element: any, array: any[]) => any;

type Parameters = Array<any | IParameters>;
interface IParameters extends Array<any | Parameters> { }

type TAction<T> = (...values: T[]) => T;

class Operation<T> {

  constructor (
    public name: string,
    public action: TAction<T>,
    public arity = action.length,
  ) { }

  public eval (...values: T[]): T {
    return this.evaluator(this.action, ...values);
  }

  protected evaluator (action: TAction<T>, ...values: T[]) {
    return action(...values);
  }

}

const buildActions = (data: any[], getter: TGetter): any[] => {
  const parameters: IParameters = [];
  for (const item of data) {
    if (Array.isArray(item)) {
      parameters.push(item);
    } else {
      const element = getter(item, data);
      if (element instanceof Operation) {
        if (Array.isArray(parameters[parameters.length - 1])) {
          parameters.push(element.eval(...buildActions(parameters.pop(), getter)));
        } else {
          parameters.push(element.eval(...parameters.splice(parameters.length - element.arity, element.arity)));
        }
      } else {
        parameters.push(element);
      }
    }
  }
  return parameters;
};

export class Interpreter {

  constructor (
    private input: IValues = {},
    private output: any[] = [],
  ) { }

  public toHandler (data: any[]): THandler {
    const [ action ] = buildActions(data, getter);
    return () => action(this.input, this.output);
  }

}