interface Generator {
  next(value? : any) : IteratorResult;
  throw(value? : any) : IteratorResult;
  return(value? : any) : IteratorResult;
}
interface IteratorResult {
  value : any;
  done : boolean;
}