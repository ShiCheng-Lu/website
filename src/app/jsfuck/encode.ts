export const chars: Map<any, string> = new Map();
export const symbols: Map<any, string> = new Map();

/**
 * get the index, must be called after the indices has been bootstraped
 * @param value
 */
function getIndex(value: number): string {
  if (value < 0) {
    throw Error("cannot encode negative value with getNumber");
  }
  // single digit number, use raw value
  if (value < 10) {
    return symbols.get(value)!;
  }

  return `${value}`
    .split("") // split into single digits
    .map((x) => `[${symbols.get(parseInt(x))!}]`)
    .join("+"); // join to form the whole string
}

function addCharMapping(value: string, encoding: string) {
  const existing = chars.get(value);
  if (!existing || existing.length > encoding.length) {
    chars.set(value, encoding);
  }
}

/**
 * Add a mapping to the translation unit, keeper shorter encodings for every translation
 * @param value
 * @param encoding
 * @returns
 */
function addSymbolMapping(value: any, encoding: string) {
  const existing = symbols.get(value);
  if (!existing || existing.length > encoding.length) {
    symbols.set(value, encoding);
  }
  if (typeof value !== "string") {
    // adding +[] to the end will convert it to a string, process that as well
    addSymbolMapping(`${value}`, `${encoding}+[]`);
  } else if (value.length === 1) {
    // if the value is already a single character string, we can't make more encodings from it
    return;
  } else {
    // we have a string, we can extrace each character from the string and use it for future translations
    for (let index = 0; index < value.length; ++index) {
      addCharMapping(value[index], `(${encoding})[${getIndex(index)}]`);
    }
  }
}

export function encode(value: string): string {
  return value
    .split("")
    .map((char) => chars.get(char) || universalEncode(char))
    .join("+");
}

export function symbol(value: any): string {
  const encoding = symbols.get(value);
  if (encoding === undefined) {
    throw Error("symbol encoding not found");
  }
  return encoding;
}

// export function encode(value: string) {

// }

// numbers, add first so we can index
addSymbolMapping(0, "+[]");
for (var x = 1; x < 10; ++x) {
  addSymbolMapping(x, "+!![]".repeat(x));
}

// most basic types, don't require anything
addSymbolMapping(false, "![]");
addSymbolMapping(true, "!![]");
addSymbolMapping(undefined, "[][[]]");
addSymbolMapping("", "[]+[]");

// function type and iterator type for their string values
addSymbolMapping([]["flat"], `[][${encode("flat")}]`);
addSymbolMapping([]["entries"](), `[][${encode("entries")}]()`);

// constructors for number, string, function
addSymbolMapping((0)["constructor"], `(${symbol(0)})[${encode("constructor")}]`);
addSymbolMapping(""["constructor"], `(${symbol("")})[${encode("constructor")}]`);
addSymbolMapping(
  []["flat"]["constructor"],
  `(${symbol([]["flat"])})[${encode("constructor")}]`
);

// we can now construct every lowercase character with (int)["toString"](36) wher 36 is radix
const toString = `${encode("to")}+${symbol(""["constructor"])}[${encode(
  "name"
)}]`;
for (var x = 10; x < 36; ++x) {
  // TODO: optimize radix: e.g. 20 is less chars than 12
  addCharMapping(
    x["toString"](36),
    `(+(${getIndex(x)}))[${toString}](${getIndex(36)})`
  );
}

// get upper case C, then we can use all characters
addCharMapping(",", `([[]][${encode("concat")}]([[]])+[])`);
addSymbolMapping(
  "%2C",
  `${symbol([]["flat"]["constructor"])}(${encode("return escape")})()(${encode(
    ","
  )})`
);

function universalEncode(char: string): string {
  return `(${symbol(""["constructor"])})[${encode("fromCharCode")}](${getIndex(
    char.charCodeAt(0)
  )})`;
}

export const translationList: any[] = [];
chars.forEach((value, key) => {
  translationList.push({
    type: typeof key,
    key: `${key}`,
    value,
  });
});
