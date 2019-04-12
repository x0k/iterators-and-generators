interface Observer {
  next(value?: any): void;
  return(value?: any): void;
  throw(error): void;
}

import {createReadStream} from 'fs';

function readFile(fileName, target) {
  let readStream = createReadStream(fileName,
      { encoding: 'utf8', bufferSize: 1024 });
  readStream.on('data', buffer => {
      let str = buffer.toString('utf8');
      target.next(str);
  });
  readStream.on('end', () => {
      // Signal end of output sequence
      target.return();
  });
}

function* splitLines(target) {
  let previous = '';
  try {
      while (true) {
          previous += yield;
          let eolIndex;
          while ((eolIndex = previous.indexOf('\n')) >= 0) {
              let line = previous.slice(0, eolIndex);
              target.next(line);
              previous = previous.slice(eolIndex+1);
          }
      }
  } finally {
      // Handle the end of the input sequence
      // (signaled via `return()`)
      if (previous.length > 0) {
          target.next(previous);
      }
      // Signal end of output sequence
      target.return();
  }
}

function* numberLines(target) {
  try {
      for (let lineNo = 0; ; lineNo++) {
          let line = yield;
          target.next(`${lineNo}: ${line}`);
      }
  } finally {
      // Signal end of output sequence
      target.return();
  }
}

function* printLines() {
  while (true) {
      let line = yield;
      console.log(line);
  }
}

function chain(...generatorFuncs) {
  if (generatorFuncs.length < 1) {
      throw new Error('Need at least 1 argument');
  }
  let generatorObject = generatorFuncs[generatorFuncs.length-1]();
  generatorObject.next(); // generator is now ready for input
  for (let i=generatorFuncs.length-2; i >= 0; i--) {
      let generatorFunction = generatorFuncs[i];
      // Link current generator to successor
      generatorObject = generatorFunction(generatorObject);
      // Start the generator
      generatorObject.next();
  }
  return generatorObject;
}

let fileName = process.argv[2];
readFile(fileName, chain(splitLines, numberLines, printLines));