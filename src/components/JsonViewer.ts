/**
 * Check if arg is either an array with at least 1 element, or a dict with at least 1 key
 */
function isCollapsable(arg: any): boolean {
  return arg instanceof Object && Object.keys(arg).length > 0;
}

/**
 * Check if a string looks like a URL, based on protocol
 * This doesn't attempt to validate URLs, there's no use and syntax can be too complex
 */
function isUrl(s: string): boolean {
  let protocols = ["http", "https", "ftp", "ftps"];
  for (let i = 0; i < protocols.length; ++i) {
    if (s.startsWith(protocols[i] + "://")) {
      return true;
    }
  }
  return false;
}

/**
 * Return the input string html escaped
 */
function htmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/'/g, "&apos;")
    .replace(/"/g, "&quot;");
}

/**
 * Transform a json object into html representation
 */
export default function json2html(
  json: string | object | Array<any>,
  options: any,
): string {
  let html = "";
  if (typeof json === "string") {
    // Escape tags and quotes
    json = htmlEscape(json);

    if (options.withLinks && isUrl(json)) {
      html +=
        '<a href="' +
        json +
        '" class="json-string" target="_blank">' +
        json +
        "</a>";
    } else {
      // Escape double quotes in the rendered non-URL string.
      json = json.replace(/&quot;/g, "\\&quot;");
      html += '<span class="json-string">"' + json + '"</span>';
    }
  } else if (typeof json === "number" || typeof json === "bigint") {
    html += '<span class="json-literal">' + json + "</span>";
  } else if (typeof json === "boolean") {
    html += '<span class="json-literal">' + json + "</span>";
  } else if (json === null) {
    html += '<span class="json-literal">null</span>';
  } else if (json instanceof Array) {
    if (json.length > 0) {
      html += '[<ol class="json-array">';
      for (let i = 0; i < json.length; ++i) {
        html += "<li>";
        // Add toggle button if item is collapsable
        if (isCollapsable(json[i])) {
          html += '<a href class="json-toggle"></a>';
        }
        html += json2html(json[i], options);
        // Add comma if item is not last
        if (i < json.length - 1) {
          html += ",";
        }
        html += "</li>";
      }
      html += "</ol>]";
    } else {
      html += "[]";
    }
  } else if (typeof json === "object") {
    if (options.bigNumbers) {
      html += '<span class="json-literal">' + json.toString() + "</span>";
    } else {
      let keyCount = Object.keys(json).length;
      if (keyCount > 0) {
        html += '{<ul class="json-dict">';
        for (let key in json) {
          // define a parameter of the json value first to prevent get null from key when the key changed by the function `htmlEscape(key)`
          let jsonElement = Object.getOwnPropertyDescriptor(json, key)?.value;
          key = htmlEscape(key);
          let keyRepr = options.withQuotes
            ? '<span class="json-string">"' + key + '"</span>'
            : key;

          html += "<li>";
          // Add toggle button if item is collapsable
          if (isCollapsable(jsonElement)) {
            html += '<a href class="json-toggle">' + keyRepr + "</a>";
          } else {
            html += keyRepr;
          }
          html += ": " + json2html(jsonElement, options);
          // Add comma if item is not last
          if (--keyCount > 0) {
            html += ",";
          }
          html += "</li>";
        }
        html += "</ul>}";
      } else {
        html += "{}";
      }
    }
  }
  return html;
}
