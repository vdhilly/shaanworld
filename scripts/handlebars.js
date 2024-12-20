export function registerHandlebarsHelpers() {
  Handlebars.registerHelper("ifeq", function (a, b, options) {
    if (a == b) {
      return options.fn(this);
    }
    return options.inverse(this);
  });
  Handlebars.registerHelper("ifnoteq", function (a, b, options) {
    if (a != b) {
      return options.fn(this);
    }
    return options.inverse(this);
  });
  Handlebars.registerHelper("eq", function (a, b) {
    return a === b;
  });
  Handlebars.registerHelper("gt", function (a, b) {
    return a > b;
  });
  Handlebars.registerHelper("gte", function (a, b) {
    return a >= b;
  });
  Handlebars.registerHelper("lt", function (a, b) {
    return a < b;
  });
  Handlebars.registerHelper("lte", function (a, b) {
    return a <= b;
  });
  Handlebars.registerHelper("ne", function (a, b) {
    return a !== b;
  });
  Handlebars.registerHelper("capitalize", function (str) {
    if (typeof str !== "string") {
      return "";
    }

    return str.charAt(0).toUpperCase() + str.slice(1);
  });
  Handlebars.registerHelper("getName", function (a, b) {
    const root = CONFIG.shaanworld[a];
    const toFind = Number(b);
    return root[toFind];
  });
}
