globalThis.process ??= {};
globalThis.process.env ??= {};
import { r as renderTemplate, N as NOTIFICATION_EVENTS, e as escapeHtml$1, n as notificationEventSchema, t as templateKey, i as isUserNotificationEvent, a as isAdminNotificationEvent } from "./template-engine_CUBCH2lW.mjs";
import { l as logger } from "./logger_CoNHAtH6.mjs";
import { g as getNotificationSetting } from "./settings-cache_BN3ad_JY.mjs";
const textEncoder = new TextEncoder();
const base64Chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const base64Lookup = new Uint8Array(256);
for (let i = 0; i < base64Chars.length; i++) {
  base64Lookup[base64Chars.charCodeAt(i)] = i;
}
function decodeBase64(base642) {
  let bufferLength = Math.ceil(base642.length / 4) * 3;
  const len = base642.length;
  let p = 0;
  if (base642.length % 4 === 3) {
    bufferLength--;
  } else if (base642.length % 4 === 2) {
    bufferLength -= 2;
  } else if (base642[base642.length - 1] === "=") {
    bufferLength--;
    if (base642[base642.length - 2] === "=") {
      bufferLength--;
    }
  }
  const arrayBuffer = new ArrayBuffer(bufferLength);
  const bytes = new Uint8Array(arrayBuffer);
  for (let i = 0; i < len; i += 4) {
    let encoded1 = base64Lookup[base642.charCodeAt(i)];
    let encoded2 = base64Lookup[base642.charCodeAt(i + 1)];
    let encoded3 = base64Lookup[base642.charCodeAt(i + 2)];
    let encoded4 = base64Lookup[base642.charCodeAt(i + 3)];
    bytes[p++] = encoded1 << 2 | encoded2 >> 4;
    bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;
    bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;
  }
  return arrayBuffer;
}
function getDecoder(charset) {
  charset = charset || "utf8";
  let decoder;
  try {
    decoder = new TextDecoder(charset);
  } catch (err) {
    decoder = new TextDecoder("windows-1252");
  }
  return decoder;
}
async function blobToArrayBuffer(blob) {
  if ("arrayBuffer" in blob) {
    return await blob.arrayBuffer();
  }
  const fr = new FileReader();
  return new Promise((resolve, reject) => {
    fr.onload = function(e) {
      resolve(e.target.result);
    };
    fr.onerror = function(e) {
      reject(fr.error);
    };
    fr.readAsArrayBuffer(blob);
  });
}
function getHex(c) {
  if (c >= 48 && c <= 57 || c >= 97 && c <= 102 || c >= 65 && c <= 70) {
    return String.fromCharCode(c);
  }
  return false;
}
function decodeWord(charset, encoding, str) {
  let splitPos = charset.indexOf("*");
  if (splitPos >= 0) {
    charset = charset.substr(0, splitPos);
  }
  encoding = encoding.toUpperCase();
  let byteStr;
  if (encoding === "Q") {
    str = str.replace(/=\s+([0-9a-fA-F])/g, "=$1").replace(/[_\s]/g, " ");
    let buf = textEncoder.encode(str);
    let encodedBytes = [];
    for (let i = 0, len = buf.length; i < len; i++) {
      let c = buf[i];
      if (i <= len - 2 && c === 61) {
        let c1 = getHex(buf[i + 1]);
        let c2 = getHex(buf[i + 2]);
        if (c1 && c2) {
          let c3 = parseInt(c1 + c2, 16);
          encodedBytes.push(c3);
          i += 2;
          continue;
        }
      }
      encodedBytes.push(c);
    }
    byteStr = new ArrayBuffer(encodedBytes.length);
    let dataView = new DataView(byteStr);
    for (let i = 0, len = encodedBytes.length; i < len; i++) {
      dataView.setUint8(i, encodedBytes[i]);
    }
  } else if (encoding === "B") {
    byteStr = decodeBase64(str.replace(/[^a-zA-Z0-9\+\/=]+/g, ""));
  } else {
    byteStr = textEncoder.encode(str);
  }
  return getDecoder(charset).decode(byteStr);
}
function decodeWords(str) {
  let joinString = true;
  while (true) {
    let result = (str || "").toString().replace(
      /(=\?([^?]+)\?[Bb]\?([^?]*)\?=)\s*(?==\?([^?]+)\?[Bb]\?[^?]*\?=)/g,
      (match, left, chLeft, encodedLeftStr, chRight) => {
        if (!joinString) {
          return match;
        }
        if (chLeft === chRight && encodedLeftStr.length % 4 === 0 && !/=$/.test(encodedLeftStr)) {
          return left + "__\0JOIN\0__";
        }
        return match;
      }
    ).replace(
      /(=\?([^?]+)\?[Qq]\?[^?]*\?=)\s*(?==\?([^?]+)\?[Qq]\?[^?]*\?=)/g,
      (match, left, chLeft, chRight) => {
        if (!joinString) {
          return match;
        }
        if (chLeft === chRight) {
          return left + "__\0JOIN\0__";
        }
        return match;
      }
    ).replace(/(\?=)?__\x00JOIN\x00__(=\?([^?]+)\?[QqBb]\?)?/g, "").replace(/(=\?[^?]+\?[QqBb]\?[^?]*\?=)\s+(?==\?[^?]+\?[QqBb]\?[^?]*\?=)/g, "$1").replace(
      /=\?([\w_\-*]+)\?([QqBb])\?([^?]*)\?=/g,
      (m, charset, encoding, text) => decodeWord(charset, encoding, text)
    );
    if (joinString && result.indexOf("�") >= 0) {
      joinString = false;
    } else {
      return result;
    }
  }
}
function decodeURIComponentWithCharset(encodedStr, charset) {
  charset = charset || "utf-8";
  let encodedBytes = [];
  for (let i = 0; i < encodedStr.length; i++) {
    let c = encodedStr.charAt(i);
    if (c === "%" && /^[a-f0-9]{2}/i.test(encodedStr.substr(i + 1, 2))) {
      let byte = encodedStr.substr(i + 1, 2);
      i += 2;
      encodedBytes.push(parseInt(byte, 16));
    } else if (c.charCodeAt(0) > 126) {
      c = textEncoder.encode(c);
      for (let j = 0; j < c.length; j++) {
        encodedBytes.push(c[j]);
      }
    } else {
      encodedBytes.push(c.charCodeAt(0));
    }
  }
  const byteStr = new ArrayBuffer(encodedBytes.length);
  const dataView = new DataView(byteStr);
  for (let i = 0, len = encodedBytes.length; i < len; i++) {
    dataView.setUint8(i, encodedBytes[i]);
  }
  return getDecoder(charset).decode(byteStr);
}
function decodeParameterValueContinuations(header) {
  let paramKeys = /* @__PURE__ */ new Map();
  Object.keys(header.params).forEach((key) => {
    let match = key.match(/\*((\d+)\*?)?$/);
    if (!match) {
      return;
    }
    let actualKey = key.substr(0, match.index).toLowerCase();
    let nr = Number(match[2]) || 0;
    let paramVal;
    if (!paramKeys.has(actualKey)) {
      paramVal = {
        charset: false,
        values: []
      };
      paramKeys.set(actualKey, paramVal);
    } else {
      paramVal = paramKeys.get(actualKey);
    }
    let value = header.params[key];
    if (nr === 0 && match[0].charAt(match[0].length - 1) === "*" && (match = value.match(/^([^']*)'[^']*'(.*)$/))) {
      paramVal.charset = match[1] || "utf-8";
      value = match[2];
    }
    paramVal.values.push({ nr, value });
    delete header.params[key];
  });
  paramKeys.forEach((paramVal, key) => {
    header.params[key] = decodeURIComponentWithCharset(
      paramVal.values.sort((a, b) => a.nr - b.nr).map((a) => a.value).join(""),
      paramVal.charset
    );
  });
}
class PassThroughDecoder {
  constructor() {
    this.chunks = [];
  }
  update(line) {
    this.chunks.push(line);
    this.chunks.push("\n");
  }
  finalize() {
    return blobToArrayBuffer(new Blob(this.chunks, { type: "application/octet-stream" }));
  }
}
class Base64Decoder {
  constructor(opts) {
    opts = opts || {};
    this.decoder = opts.decoder || new TextDecoder();
    this.maxChunkSize = 100 * 1024;
    this.chunks = [];
    this.remainder = "";
  }
  update(buffer) {
    let str = this.decoder.decode(buffer);
    str = str.replace(/[^a-zA-Z0-9+\/]+/g, "");
    this.remainder += str;
    if (this.remainder.length >= this.maxChunkSize) {
      let allowedBytes = Math.floor(this.remainder.length / 4) * 4;
      let base64Str;
      if (allowedBytes === this.remainder.length) {
        base64Str = this.remainder;
        this.remainder = "";
      } else {
        base64Str = this.remainder.substr(0, allowedBytes);
        this.remainder = this.remainder.substr(allowedBytes);
      }
      if (base64Str.length) {
        this.chunks.push(decodeBase64(base64Str));
      }
    }
  }
  finalize() {
    if (this.remainder && !/^=+$/.test(this.remainder)) {
      this.chunks.push(decodeBase64(this.remainder));
    }
    return blobToArrayBuffer(new Blob(this.chunks, { type: "application/octet-stream" }));
  }
}
const VALID_QP_REGEX = /^=[a-f0-9]{2}$/i;
const QP_SPLIT_REGEX = /(?==[a-f0-9]{2})/i;
const SOFT_LINE_BREAK_REGEX = /=\r?\n/g;
const PARTIAL_QP_ENDING_REGEX = /=[a-fA-F0-9]?$/;
class QPDecoder {
  constructor(opts) {
    opts = opts || {};
    this.decoder = opts.decoder || new TextDecoder();
    this.maxChunkSize = 100 * 1024;
    this.remainder = "";
    this.chunks = [];
  }
  decodeQPBytes(encodedBytes) {
    let buf = new ArrayBuffer(encodedBytes.length);
    let dataView = new DataView(buf);
    for (let i = 0, len = encodedBytes.length; i < len; i++) {
      dataView.setUint8(i, parseInt(encodedBytes[i], 16));
    }
    return buf;
  }
  decodeChunks(str) {
    str = str.replace(SOFT_LINE_BREAK_REGEX, "");
    let list = str.split(QP_SPLIT_REGEX);
    let encodedBytes = [];
    for (let part of list) {
      if (part.charAt(0) !== "=") {
        if (encodedBytes.length) {
          this.chunks.push(this.decodeQPBytes(encodedBytes));
          encodedBytes = [];
        }
        this.chunks.push(part);
        continue;
      }
      if (part.length === 3) {
        if (VALID_QP_REGEX.test(part)) {
          encodedBytes.push(part.substr(1));
        } else {
          if (encodedBytes.length) {
            this.chunks.push(this.decodeQPBytes(encodedBytes));
            encodedBytes = [];
          }
          this.chunks.push(part);
        }
        continue;
      }
      if (part.length > 3) {
        const firstThree = part.substr(0, 3);
        if (VALID_QP_REGEX.test(firstThree)) {
          encodedBytes.push(part.substr(1, 2));
          this.chunks.push(this.decodeQPBytes(encodedBytes));
          encodedBytes = [];
          part = part.substr(3);
          this.chunks.push(part);
        } else {
          if (encodedBytes.length) {
            this.chunks.push(this.decodeQPBytes(encodedBytes));
            encodedBytes = [];
          }
          this.chunks.push(part);
        }
      }
    }
    if (encodedBytes.length) {
      this.chunks.push(this.decodeQPBytes(encodedBytes));
    }
  }
  update(buffer) {
    let str = this.decoder.decode(buffer) + "\n";
    str = this.remainder + str;
    if (str.length < this.maxChunkSize) {
      this.remainder = str;
      return;
    }
    this.remainder = "";
    let partialEnding = str.match(PARTIAL_QP_ENDING_REGEX);
    if (partialEnding) {
      if (partialEnding.index === 0) {
        this.remainder = str;
        return;
      }
      this.remainder = str.substr(partialEnding.index);
      str = str.substr(0, partialEnding.index);
    }
    this.decodeChunks(str);
  }
  finalize() {
    if (this.remainder.length) {
      this.decodeChunks(this.remainder);
      this.remainder = "";
    }
    return blobToArrayBuffer(new Blob(this.chunks, { type: "application/octet-stream" }));
  }
}
const defaultDecoder = getDecoder();
class MimeNode {
  constructor(options) {
    this.options = options || {};
    this.postalMime = this.options.postalMime;
    this.root = !!this.options.parentNode;
    this.childNodes = [];
    if (this.options.parentNode) {
      this.parentNode = this.options.parentNode;
      this.depth = this.parentNode.depth + 1;
      if (this.depth > this.options.maxNestingDepth) {
        throw new Error(`Maximum MIME nesting depth of ${this.options.maxNestingDepth} levels exceeded`);
      }
      this.options.parentNode.childNodes.push(this);
    } else {
      this.depth = 0;
    }
    this.state = "header";
    this.headerLines = [];
    this.headerSize = 0;
    const parentMultipartType = this.options.parentMultipartType || null;
    const defaultContentType = parentMultipartType === "digest" ? "message/rfc822" : "text/plain";
    this.contentType = {
      value: defaultContentType,
      default: true
    };
    this.contentTransferEncoding = {
      value: "8bit"
    };
    this.contentDisposition = {
      value: ""
    };
    this.headers = [];
    this.contentDecoder = false;
  }
  setupContentDecoder(transferEncoding) {
    if (/base64/i.test(transferEncoding)) {
      this.contentDecoder = new Base64Decoder();
    } else if (/quoted-printable/i.test(transferEncoding)) {
      this.contentDecoder = new QPDecoder({ decoder: getDecoder(this.contentType.parsed.params.charset) });
    } else {
      this.contentDecoder = new PassThroughDecoder();
    }
  }
  async finalize() {
    if (this.state === "finished") {
      return;
    }
    if (this.state === "header") {
      this.processHeaders();
    }
    let boundaries = this.postalMime.boundaries;
    for (let i = boundaries.length - 1; i >= 0; i--) {
      let boundary = boundaries[i];
      if (boundary.node === this) {
        boundaries.splice(i, 1);
        break;
      }
    }
    await this.finalizeChildNodes();
    this.content = this.contentDecoder ? await this.contentDecoder.finalize() : null;
    this.state = "finished";
  }
  async finalizeChildNodes() {
    for (let childNode of this.childNodes) {
      await childNode.finalize();
    }
  }
  // Strip RFC 822 comments (parenthesized text) from structured header values
  stripComments(str) {
    let result = "";
    let depth = 0;
    let escaped = false;
    let inQuote = false;
    for (let i = 0; i < str.length; i++) {
      const chr = str.charAt(i);
      if (escaped) {
        if (depth === 0) {
          result += chr;
        }
        escaped = false;
        continue;
      }
      if (chr === "\\") {
        escaped = true;
        if (depth === 0) {
          result += chr;
        }
        continue;
      }
      if (chr === '"' && depth === 0) {
        inQuote = !inQuote;
        result += chr;
        continue;
      }
      if (!inQuote) {
        if (chr === "(") {
          depth++;
          continue;
        }
        if (chr === ")" && depth > 0) {
          depth--;
          continue;
        }
      }
      if (depth === 0) {
        result += chr;
      }
    }
    return result;
  }
  parseStructuredHeader(str) {
    str = this.stripComments(str);
    let response = {
      value: false,
      params: {}
    };
    let key = false;
    let value = "";
    let stage = "value";
    let quote = false;
    let escaped = false;
    let chr;
    for (let i = 0, len = str.length; i < len; i++) {
      chr = str.charAt(i);
      switch (stage) {
        case "key":
          if (chr === "=") {
            key = value.trim().toLowerCase();
            stage = "value";
            value = "";
            break;
          }
          value += chr;
          break;
        case "value":
          if (escaped) {
            value += chr;
          } else if (chr === "\\") {
            escaped = true;
            continue;
          } else if (quote && chr === quote) {
            quote = false;
          } else if (!quote && chr === '"') {
            quote = chr;
          } else if (!quote && chr === ";") {
            if (key === false) {
              response.value = value.trim();
            } else {
              response.params[key] = value.trim();
            }
            stage = "key";
            value = "";
          } else {
            value += chr;
          }
          escaped = false;
          break;
      }
    }
    value = value.trim();
    if (stage === "value") {
      if (key === false) {
        response.value = value;
      } else {
        response.params[key] = value;
      }
    } else if (value) {
      response.params[value.toLowerCase()] = "";
    }
    if (response.value) {
      response.value = response.value.toLowerCase();
    }
    decodeParameterValueContinuations(response);
    return response;
  }
  decodeFlowedText(str, delSp) {
    return str.split(/\r?\n/).reduce((previousValue, currentValue) => {
      if (previousValue.endsWith(" ") && previousValue !== "-- " && !previousValue.endsWith("\n-- ")) {
        if (delSp) {
          return previousValue.slice(0, -1) + currentValue;
        } else {
          return previousValue + currentValue;
        }
      } else {
        return previousValue + "\n" + currentValue;
      }
    }).replace(/^ /gm, "");
  }
  getTextContent() {
    if (!this.content) {
      return "";
    }
    let str = getDecoder(this.contentType.parsed.params.charset).decode(this.content);
    if (/^flowed$/i.test(this.contentType.parsed.params.format)) {
      str = this.decodeFlowedText(str, /^yes$/i.test(this.contentType.parsed.params.delsp));
    }
    return str;
  }
  processHeaders() {
    for (let i = this.headerLines.length - 1; i >= 0; i--) {
      let line = this.headerLines[i];
      if (i && /^\s/.test(line)) {
        this.headerLines[i - 1] += "\n" + line;
        this.headerLines.splice(i, 1);
      }
    }
    this.rawHeaderLines = [];
    for (let i = this.headerLines.length - 1; i >= 0; i--) {
      let rawLine = this.headerLines[i];
      let sep = rawLine.indexOf(":");
      let rawKey = sep < 0 ? rawLine.trim() : rawLine.substr(0, sep).trim();
      this.rawHeaderLines.push({
        key: rawKey.toLowerCase(),
        line: rawLine
      });
      let normalizedLine = rawLine.replace(/\s+/g, " ");
      sep = normalizedLine.indexOf(":");
      let key = sep < 0 ? normalizedLine.trim() : normalizedLine.substr(0, sep).trim();
      let value = sep < 0 ? "" : normalizedLine.substr(sep + 1).trim();
      this.headers.push({ key: key.toLowerCase(), originalKey: key, value });
      switch (key.toLowerCase()) {
        case "content-type":
          if (this.contentType.default) {
            this.contentType = { value, parsed: {} };
          }
          break;
        case "content-transfer-encoding":
          this.contentTransferEncoding = { value, parsed: {} };
          break;
        case "content-disposition":
          this.contentDisposition = { value, parsed: {} };
          break;
        case "content-id":
          this.contentId = value;
          break;
        case "content-description":
          this.contentDescription = value;
          break;
      }
    }
    this.contentType.parsed = this.parseStructuredHeader(this.contentType.value);
    this.contentType.multipart = /^multipart\//i.test(this.contentType.parsed.value) ? this.contentType.parsed.value.substr(this.contentType.parsed.value.indexOf("/") + 1) : false;
    if (this.contentType.multipart && this.contentType.parsed.params.boundary) {
      this.postalMime.boundaries.push({
        value: textEncoder.encode(this.contentType.parsed.params.boundary),
        node: this
      });
    }
    this.contentDisposition.parsed = this.parseStructuredHeader(this.contentDisposition.value);
    this.contentTransferEncoding.encoding = this.contentTransferEncoding.value.toLowerCase().split(/[^\w-]/).shift();
    this.setupContentDecoder(this.contentTransferEncoding.encoding);
  }
  feed(line) {
    switch (this.state) {
      case "header":
        if (!line.length) {
          this.state = "body";
          return this.processHeaders();
        }
        this.headerSize += line.length;
        if (this.headerSize > this.options.maxHeadersSize) {
          let error = new Error(`Maximum header size of ${this.options.maxHeadersSize} bytes exceeded`);
          throw error;
        }
        this.headerLines.push(defaultDecoder.decode(line));
        break;
      case "body": {
        this.contentDecoder.update(line);
      }
    }
  }
}
const htmlEntities = {
  "&AElig": "Æ",
  "&AElig;": "Æ",
  "&AMP": "&",
  "&AMP;": "&",
  "&Aacute": "Á",
  "&Aacute;": "Á",
  "&Abreve;": "Ă",
  "&Acirc": "Â",
  "&Acirc;": "Â",
  "&Acy;": "А",
  "&Afr;": "𝔄",
  "&Agrave": "À",
  "&Agrave;": "À",
  "&Alpha;": "Α",
  "&Amacr;": "Ā",
  "&And;": "⩓",
  "&Aogon;": "Ą",
  "&Aopf;": "𝔸",
  "&ApplyFunction;": "⁡",
  "&Aring": "Å",
  "&Aring;": "Å",
  "&Ascr;": "𝒜",
  "&Assign;": "≔",
  "&Atilde": "Ã",
  "&Atilde;": "Ã",
  "&Auml": "Ä",
  "&Auml;": "Ä",
  "&Backslash;": "∖",
  "&Barv;": "⫧",
  "&Barwed;": "⌆",
  "&Bcy;": "Б",
  "&Because;": "∵",
  "&Bernoullis;": "ℬ",
  "&Beta;": "Β",
  "&Bfr;": "𝔅",
  "&Bopf;": "𝔹",
  "&Breve;": "˘",
  "&Bscr;": "ℬ",
  "&Bumpeq;": "≎",
  "&CHcy;": "Ч",
  "&COPY": "©",
  "&COPY;": "©",
  "&Cacute;": "Ć",
  "&Cap;": "⋒",
  "&CapitalDifferentialD;": "ⅅ",
  "&Cayleys;": "ℭ",
  "&Ccaron;": "Č",
  "&Ccedil": "Ç",
  "&Ccedil;": "Ç",
  "&Ccirc;": "Ĉ",
  "&Cconint;": "∰",
  "&Cdot;": "Ċ",
  "&Cedilla;": "¸",
  "&CenterDot;": "·",
  "&Cfr;": "ℭ",
  "&Chi;": "Χ",
  "&CircleDot;": "⊙",
  "&CircleMinus;": "⊖",
  "&CirclePlus;": "⊕",
  "&CircleTimes;": "⊗",
  "&ClockwiseContourIntegral;": "∲",
  "&CloseCurlyDoubleQuote;": "”",
  "&CloseCurlyQuote;": "’",
  "&Colon;": "∷",
  "&Colone;": "⩴",
  "&Congruent;": "≡",
  "&Conint;": "∯",
  "&ContourIntegral;": "∮",
  "&Copf;": "ℂ",
  "&Coproduct;": "∐",
  "&CounterClockwiseContourIntegral;": "∳",
  "&Cross;": "⨯",
  "&Cscr;": "𝒞",
  "&Cup;": "⋓",
  "&CupCap;": "≍",
  "&DD;": "ⅅ",
  "&DDotrahd;": "⤑",
  "&DJcy;": "Ђ",
  "&DScy;": "Ѕ",
  "&DZcy;": "Џ",
  "&Dagger;": "‡",
  "&Darr;": "↡",
  "&Dashv;": "⫤",
  "&Dcaron;": "Ď",
  "&Dcy;": "Д",
  "&Del;": "∇",
  "&Delta;": "Δ",
  "&Dfr;": "𝔇",
  "&DiacriticalAcute;": "´",
  "&DiacriticalDot;": "˙",
  "&DiacriticalDoubleAcute;": "˝",
  "&DiacriticalGrave;": "`",
  "&DiacriticalTilde;": "˜",
  "&Diamond;": "⋄",
  "&DifferentialD;": "ⅆ",
  "&Dopf;": "𝔻",
  "&Dot;": "¨",
  "&DotDot;": "⃜",
  "&DotEqual;": "≐",
  "&DoubleContourIntegral;": "∯",
  "&DoubleDot;": "¨",
  "&DoubleDownArrow;": "⇓",
  "&DoubleLeftArrow;": "⇐",
  "&DoubleLeftRightArrow;": "⇔",
  "&DoubleLeftTee;": "⫤",
  "&DoubleLongLeftArrow;": "⟸",
  "&DoubleLongLeftRightArrow;": "⟺",
  "&DoubleLongRightArrow;": "⟹",
  "&DoubleRightArrow;": "⇒",
  "&DoubleRightTee;": "⊨",
  "&DoubleUpArrow;": "⇑",
  "&DoubleUpDownArrow;": "⇕",
  "&DoubleVerticalBar;": "∥",
  "&DownArrow;": "↓",
  "&DownArrowBar;": "⤓",
  "&DownArrowUpArrow;": "⇵",
  "&DownBreve;": "̑",
  "&DownLeftRightVector;": "⥐",
  "&DownLeftTeeVector;": "⥞",
  "&DownLeftVector;": "↽",
  "&DownLeftVectorBar;": "⥖",
  "&DownRightTeeVector;": "⥟",
  "&DownRightVector;": "⇁",
  "&DownRightVectorBar;": "⥗",
  "&DownTee;": "⊤",
  "&DownTeeArrow;": "↧",
  "&Downarrow;": "⇓",
  "&Dscr;": "𝒟",
  "&Dstrok;": "Đ",
  "&ENG;": "Ŋ",
  "&ETH": "Ð",
  "&ETH;": "Ð",
  "&Eacute": "É",
  "&Eacute;": "É",
  "&Ecaron;": "Ě",
  "&Ecirc": "Ê",
  "&Ecirc;": "Ê",
  "&Ecy;": "Э",
  "&Edot;": "Ė",
  "&Efr;": "𝔈",
  "&Egrave": "È",
  "&Egrave;": "È",
  "&Element;": "∈",
  "&Emacr;": "Ē",
  "&EmptySmallSquare;": "◻",
  "&EmptyVerySmallSquare;": "▫",
  "&Eogon;": "Ę",
  "&Eopf;": "𝔼",
  "&Epsilon;": "Ε",
  "&Equal;": "⩵",
  "&EqualTilde;": "≂",
  "&Equilibrium;": "⇌",
  "&Escr;": "ℰ",
  "&Esim;": "⩳",
  "&Eta;": "Η",
  "&Euml": "Ë",
  "&Euml;": "Ë",
  "&Exists;": "∃",
  "&ExponentialE;": "ⅇ",
  "&Fcy;": "Ф",
  "&Ffr;": "𝔉",
  "&FilledSmallSquare;": "◼",
  "&FilledVerySmallSquare;": "▪",
  "&Fopf;": "𝔽",
  "&ForAll;": "∀",
  "&Fouriertrf;": "ℱ",
  "&Fscr;": "ℱ",
  "&GJcy;": "Ѓ",
  "&GT": ">",
  "&GT;": ">",
  "&Gamma;": "Γ",
  "&Gammad;": "Ϝ",
  "&Gbreve;": "Ğ",
  "&Gcedil;": "Ģ",
  "&Gcirc;": "Ĝ",
  "&Gcy;": "Г",
  "&Gdot;": "Ġ",
  "&Gfr;": "𝔊",
  "&Gg;": "⋙",
  "&Gopf;": "𝔾",
  "&GreaterEqual;": "≥",
  "&GreaterEqualLess;": "⋛",
  "&GreaterFullEqual;": "≧",
  "&GreaterGreater;": "⪢",
  "&GreaterLess;": "≷",
  "&GreaterSlantEqual;": "⩾",
  "&GreaterTilde;": "≳",
  "&Gscr;": "𝒢",
  "&Gt;": "≫",
  "&HARDcy;": "Ъ",
  "&Hacek;": "ˇ",
  "&Hat;": "^",
  "&Hcirc;": "Ĥ",
  "&Hfr;": "ℌ",
  "&HilbertSpace;": "ℋ",
  "&Hopf;": "ℍ",
  "&HorizontalLine;": "─",
  "&Hscr;": "ℋ",
  "&Hstrok;": "Ħ",
  "&HumpDownHump;": "≎",
  "&HumpEqual;": "≏",
  "&IEcy;": "Е",
  "&IJlig;": "Ĳ",
  "&IOcy;": "Ё",
  "&Iacute": "Í",
  "&Iacute;": "Í",
  "&Icirc": "Î",
  "&Icirc;": "Î",
  "&Icy;": "И",
  "&Idot;": "İ",
  "&Ifr;": "ℑ",
  "&Igrave": "Ì",
  "&Igrave;": "Ì",
  "&Im;": "ℑ",
  "&Imacr;": "Ī",
  "&ImaginaryI;": "ⅈ",
  "&Implies;": "⇒",
  "&Int;": "∬",
  "&Integral;": "∫",
  "&Intersection;": "⋂",
  "&InvisibleComma;": "⁣",
  "&InvisibleTimes;": "⁢",
  "&Iogon;": "Į",
  "&Iopf;": "𝕀",
  "&Iota;": "Ι",
  "&Iscr;": "ℐ",
  "&Itilde;": "Ĩ",
  "&Iukcy;": "І",
  "&Iuml": "Ï",
  "&Iuml;": "Ï",
  "&Jcirc;": "Ĵ",
  "&Jcy;": "Й",
  "&Jfr;": "𝔍",
  "&Jopf;": "𝕁",
  "&Jscr;": "𝒥",
  "&Jsercy;": "Ј",
  "&Jukcy;": "Є",
  "&KHcy;": "Х",
  "&KJcy;": "Ќ",
  "&Kappa;": "Κ",
  "&Kcedil;": "Ķ",
  "&Kcy;": "К",
  "&Kfr;": "𝔎",
  "&Kopf;": "𝕂",
  "&Kscr;": "𝒦",
  "&LJcy;": "Љ",
  "&LT": "<",
  "&LT;": "<",
  "&Lacute;": "Ĺ",
  "&Lambda;": "Λ",
  "&Lang;": "⟪",
  "&Laplacetrf;": "ℒ",
  "&Larr;": "↞",
  "&Lcaron;": "Ľ",
  "&Lcedil;": "Ļ",
  "&Lcy;": "Л",
  "&LeftAngleBracket;": "⟨",
  "&LeftArrow;": "←",
  "&LeftArrowBar;": "⇤",
  "&LeftArrowRightArrow;": "⇆",
  "&LeftCeiling;": "⌈",
  "&LeftDoubleBracket;": "⟦",
  "&LeftDownTeeVector;": "⥡",
  "&LeftDownVector;": "⇃",
  "&LeftDownVectorBar;": "⥙",
  "&LeftFloor;": "⌊",
  "&LeftRightArrow;": "↔",
  "&LeftRightVector;": "⥎",
  "&LeftTee;": "⊣",
  "&LeftTeeArrow;": "↤",
  "&LeftTeeVector;": "⥚",
  "&LeftTriangle;": "⊲",
  "&LeftTriangleBar;": "⧏",
  "&LeftTriangleEqual;": "⊴",
  "&LeftUpDownVector;": "⥑",
  "&LeftUpTeeVector;": "⥠",
  "&LeftUpVector;": "↿",
  "&LeftUpVectorBar;": "⥘",
  "&LeftVector;": "↼",
  "&LeftVectorBar;": "⥒",
  "&Leftarrow;": "⇐",
  "&Leftrightarrow;": "⇔",
  "&LessEqualGreater;": "⋚",
  "&LessFullEqual;": "≦",
  "&LessGreater;": "≶",
  "&LessLess;": "⪡",
  "&LessSlantEqual;": "⩽",
  "&LessTilde;": "≲",
  "&Lfr;": "𝔏",
  "&Ll;": "⋘",
  "&Lleftarrow;": "⇚",
  "&Lmidot;": "Ŀ",
  "&LongLeftArrow;": "⟵",
  "&LongLeftRightArrow;": "⟷",
  "&LongRightArrow;": "⟶",
  "&Longleftarrow;": "⟸",
  "&Longleftrightarrow;": "⟺",
  "&Longrightarrow;": "⟹",
  "&Lopf;": "𝕃",
  "&LowerLeftArrow;": "↙",
  "&LowerRightArrow;": "↘",
  "&Lscr;": "ℒ",
  "&Lsh;": "↰",
  "&Lstrok;": "Ł",
  "&Lt;": "≪",
  "&Map;": "⤅",
  "&Mcy;": "М",
  "&MediumSpace;": " ",
  "&Mellintrf;": "ℳ",
  "&Mfr;": "𝔐",
  "&MinusPlus;": "∓",
  "&Mopf;": "𝕄",
  "&Mscr;": "ℳ",
  "&Mu;": "Μ",
  "&NJcy;": "Њ",
  "&Nacute;": "Ń",
  "&Ncaron;": "Ň",
  "&Ncedil;": "Ņ",
  "&Ncy;": "Н",
  "&NegativeMediumSpace;": "​",
  "&NegativeThickSpace;": "​",
  "&NegativeThinSpace;": "​",
  "&NegativeVeryThinSpace;": "​",
  "&NestedGreaterGreater;": "≫",
  "&NestedLessLess;": "≪",
  "&NewLine;": "\n",
  "&Nfr;": "𝔑",
  "&NoBreak;": "⁠",
  "&NonBreakingSpace;": " ",
  "&Nopf;": "ℕ",
  "&Not;": "⫬",
  "&NotCongruent;": "≢",
  "&NotCupCap;": "≭",
  "&NotDoubleVerticalBar;": "∦",
  "&NotElement;": "∉",
  "&NotEqual;": "≠",
  "&NotEqualTilde;": "≂̸",
  "&NotExists;": "∄",
  "&NotGreater;": "≯",
  "&NotGreaterEqual;": "≱",
  "&NotGreaterFullEqual;": "≧̸",
  "&NotGreaterGreater;": "≫̸",
  "&NotGreaterLess;": "≹",
  "&NotGreaterSlantEqual;": "⩾̸",
  "&NotGreaterTilde;": "≵",
  "&NotHumpDownHump;": "≎̸",
  "&NotHumpEqual;": "≏̸",
  "&NotLeftTriangle;": "⋪",
  "&NotLeftTriangleBar;": "⧏̸",
  "&NotLeftTriangleEqual;": "⋬",
  "&NotLess;": "≮",
  "&NotLessEqual;": "≰",
  "&NotLessGreater;": "≸",
  "&NotLessLess;": "≪̸",
  "&NotLessSlantEqual;": "⩽̸",
  "&NotLessTilde;": "≴",
  "&NotNestedGreaterGreater;": "⪢̸",
  "&NotNestedLessLess;": "⪡̸",
  "&NotPrecedes;": "⊀",
  "&NotPrecedesEqual;": "⪯̸",
  "&NotPrecedesSlantEqual;": "⋠",
  "&NotReverseElement;": "∌",
  "&NotRightTriangle;": "⋫",
  "&NotRightTriangleBar;": "⧐̸",
  "&NotRightTriangleEqual;": "⋭",
  "&NotSquareSubset;": "⊏̸",
  "&NotSquareSubsetEqual;": "⋢",
  "&NotSquareSuperset;": "⊐̸",
  "&NotSquareSupersetEqual;": "⋣",
  "&NotSubset;": "⊂⃒",
  "&NotSubsetEqual;": "⊈",
  "&NotSucceeds;": "⊁",
  "&NotSucceedsEqual;": "⪰̸",
  "&NotSucceedsSlantEqual;": "⋡",
  "&NotSucceedsTilde;": "≿̸",
  "&NotSuperset;": "⊃⃒",
  "&NotSupersetEqual;": "⊉",
  "&NotTilde;": "≁",
  "&NotTildeEqual;": "≄",
  "&NotTildeFullEqual;": "≇",
  "&NotTildeTilde;": "≉",
  "&NotVerticalBar;": "∤",
  "&Nscr;": "𝒩",
  "&Ntilde": "Ñ",
  "&Ntilde;": "Ñ",
  "&Nu;": "Ν",
  "&OElig;": "Œ",
  "&Oacute": "Ó",
  "&Oacute;": "Ó",
  "&Ocirc": "Ô",
  "&Ocirc;": "Ô",
  "&Ocy;": "О",
  "&Odblac;": "Ő",
  "&Ofr;": "𝔒",
  "&Ograve": "Ò",
  "&Ograve;": "Ò",
  "&Omacr;": "Ō",
  "&Omega;": "Ω",
  "&Omicron;": "Ο",
  "&Oopf;": "𝕆",
  "&OpenCurlyDoubleQuote;": "“",
  "&OpenCurlyQuote;": "‘",
  "&Or;": "⩔",
  "&Oscr;": "𝒪",
  "&Oslash": "Ø",
  "&Oslash;": "Ø",
  "&Otilde": "Õ",
  "&Otilde;": "Õ",
  "&Otimes;": "⨷",
  "&Ouml": "Ö",
  "&Ouml;": "Ö",
  "&OverBar;": "‾",
  "&OverBrace;": "⏞",
  "&OverBracket;": "⎴",
  "&OverParenthesis;": "⏜",
  "&PartialD;": "∂",
  "&Pcy;": "П",
  "&Pfr;": "𝔓",
  "&Phi;": "Φ",
  "&Pi;": "Π",
  "&PlusMinus;": "±",
  "&Poincareplane;": "ℌ",
  "&Popf;": "ℙ",
  "&Pr;": "⪻",
  "&Precedes;": "≺",
  "&PrecedesEqual;": "⪯",
  "&PrecedesSlantEqual;": "≼",
  "&PrecedesTilde;": "≾",
  "&Prime;": "″",
  "&Product;": "∏",
  "&Proportion;": "∷",
  "&Proportional;": "∝",
  "&Pscr;": "𝒫",
  "&Psi;": "Ψ",
  "&QUOT": '"',
  "&QUOT;": '"',
  "&Qfr;": "𝔔",
  "&Qopf;": "ℚ",
  "&Qscr;": "𝒬",
  "&RBarr;": "⤐",
  "&REG": "®",
  "&REG;": "®",
  "&Racute;": "Ŕ",
  "&Rang;": "⟫",
  "&Rarr;": "↠",
  "&Rarrtl;": "⤖",
  "&Rcaron;": "Ř",
  "&Rcedil;": "Ŗ",
  "&Rcy;": "Р",
  "&Re;": "ℜ",
  "&ReverseElement;": "∋",
  "&ReverseEquilibrium;": "⇋",
  "&ReverseUpEquilibrium;": "⥯",
  "&Rfr;": "ℜ",
  "&Rho;": "Ρ",
  "&RightAngleBracket;": "⟩",
  "&RightArrow;": "→",
  "&RightArrowBar;": "⇥",
  "&RightArrowLeftArrow;": "⇄",
  "&RightCeiling;": "⌉",
  "&RightDoubleBracket;": "⟧",
  "&RightDownTeeVector;": "⥝",
  "&RightDownVector;": "⇂",
  "&RightDownVectorBar;": "⥕",
  "&RightFloor;": "⌋",
  "&RightTee;": "⊢",
  "&RightTeeArrow;": "↦",
  "&RightTeeVector;": "⥛",
  "&RightTriangle;": "⊳",
  "&RightTriangleBar;": "⧐",
  "&RightTriangleEqual;": "⊵",
  "&RightUpDownVector;": "⥏",
  "&RightUpTeeVector;": "⥜",
  "&RightUpVector;": "↾",
  "&RightUpVectorBar;": "⥔",
  "&RightVector;": "⇀",
  "&RightVectorBar;": "⥓",
  "&Rightarrow;": "⇒",
  "&Ropf;": "ℝ",
  "&RoundImplies;": "⥰",
  "&Rrightarrow;": "⇛",
  "&Rscr;": "ℛ",
  "&Rsh;": "↱",
  "&RuleDelayed;": "⧴",
  "&SHCHcy;": "Щ",
  "&SHcy;": "Ш",
  "&SOFTcy;": "Ь",
  "&Sacute;": "Ś",
  "&Sc;": "⪼",
  "&Scaron;": "Š",
  "&Scedil;": "Ş",
  "&Scirc;": "Ŝ",
  "&Scy;": "С",
  "&Sfr;": "𝔖",
  "&ShortDownArrow;": "↓",
  "&ShortLeftArrow;": "←",
  "&ShortRightArrow;": "→",
  "&ShortUpArrow;": "↑",
  "&Sigma;": "Σ",
  "&SmallCircle;": "∘",
  "&Sopf;": "𝕊",
  "&Sqrt;": "√",
  "&Square;": "□",
  "&SquareIntersection;": "⊓",
  "&SquareSubset;": "⊏",
  "&SquareSubsetEqual;": "⊑",
  "&SquareSuperset;": "⊐",
  "&SquareSupersetEqual;": "⊒",
  "&SquareUnion;": "⊔",
  "&Sscr;": "𝒮",
  "&Star;": "⋆",
  "&Sub;": "⋐",
  "&Subset;": "⋐",
  "&SubsetEqual;": "⊆",
  "&Succeeds;": "≻",
  "&SucceedsEqual;": "⪰",
  "&SucceedsSlantEqual;": "≽",
  "&SucceedsTilde;": "≿",
  "&SuchThat;": "∋",
  "&Sum;": "∑",
  "&Sup;": "⋑",
  "&Superset;": "⊃",
  "&SupersetEqual;": "⊇",
  "&Supset;": "⋑",
  "&THORN": "Þ",
  "&THORN;": "Þ",
  "&TRADE;": "™",
  "&TSHcy;": "Ћ",
  "&TScy;": "Ц",
  "&Tab;": "	",
  "&Tau;": "Τ",
  "&Tcaron;": "Ť",
  "&Tcedil;": "Ţ",
  "&Tcy;": "Т",
  "&Tfr;": "𝔗",
  "&Therefore;": "∴",
  "&Theta;": "Θ",
  "&ThickSpace;": "  ",
  "&ThinSpace;": " ",
  "&Tilde;": "∼",
  "&TildeEqual;": "≃",
  "&TildeFullEqual;": "≅",
  "&TildeTilde;": "≈",
  "&Topf;": "𝕋",
  "&TripleDot;": "⃛",
  "&Tscr;": "𝒯",
  "&Tstrok;": "Ŧ",
  "&Uacute": "Ú",
  "&Uacute;": "Ú",
  "&Uarr;": "↟",
  "&Uarrocir;": "⥉",
  "&Ubrcy;": "Ў",
  "&Ubreve;": "Ŭ",
  "&Ucirc": "Û",
  "&Ucirc;": "Û",
  "&Ucy;": "У",
  "&Udblac;": "Ű",
  "&Ufr;": "𝔘",
  "&Ugrave": "Ù",
  "&Ugrave;": "Ù",
  "&Umacr;": "Ū",
  "&UnderBar;": "_",
  "&UnderBrace;": "⏟",
  "&UnderBracket;": "⎵",
  "&UnderParenthesis;": "⏝",
  "&Union;": "⋃",
  "&UnionPlus;": "⊎",
  "&Uogon;": "Ų",
  "&Uopf;": "𝕌",
  "&UpArrow;": "↑",
  "&UpArrowBar;": "⤒",
  "&UpArrowDownArrow;": "⇅",
  "&UpDownArrow;": "↕",
  "&UpEquilibrium;": "⥮",
  "&UpTee;": "⊥",
  "&UpTeeArrow;": "↥",
  "&Uparrow;": "⇑",
  "&Updownarrow;": "⇕",
  "&UpperLeftArrow;": "↖",
  "&UpperRightArrow;": "↗",
  "&Upsi;": "ϒ",
  "&Upsilon;": "Υ",
  "&Uring;": "Ů",
  "&Uscr;": "𝒰",
  "&Utilde;": "Ũ",
  "&Uuml": "Ü",
  "&Uuml;": "Ü",
  "&VDash;": "⊫",
  "&Vbar;": "⫫",
  "&Vcy;": "В",
  "&Vdash;": "⊩",
  "&Vdashl;": "⫦",
  "&Vee;": "⋁",
  "&Verbar;": "‖",
  "&Vert;": "‖",
  "&VerticalBar;": "∣",
  "&VerticalLine;": "|",
  "&VerticalSeparator;": "❘",
  "&VerticalTilde;": "≀",
  "&VeryThinSpace;": " ",
  "&Vfr;": "𝔙",
  "&Vopf;": "𝕍",
  "&Vscr;": "𝒱",
  "&Vvdash;": "⊪",
  "&Wcirc;": "Ŵ",
  "&Wedge;": "⋀",
  "&Wfr;": "𝔚",
  "&Wopf;": "𝕎",
  "&Wscr;": "𝒲",
  "&Xfr;": "𝔛",
  "&Xi;": "Ξ",
  "&Xopf;": "𝕏",
  "&Xscr;": "𝒳",
  "&YAcy;": "Я",
  "&YIcy;": "Ї",
  "&YUcy;": "Ю",
  "&Yacute": "Ý",
  "&Yacute;": "Ý",
  "&Ycirc;": "Ŷ",
  "&Ycy;": "Ы",
  "&Yfr;": "𝔜",
  "&Yopf;": "𝕐",
  "&Yscr;": "𝒴",
  "&Yuml;": "Ÿ",
  "&ZHcy;": "Ж",
  "&Zacute;": "Ź",
  "&Zcaron;": "Ž",
  "&Zcy;": "З",
  "&Zdot;": "Ż",
  "&ZeroWidthSpace;": "​",
  "&Zeta;": "Ζ",
  "&Zfr;": "ℨ",
  "&Zopf;": "ℤ",
  "&Zscr;": "𝒵",
  "&aacute": "á",
  "&aacute;": "á",
  "&abreve;": "ă",
  "&ac;": "∾",
  "&acE;": "∾̳",
  "&acd;": "∿",
  "&acirc": "â",
  "&acirc;": "â",
  "&acute": "´",
  "&acute;": "´",
  "&acy;": "а",
  "&aelig": "æ",
  "&aelig;": "æ",
  "&af;": "⁡",
  "&afr;": "𝔞",
  "&agrave": "à",
  "&agrave;": "à",
  "&alefsym;": "ℵ",
  "&aleph;": "ℵ",
  "&alpha;": "α",
  "&amacr;": "ā",
  "&amalg;": "⨿",
  "&amp": "&",
  "&amp;": "&",
  "&and;": "∧",
  "&andand;": "⩕",
  "&andd;": "⩜",
  "&andslope;": "⩘",
  "&andv;": "⩚",
  "&ang;": "∠",
  "&ange;": "⦤",
  "&angle;": "∠",
  "&angmsd;": "∡",
  "&angmsdaa;": "⦨",
  "&angmsdab;": "⦩",
  "&angmsdac;": "⦪",
  "&angmsdad;": "⦫",
  "&angmsdae;": "⦬",
  "&angmsdaf;": "⦭",
  "&angmsdag;": "⦮",
  "&angmsdah;": "⦯",
  "&angrt;": "∟",
  "&angrtvb;": "⊾",
  "&angrtvbd;": "⦝",
  "&angsph;": "∢",
  "&angst;": "Å",
  "&angzarr;": "⍼",
  "&aogon;": "ą",
  "&aopf;": "𝕒",
  "&ap;": "≈",
  "&apE;": "⩰",
  "&apacir;": "⩯",
  "&ape;": "≊",
  "&apid;": "≋",
  "&apos;": "'",
  "&approx;": "≈",
  "&approxeq;": "≊",
  "&aring": "å",
  "&aring;": "å",
  "&ascr;": "𝒶",
  "&ast;": "*",
  "&asymp;": "≈",
  "&asympeq;": "≍",
  "&atilde": "ã",
  "&atilde;": "ã",
  "&auml": "ä",
  "&auml;": "ä",
  "&awconint;": "∳",
  "&awint;": "⨑",
  "&bNot;": "⫭",
  "&backcong;": "≌",
  "&backepsilon;": "϶",
  "&backprime;": "‵",
  "&backsim;": "∽",
  "&backsimeq;": "⋍",
  "&barvee;": "⊽",
  "&barwed;": "⌅",
  "&barwedge;": "⌅",
  "&bbrk;": "⎵",
  "&bbrktbrk;": "⎶",
  "&bcong;": "≌",
  "&bcy;": "б",
  "&bdquo;": "„",
  "&becaus;": "∵",
  "&because;": "∵",
  "&bemptyv;": "⦰",
  "&bepsi;": "϶",
  "&bernou;": "ℬ",
  "&beta;": "β",
  "&beth;": "ℶ",
  "&between;": "≬",
  "&bfr;": "𝔟",
  "&bigcap;": "⋂",
  "&bigcirc;": "◯",
  "&bigcup;": "⋃",
  "&bigodot;": "⨀",
  "&bigoplus;": "⨁",
  "&bigotimes;": "⨂",
  "&bigsqcup;": "⨆",
  "&bigstar;": "★",
  "&bigtriangledown;": "▽",
  "&bigtriangleup;": "△",
  "&biguplus;": "⨄",
  "&bigvee;": "⋁",
  "&bigwedge;": "⋀",
  "&bkarow;": "⤍",
  "&blacklozenge;": "⧫",
  "&blacksquare;": "▪",
  "&blacktriangle;": "▴",
  "&blacktriangledown;": "▾",
  "&blacktriangleleft;": "◂",
  "&blacktriangleright;": "▸",
  "&blank;": "␣",
  "&blk12;": "▒",
  "&blk14;": "░",
  "&blk34;": "▓",
  "&block;": "█",
  "&bne;": "=⃥",
  "&bnequiv;": "≡⃥",
  "&bnot;": "⌐",
  "&bopf;": "𝕓",
  "&bot;": "⊥",
  "&bottom;": "⊥",
  "&bowtie;": "⋈",
  "&boxDL;": "╗",
  "&boxDR;": "╔",
  "&boxDl;": "╖",
  "&boxDr;": "╓",
  "&boxH;": "═",
  "&boxHD;": "╦",
  "&boxHU;": "╩",
  "&boxHd;": "╤",
  "&boxHu;": "╧",
  "&boxUL;": "╝",
  "&boxUR;": "╚",
  "&boxUl;": "╜",
  "&boxUr;": "╙",
  "&boxV;": "║",
  "&boxVH;": "╬",
  "&boxVL;": "╣",
  "&boxVR;": "╠",
  "&boxVh;": "╫",
  "&boxVl;": "╢",
  "&boxVr;": "╟",
  "&boxbox;": "⧉",
  "&boxdL;": "╕",
  "&boxdR;": "╒",
  "&boxdl;": "┐",
  "&boxdr;": "┌",
  "&boxh;": "─",
  "&boxhD;": "╥",
  "&boxhU;": "╨",
  "&boxhd;": "┬",
  "&boxhu;": "┴",
  "&boxminus;": "⊟",
  "&boxplus;": "⊞",
  "&boxtimes;": "⊠",
  "&boxuL;": "╛",
  "&boxuR;": "╘",
  "&boxul;": "┘",
  "&boxur;": "└",
  "&boxv;": "│",
  "&boxvH;": "╪",
  "&boxvL;": "╡",
  "&boxvR;": "╞",
  "&boxvh;": "┼",
  "&boxvl;": "┤",
  "&boxvr;": "├",
  "&bprime;": "‵",
  "&breve;": "˘",
  "&brvbar": "¦",
  "&brvbar;": "¦",
  "&bscr;": "𝒷",
  "&bsemi;": "⁏",
  "&bsim;": "∽",
  "&bsime;": "⋍",
  "&bsol;": "\\",
  "&bsolb;": "⧅",
  "&bsolhsub;": "⟈",
  "&bull;": "•",
  "&bullet;": "•",
  "&bump;": "≎",
  "&bumpE;": "⪮",
  "&bumpe;": "≏",
  "&bumpeq;": "≏",
  "&cacute;": "ć",
  "&cap;": "∩",
  "&capand;": "⩄",
  "&capbrcup;": "⩉",
  "&capcap;": "⩋",
  "&capcup;": "⩇",
  "&capdot;": "⩀",
  "&caps;": "∩︀",
  "&caret;": "⁁",
  "&caron;": "ˇ",
  "&ccaps;": "⩍",
  "&ccaron;": "č",
  "&ccedil": "ç",
  "&ccedil;": "ç",
  "&ccirc;": "ĉ",
  "&ccups;": "⩌",
  "&ccupssm;": "⩐",
  "&cdot;": "ċ",
  "&cedil": "¸",
  "&cedil;": "¸",
  "&cemptyv;": "⦲",
  "&cent": "¢",
  "&cent;": "¢",
  "&centerdot;": "·",
  "&cfr;": "𝔠",
  "&chcy;": "ч",
  "&check;": "✓",
  "&checkmark;": "✓",
  "&chi;": "χ",
  "&cir;": "○",
  "&cirE;": "⧃",
  "&circ;": "ˆ",
  "&circeq;": "≗",
  "&circlearrowleft;": "↺",
  "&circlearrowright;": "↻",
  "&circledR;": "®",
  "&circledS;": "Ⓢ",
  "&circledast;": "⊛",
  "&circledcirc;": "⊚",
  "&circleddash;": "⊝",
  "&cire;": "≗",
  "&cirfnint;": "⨐",
  "&cirmid;": "⫯",
  "&cirscir;": "⧂",
  "&clubs;": "♣",
  "&clubsuit;": "♣",
  "&colon;": ":",
  "&colone;": "≔",
  "&coloneq;": "≔",
  "&comma;": ",",
  "&commat;": "@",
  "&comp;": "∁",
  "&compfn;": "∘",
  "&complement;": "∁",
  "&complexes;": "ℂ",
  "&cong;": "≅",
  "&congdot;": "⩭",
  "&conint;": "∮",
  "&copf;": "𝕔",
  "&coprod;": "∐",
  "&copy": "©",
  "&copy;": "©",
  "&copysr;": "℗",
  "&crarr;": "↵",
  "&cross;": "✗",
  "&cscr;": "𝒸",
  "&csub;": "⫏",
  "&csube;": "⫑",
  "&csup;": "⫐",
  "&csupe;": "⫒",
  "&ctdot;": "⋯",
  "&cudarrl;": "⤸",
  "&cudarrr;": "⤵",
  "&cuepr;": "⋞",
  "&cuesc;": "⋟",
  "&cularr;": "↶",
  "&cularrp;": "⤽",
  "&cup;": "∪",
  "&cupbrcap;": "⩈",
  "&cupcap;": "⩆",
  "&cupcup;": "⩊",
  "&cupdot;": "⊍",
  "&cupor;": "⩅",
  "&cups;": "∪︀",
  "&curarr;": "↷",
  "&curarrm;": "⤼",
  "&curlyeqprec;": "⋞",
  "&curlyeqsucc;": "⋟",
  "&curlyvee;": "⋎",
  "&curlywedge;": "⋏",
  "&curren": "¤",
  "&curren;": "¤",
  "&curvearrowleft;": "↶",
  "&curvearrowright;": "↷",
  "&cuvee;": "⋎",
  "&cuwed;": "⋏",
  "&cwconint;": "∲",
  "&cwint;": "∱",
  "&cylcty;": "⌭",
  "&dArr;": "⇓",
  "&dHar;": "⥥",
  "&dagger;": "†",
  "&daleth;": "ℸ",
  "&darr;": "↓",
  "&dash;": "‐",
  "&dashv;": "⊣",
  "&dbkarow;": "⤏",
  "&dblac;": "˝",
  "&dcaron;": "ď",
  "&dcy;": "д",
  "&dd;": "ⅆ",
  "&ddagger;": "‡",
  "&ddarr;": "⇊",
  "&ddotseq;": "⩷",
  "&deg": "°",
  "&deg;": "°",
  "&delta;": "δ",
  "&demptyv;": "⦱",
  "&dfisht;": "⥿",
  "&dfr;": "𝔡",
  "&dharl;": "⇃",
  "&dharr;": "⇂",
  "&diam;": "⋄",
  "&diamond;": "⋄",
  "&diamondsuit;": "♦",
  "&diams;": "♦",
  "&die;": "¨",
  "&digamma;": "ϝ",
  "&disin;": "⋲",
  "&div;": "÷",
  "&divide": "÷",
  "&divide;": "÷",
  "&divideontimes;": "⋇",
  "&divonx;": "⋇",
  "&djcy;": "ђ",
  "&dlcorn;": "⌞",
  "&dlcrop;": "⌍",
  "&dollar;": "$",
  "&dopf;": "𝕕",
  "&dot;": "˙",
  "&doteq;": "≐",
  "&doteqdot;": "≑",
  "&dotminus;": "∸",
  "&dotplus;": "∔",
  "&dotsquare;": "⊡",
  "&doublebarwedge;": "⌆",
  "&downarrow;": "↓",
  "&downdownarrows;": "⇊",
  "&downharpoonleft;": "⇃",
  "&downharpoonright;": "⇂",
  "&drbkarow;": "⤐",
  "&drcorn;": "⌟",
  "&drcrop;": "⌌",
  "&dscr;": "𝒹",
  "&dscy;": "ѕ",
  "&dsol;": "⧶",
  "&dstrok;": "đ",
  "&dtdot;": "⋱",
  "&dtri;": "▿",
  "&dtrif;": "▾",
  "&duarr;": "⇵",
  "&duhar;": "⥯",
  "&dwangle;": "⦦",
  "&dzcy;": "џ",
  "&dzigrarr;": "⟿",
  "&eDDot;": "⩷",
  "&eDot;": "≑",
  "&eacute": "é",
  "&eacute;": "é",
  "&easter;": "⩮",
  "&ecaron;": "ě",
  "&ecir;": "≖",
  "&ecirc": "ê",
  "&ecirc;": "ê",
  "&ecolon;": "≕",
  "&ecy;": "э",
  "&edot;": "ė",
  "&ee;": "ⅇ",
  "&efDot;": "≒",
  "&efr;": "𝔢",
  "&eg;": "⪚",
  "&egrave": "è",
  "&egrave;": "è",
  "&egs;": "⪖",
  "&egsdot;": "⪘",
  "&el;": "⪙",
  "&elinters;": "⏧",
  "&ell;": "ℓ",
  "&els;": "⪕",
  "&elsdot;": "⪗",
  "&emacr;": "ē",
  "&empty;": "∅",
  "&emptyset;": "∅",
  "&emptyv;": "∅",
  "&emsp13;": " ",
  "&emsp14;": " ",
  "&emsp;": " ",
  "&eng;": "ŋ",
  "&ensp;": " ",
  "&eogon;": "ę",
  "&eopf;": "𝕖",
  "&epar;": "⋕",
  "&eparsl;": "⧣",
  "&eplus;": "⩱",
  "&epsi;": "ε",
  "&epsilon;": "ε",
  "&epsiv;": "ϵ",
  "&eqcirc;": "≖",
  "&eqcolon;": "≕",
  "&eqsim;": "≂",
  "&eqslantgtr;": "⪖",
  "&eqslantless;": "⪕",
  "&equals;": "=",
  "&equest;": "≟",
  "&equiv;": "≡",
  "&equivDD;": "⩸",
  "&eqvparsl;": "⧥",
  "&erDot;": "≓",
  "&erarr;": "⥱",
  "&escr;": "ℯ",
  "&esdot;": "≐",
  "&esim;": "≂",
  "&eta;": "η",
  "&eth": "ð",
  "&eth;": "ð",
  "&euml": "ë",
  "&euml;": "ë",
  "&euro;": "€",
  "&excl;": "!",
  "&exist;": "∃",
  "&expectation;": "ℰ",
  "&exponentiale;": "ⅇ",
  "&fallingdotseq;": "≒",
  "&fcy;": "ф",
  "&female;": "♀",
  "&ffilig;": "ﬃ",
  "&fflig;": "ﬀ",
  "&ffllig;": "ﬄ",
  "&ffr;": "𝔣",
  "&filig;": "ﬁ",
  "&fjlig;": "fj",
  "&flat;": "♭",
  "&fllig;": "ﬂ",
  "&fltns;": "▱",
  "&fnof;": "ƒ",
  "&fopf;": "𝕗",
  "&forall;": "∀",
  "&fork;": "⋔",
  "&forkv;": "⫙",
  "&fpartint;": "⨍",
  "&frac12": "½",
  "&frac12;": "½",
  "&frac13;": "⅓",
  "&frac14": "¼",
  "&frac14;": "¼",
  "&frac15;": "⅕",
  "&frac16;": "⅙",
  "&frac18;": "⅛",
  "&frac23;": "⅔",
  "&frac25;": "⅖",
  "&frac34": "¾",
  "&frac34;": "¾",
  "&frac35;": "⅗",
  "&frac38;": "⅜",
  "&frac45;": "⅘",
  "&frac56;": "⅚",
  "&frac58;": "⅝",
  "&frac78;": "⅞",
  "&frasl;": "⁄",
  "&frown;": "⌢",
  "&fscr;": "𝒻",
  "&gE;": "≧",
  "&gEl;": "⪌",
  "&gacute;": "ǵ",
  "&gamma;": "γ",
  "&gammad;": "ϝ",
  "&gap;": "⪆",
  "&gbreve;": "ğ",
  "&gcirc;": "ĝ",
  "&gcy;": "г",
  "&gdot;": "ġ",
  "&ge;": "≥",
  "&gel;": "⋛",
  "&geq;": "≥",
  "&geqq;": "≧",
  "&geqslant;": "⩾",
  "&ges;": "⩾",
  "&gescc;": "⪩",
  "&gesdot;": "⪀",
  "&gesdoto;": "⪂",
  "&gesdotol;": "⪄",
  "&gesl;": "⋛︀",
  "&gesles;": "⪔",
  "&gfr;": "𝔤",
  "&gg;": "≫",
  "&ggg;": "⋙",
  "&gimel;": "ℷ",
  "&gjcy;": "ѓ",
  "&gl;": "≷",
  "&glE;": "⪒",
  "&gla;": "⪥",
  "&glj;": "⪤",
  "&gnE;": "≩",
  "&gnap;": "⪊",
  "&gnapprox;": "⪊",
  "&gne;": "⪈",
  "&gneq;": "⪈",
  "&gneqq;": "≩",
  "&gnsim;": "⋧",
  "&gopf;": "𝕘",
  "&grave;": "`",
  "&gscr;": "ℊ",
  "&gsim;": "≳",
  "&gsime;": "⪎",
  "&gsiml;": "⪐",
  "&gt": ">",
  "&gt;": ">",
  "&gtcc;": "⪧",
  "&gtcir;": "⩺",
  "&gtdot;": "⋗",
  "&gtlPar;": "⦕",
  "&gtquest;": "⩼",
  "&gtrapprox;": "⪆",
  "&gtrarr;": "⥸",
  "&gtrdot;": "⋗",
  "&gtreqless;": "⋛",
  "&gtreqqless;": "⪌",
  "&gtrless;": "≷",
  "&gtrsim;": "≳",
  "&gvertneqq;": "≩︀",
  "&gvnE;": "≩︀",
  "&hArr;": "⇔",
  "&hairsp;": " ",
  "&half;": "½",
  "&hamilt;": "ℋ",
  "&hardcy;": "ъ",
  "&harr;": "↔",
  "&harrcir;": "⥈",
  "&harrw;": "↭",
  "&hbar;": "ℏ",
  "&hcirc;": "ĥ",
  "&hearts;": "♥",
  "&heartsuit;": "♥",
  "&hellip;": "…",
  "&hercon;": "⊹",
  "&hfr;": "𝔥",
  "&hksearow;": "⤥",
  "&hkswarow;": "⤦",
  "&hoarr;": "⇿",
  "&homtht;": "∻",
  "&hookleftarrow;": "↩",
  "&hookrightarrow;": "↪",
  "&hopf;": "𝕙",
  "&horbar;": "―",
  "&hscr;": "𝒽",
  "&hslash;": "ℏ",
  "&hstrok;": "ħ",
  "&hybull;": "⁃",
  "&hyphen;": "‐",
  "&iacute": "í",
  "&iacute;": "í",
  "&ic;": "⁣",
  "&icirc": "î",
  "&icirc;": "î",
  "&icy;": "и",
  "&iecy;": "е",
  "&iexcl": "¡",
  "&iexcl;": "¡",
  "&iff;": "⇔",
  "&ifr;": "𝔦",
  "&igrave": "ì",
  "&igrave;": "ì",
  "&ii;": "ⅈ",
  "&iiiint;": "⨌",
  "&iiint;": "∭",
  "&iinfin;": "⧜",
  "&iiota;": "℩",
  "&ijlig;": "ĳ",
  "&imacr;": "ī",
  "&image;": "ℑ",
  "&imagline;": "ℐ",
  "&imagpart;": "ℑ",
  "&imath;": "ı",
  "&imof;": "⊷",
  "&imped;": "Ƶ",
  "&in;": "∈",
  "&incare;": "℅",
  "&infin;": "∞",
  "&infintie;": "⧝",
  "&inodot;": "ı",
  "&int;": "∫",
  "&intcal;": "⊺",
  "&integers;": "ℤ",
  "&intercal;": "⊺",
  "&intlarhk;": "⨗",
  "&intprod;": "⨼",
  "&iocy;": "ё",
  "&iogon;": "į",
  "&iopf;": "𝕚",
  "&iota;": "ι",
  "&iprod;": "⨼",
  "&iquest": "¿",
  "&iquest;": "¿",
  "&iscr;": "𝒾",
  "&isin;": "∈",
  "&isinE;": "⋹",
  "&isindot;": "⋵",
  "&isins;": "⋴",
  "&isinsv;": "⋳",
  "&isinv;": "∈",
  "&it;": "⁢",
  "&itilde;": "ĩ",
  "&iukcy;": "і",
  "&iuml": "ï",
  "&iuml;": "ï",
  "&jcirc;": "ĵ",
  "&jcy;": "й",
  "&jfr;": "𝔧",
  "&jmath;": "ȷ",
  "&jopf;": "𝕛",
  "&jscr;": "𝒿",
  "&jsercy;": "ј",
  "&jukcy;": "є",
  "&kappa;": "κ",
  "&kappav;": "ϰ",
  "&kcedil;": "ķ",
  "&kcy;": "к",
  "&kfr;": "𝔨",
  "&kgreen;": "ĸ",
  "&khcy;": "х",
  "&kjcy;": "ќ",
  "&kopf;": "𝕜",
  "&kscr;": "𝓀",
  "&lAarr;": "⇚",
  "&lArr;": "⇐",
  "&lAtail;": "⤛",
  "&lBarr;": "⤎",
  "&lE;": "≦",
  "&lEg;": "⪋",
  "&lHar;": "⥢",
  "&lacute;": "ĺ",
  "&laemptyv;": "⦴",
  "&lagran;": "ℒ",
  "&lambda;": "λ",
  "&lang;": "⟨",
  "&langd;": "⦑",
  "&langle;": "⟨",
  "&lap;": "⪅",
  "&laquo": "«",
  "&laquo;": "«",
  "&larr;": "←",
  "&larrb;": "⇤",
  "&larrbfs;": "⤟",
  "&larrfs;": "⤝",
  "&larrhk;": "↩",
  "&larrlp;": "↫",
  "&larrpl;": "⤹",
  "&larrsim;": "⥳",
  "&larrtl;": "↢",
  "&lat;": "⪫",
  "&latail;": "⤙",
  "&late;": "⪭",
  "&lates;": "⪭︀",
  "&lbarr;": "⤌",
  "&lbbrk;": "❲",
  "&lbrace;": "{",
  "&lbrack;": "[",
  "&lbrke;": "⦋",
  "&lbrksld;": "⦏",
  "&lbrkslu;": "⦍",
  "&lcaron;": "ľ",
  "&lcedil;": "ļ",
  "&lceil;": "⌈",
  "&lcub;": "{",
  "&lcy;": "л",
  "&ldca;": "⤶",
  "&ldquo;": "“",
  "&ldquor;": "„",
  "&ldrdhar;": "⥧",
  "&ldrushar;": "⥋",
  "&ldsh;": "↲",
  "&le;": "≤",
  "&leftarrow;": "←",
  "&leftarrowtail;": "↢",
  "&leftharpoondown;": "↽",
  "&leftharpoonup;": "↼",
  "&leftleftarrows;": "⇇",
  "&leftrightarrow;": "↔",
  "&leftrightarrows;": "⇆",
  "&leftrightharpoons;": "⇋",
  "&leftrightsquigarrow;": "↭",
  "&leftthreetimes;": "⋋",
  "&leg;": "⋚",
  "&leq;": "≤",
  "&leqq;": "≦",
  "&leqslant;": "⩽",
  "&les;": "⩽",
  "&lescc;": "⪨",
  "&lesdot;": "⩿",
  "&lesdoto;": "⪁",
  "&lesdotor;": "⪃",
  "&lesg;": "⋚︀",
  "&lesges;": "⪓",
  "&lessapprox;": "⪅",
  "&lessdot;": "⋖",
  "&lesseqgtr;": "⋚",
  "&lesseqqgtr;": "⪋",
  "&lessgtr;": "≶",
  "&lesssim;": "≲",
  "&lfisht;": "⥼",
  "&lfloor;": "⌊",
  "&lfr;": "𝔩",
  "&lg;": "≶",
  "&lgE;": "⪑",
  "&lhard;": "↽",
  "&lharu;": "↼",
  "&lharul;": "⥪",
  "&lhblk;": "▄",
  "&ljcy;": "љ",
  "&ll;": "≪",
  "&llarr;": "⇇",
  "&llcorner;": "⌞",
  "&llhard;": "⥫",
  "&lltri;": "◺",
  "&lmidot;": "ŀ",
  "&lmoust;": "⎰",
  "&lmoustache;": "⎰",
  "&lnE;": "≨",
  "&lnap;": "⪉",
  "&lnapprox;": "⪉",
  "&lne;": "⪇",
  "&lneq;": "⪇",
  "&lneqq;": "≨",
  "&lnsim;": "⋦",
  "&loang;": "⟬",
  "&loarr;": "⇽",
  "&lobrk;": "⟦",
  "&longleftarrow;": "⟵",
  "&longleftrightarrow;": "⟷",
  "&longmapsto;": "⟼",
  "&longrightarrow;": "⟶",
  "&looparrowleft;": "↫",
  "&looparrowright;": "↬",
  "&lopar;": "⦅",
  "&lopf;": "𝕝",
  "&loplus;": "⨭",
  "&lotimes;": "⨴",
  "&lowast;": "∗",
  "&lowbar;": "_",
  "&loz;": "◊",
  "&lozenge;": "◊",
  "&lozf;": "⧫",
  "&lpar;": "(",
  "&lparlt;": "⦓",
  "&lrarr;": "⇆",
  "&lrcorner;": "⌟",
  "&lrhar;": "⇋",
  "&lrhard;": "⥭",
  "&lrm;": "‎",
  "&lrtri;": "⊿",
  "&lsaquo;": "‹",
  "&lscr;": "𝓁",
  "&lsh;": "↰",
  "&lsim;": "≲",
  "&lsime;": "⪍",
  "&lsimg;": "⪏",
  "&lsqb;": "[",
  "&lsquo;": "‘",
  "&lsquor;": "‚",
  "&lstrok;": "ł",
  "&lt": "<",
  "&lt;": "<",
  "&ltcc;": "⪦",
  "&ltcir;": "⩹",
  "&ltdot;": "⋖",
  "&lthree;": "⋋",
  "&ltimes;": "⋉",
  "&ltlarr;": "⥶",
  "&ltquest;": "⩻",
  "&ltrPar;": "⦖",
  "&ltri;": "◃",
  "&ltrie;": "⊴",
  "&ltrif;": "◂",
  "&lurdshar;": "⥊",
  "&luruhar;": "⥦",
  "&lvertneqq;": "≨︀",
  "&lvnE;": "≨︀",
  "&mDDot;": "∺",
  "&macr": "¯",
  "&macr;": "¯",
  "&male;": "♂",
  "&malt;": "✠",
  "&maltese;": "✠",
  "&map;": "↦",
  "&mapsto;": "↦",
  "&mapstodown;": "↧",
  "&mapstoleft;": "↤",
  "&mapstoup;": "↥",
  "&marker;": "▮",
  "&mcomma;": "⨩",
  "&mcy;": "м",
  "&mdash;": "—",
  "&measuredangle;": "∡",
  "&mfr;": "𝔪",
  "&mho;": "℧",
  "&micro": "µ",
  "&micro;": "µ",
  "&mid;": "∣",
  "&midast;": "*",
  "&midcir;": "⫰",
  "&middot": "·",
  "&middot;": "·",
  "&minus;": "−",
  "&minusb;": "⊟",
  "&minusd;": "∸",
  "&minusdu;": "⨪",
  "&mlcp;": "⫛",
  "&mldr;": "…",
  "&mnplus;": "∓",
  "&models;": "⊧",
  "&mopf;": "𝕞",
  "&mp;": "∓",
  "&mscr;": "𝓂",
  "&mstpos;": "∾",
  "&mu;": "μ",
  "&multimap;": "⊸",
  "&mumap;": "⊸",
  "&nGg;": "⋙̸",
  "&nGt;": "≫⃒",
  "&nGtv;": "≫̸",
  "&nLeftarrow;": "⇍",
  "&nLeftrightarrow;": "⇎",
  "&nLl;": "⋘̸",
  "&nLt;": "≪⃒",
  "&nLtv;": "≪̸",
  "&nRightarrow;": "⇏",
  "&nVDash;": "⊯",
  "&nVdash;": "⊮",
  "&nabla;": "∇",
  "&nacute;": "ń",
  "&nang;": "∠⃒",
  "&nap;": "≉",
  "&napE;": "⩰̸",
  "&napid;": "≋̸",
  "&napos;": "ŉ",
  "&napprox;": "≉",
  "&natur;": "♮",
  "&natural;": "♮",
  "&naturals;": "ℕ",
  "&nbsp": " ",
  "&nbsp;": " ",
  "&nbump;": "≎̸",
  "&nbumpe;": "≏̸",
  "&ncap;": "⩃",
  "&ncaron;": "ň",
  "&ncedil;": "ņ",
  "&ncong;": "≇",
  "&ncongdot;": "⩭̸",
  "&ncup;": "⩂",
  "&ncy;": "н",
  "&ndash;": "–",
  "&ne;": "≠",
  "&neArr;": "⇗",
  "&nearhk;": "⤤",
  "&nearr;": "↗",
  "&nearrow;": "↗",
  "&nedot;": "≐̸",
  "&nequiv;": "≢",
  "&nesear;": "⤨",
  "&nesim;": "≂̸",
  "&nexist;": "∄",
  "&nexists;": "∄",
  "&nfr;": "𝔫",
  "&ngE;": "≧̸",
  "&nge;": "≱",
  "&ngeq;": "≱",
  "&ngeqq;": "≧̸",
  "&ngeqslant;": "⩾̸",
  "&nges;": "⩾̸",
  "&ngsim;": "≵",
  "&ngt;": "≯",
  "&ngtr;": "≯",
  "&nhArr;": "⇎",
  "&nharr;": "↮",
  "&nhpar;": "⫲",
  "&ni;": "∋",
  "&nis;": "⋼",
  "&nisd;": "⋺",
  "&niv;": "∋",
  "&njcy;": "њ",
  "&nlArr;": "⇍",
  "&nlE;": "≦̸",
  "&nlarr;": "↚",
  "&nldr;": "‥",
  "&nle;": "≰",
  "&nleftarrow;": "↚",
  "&nleftrightarrow;": "↮",
  "&nleq;": "≰",
  "&nleqq;": "≦̸",
  "&nleqslant;": "⩽̸",
  "&nles;": "⩽̸",
  "&nless;": "≮",
  "&nlsim;": "≴",
  "&nlt;": "≮",
  "&nltri;": "⋪",
  "&nltrie;": "⋬",
  "&nmid;": "∤",
  "&nopf;": "𝕟",
  "&not": "¬",
  "&not;": "¬",
  "&notin;": "∉",
  "&notinE;": "⋹̸",
  "&notindot;": "⋵̸",
  "&notinva;": "∉",
  "&notinvb;": "⋷",
  "&notinvc;": "⋶",
  "&notni;": "∌",
  "&notniva;": "∌",
  "&notnivb;": "⋾",
  "&notnivc;": "⋽",
  "&npar;": "∦",
  "&nparallel;": "∦",
  "&nparsl;": "⫽⃥",
  "&npart;": "∂̸",
  "&npolint;": "⨔",
  "&npr;": "⊀",
  "&nprcue;": "⋠",
  "&npre;": "⪯̸",
  "&nprec;": "⊀",
  "&npreceq;": "⪯̸",
  "&nrArr;": "⇏",
  "&nrarr;": "↛",
  "&nrarrc;": "⤳̸",
  "&nrarrw;": "↝̸",
  "&nrightarrow;": "↛",
  "&nrtri;": "⋫",
  "&nrtrie;": "⋭",
  "&nsc;": "⊁",
  "&nsccue;": "⋡",
  "&nsce;": "⪰̸",
  "&nscr;": "𝓃",
  "&nshortmid;": "∤",
  "&nshortparallel;": "∦",
  "&nsim;": "≁",
  "&nsime;": "≄",
  "&nsimeq;": "≄",
  "&nsmid;": "∤",
  "&nspar;": "∦",
  "&nsqsube;": "⋢",
  "&nsqsupe;": "⋣",
  "&nsub;": "⊄",
  "&nsubE;": "⫅̸",
  "&nsube;": "⊈",
  "&nsubset;": "⊂⃒",
  "&nsubseteq;": "⊈",
  "&nsubseteqq;": "⫅̸",
  "&nsucc;": "⊁",
  "&nsucceq;": "⪰̸",
  "&nsup;": "⊅",
  "&nsupE;": "⫆̸",
  "&nsupe;": "⊉",
  "&nsupset;": "⊃⃒",
  "&nsupseteq;": "⊉",
  "&nsupseteqq;": "⫆̸",
  "&ntgl;": "≹",
  "&ntilde": "ñ",
  "&ntilde;": "ñ",
  "&ntlg;": "≸",
  "&ntriangleleft;": "⋪",
  "&ntrianglelefteq;": "⋬",
  "&ntriangleright;": "⋫",
  "&ntrianglerighteq;": "⋭",
  "&nu;": "ν",
  "&num;": "#",
  "&numero;": "№",
  "&numsp;": " ",
  "&nvDash;": "⊭",
  "&nvHarr;": "⤄",
  "&nvap;": "≍⃒",
  "&nvdash;": "⊬",
  "&nvge;": "≥⃒",
  "&nvgt;": ">⃒",
  "&nvinfin;": "⧞",
  "&nvlArr;": "⤂",
  "&nvle;": "≤⃒",
  "&nvlt;": "<⃒",
  "&nvltrie;": "⊴⃒",
  "&nvrArr;": "⤃",
  "&nvrtrie;": "⊵⃒",
  "&nvsim;": "∼⃒",
  "&nwArr;": "⇖",
  "&nwarhk;": "⤣",
  "&nwarr;": "↖",
  "&nwarrow;": "↖",
  "&nwnear;": "⤧",
  "&oS;": "Ⓢ",
  "&oacute": "ó",
  "&oacute;": "ó",
  "&oast;": "⊛",
  "&ocir;": "⊚",
  "&ocirc": "ô",
  "&ocirc;": "ô",
  "&ocy;": "о",
  "&odash;": "⊝",
  "&odblac;": "ő",
  "&odiv;": "⨸",
  "&odot;": "⊙",
  "&odsold;": "⦼",
  "&oelig;": "œ",
  "&ofcir;": "⦿",
  "&ofr;": "𝔬",
  "&ogon;": "˛",
  "&ograve": "ò",
  "&ograve;": "ò",
  "&ogt;": "⧁",
  "&ohbar;": "⦵",
  "&ohm;": "Ω",
  "&oint;": "∮",
  "&olarr;": "↺",
  "&olcir;": "⦾",
  "&olcross;": "⦻",
  "&oline;": "‾",
  "&olt;": "⧀",
  "&omacr;": "ō",
  "&omega;": "ω",
  "&omicron;": "ο",
  "&omid;": "⦶",
  "&ominus;": "⊖",
  "&oopf;": "𝕠",
  "&opar;": "⦷",
  "&operp;": "⦹",
  "&oplus;": "⊕",
  "&or;": "∨",
  "&orarr;": "↻",
  "&ord;": "⩝",
  "&order;": "ℴ",
  "&orderof;": "ℴ",
  "&ordf": "ª",
  "&ordf;": "ª",
  "&ordm": "º",
  "&ordm;": "º",
  "&origof;": "⊶",
  "&oror;": "⩖",
  "&orslope;": "⩗",
  "&orv;": "⩛",
  "&oscr;": "ℴ",
  "&oslash": "ø",
  "&oslash;": "ø",
  "&osol;": "⊘",
  "&otilde": "õ",
  "&otilde;": "õ",
  "&otimes;": "⊗",
  "&otimesas;": "⨶",
  "&ouml": "ö",
  "&ouml;": "ö",
  "&ovbar;": "⌽",
  "&par;": "∥",
  "&para": "¶",
  "&para;": "¶",
  "&parallel;": "∥",
  "&parsim;": "⫳",
  "&parsl;": "⫽",
  "&part;": "∂",
  "&pcy;": "п",
  "&percnt;": "%",
  "&period;": ".",
  "&permil;": "‰",
  "&perp;": "⊥",
  "&pertenk;": "‱",
  "&pfr;": "𝔭",
  "&phi;": "φ",
  "&phiv;": "ϕ",
  "&phmmat;": "ℳ",
  "&phone;": "☎",
  "&pi;": "π",
  "&pitchfork;": "⋔",
  "&piv;": "ϖ",
  "&planck;": "ℏ",
  "&planckh;": "ℎ",
  "&plankv;": "ℏ",
  "&plus;": "+",
  "&plusacir;": "⨣",
  "&plusb;": "⊞",
  "&pluscir;": "⨢",
  "&plusdo;": "∔",
  "&plusdu;": "⨥",
  "&pluse;": "⩲",
  "&plusmn": "±",
  "&plusmn;": "±",
  "&plussim;": "⨦",
  "&plustwo;": "⨧",
  "&pm;": "±",
  "&pointint;": "⨕",
  "&popf;": "𝕡",
  "&pound": "£",
  "&pound;": "£",
  "&pr;": "≺",
  "&prE;": "⪳",
  "&prap;": "⪷",
  "&prcue;": "≼",
  "&pre;": "⪯",
  "&prec;": "≺",
  "&precapprox;": "⪷",
  "&preccurlyeq;": "≼",
  "&preceq;": "⪯",
  "&precnapprox;": "⪹",
  "&precneqq;": "⪵",
  "&precnsim;": "⋨",
  "&precsim;": "≾",
  "&prime;": "′",
  "&primes;": "ℙ",
  "&prnE;": "⪵",
  "&prnap;": "⪹",
  "&prnsim;": "⋨",
  "&prod;": "∏",
  "&profalar;": "⌮",
  "&profline;": "⌒",
  "&profsurf;": "⌓",
  "&prop;": "∝",
  "&propto;": "∝",
  "&prsim;": "≾",
  "&prurel;": "⊰",
  "&pscr;": "𝓅",
  "&psi;": "ψ",
  "&puncsp;": " ",
  "&qfr;": "𝔮",
  "&qint;": "⨌",
  "&qopf;": "𝕢",
  "&qprime;": "⁗",
  "&qscr;": "𝓆",
  "&quaternions;": "ℍ",
  "&quatint;": "⨖",
  "&quest;": "?",
  "&questeq;": "≟",
  "&quot": '"',
  "&quot;": '"',
  "&rAarr;": "⇛",
  "&rArr;": "⇒",
  "&rAtail;": "⤜",
  "&rBarr;": "⤏",
  "&rHar;": "⥤",
  "&race;": "∽̱",
  "&racute;": "ŕ",
  "&radic;": "√",
  "&raemptyv;": "⦳",
  "&rang;": "⟩",
  "&rangd;": "⦒",
  "&range;": "⦥",
  "&rangle;": "⟩",
  "&raquo": "»",
  "&raquo;": "»",
  "&rarr;": "→",
  "&rarrap;": "⥵",
  "&rarrb;": "⇥",
  "&rarrbfs;": "⤠",
  "&rarrc;": "⤳",
  "&rarrfs;": "⤞",
  "&rarrhk;": "↪",
  "&rarrlp;": "↬",
  "&rarrpl;": "⥅",
  "&rarrsim;": "⥴",
  "&rarrtl;": "↣",
  "&rarrw;": "↝",
  "&ratail;": "⤚",
  "&ratio;": "∶",
  "&rationals;": "ℚ",
  "&rbarr;": "⤍",
  "&rbbrk;": "❳",
  "&rbrace;": "}",
  "&rbrack;": "]",
  "&rbrke;": "⦌",
  "&rbrksld;": "⦎",
  "&rbrkslu;": "⦐",
  "&rcaron;": "ř",
  "&rcedil;": "ŗ",
  "&rceil;": "⌉",
  "&rcub;": "}",
  "&rcy;": "р",
  "&rdca;": "⤷",
  "&rdldhar;": "⥩",
  "&rdquo;": "”",
  "&rdquor;": "”",
  "&rdsh;": "↳",
  "&real;": "ℜ",
  "&realine;": "ℛ",
  "&realpart;": "ℜ",
  "&reals;": "ℝ",
  "&rect;": "▭",
  "&reg": "®",
  "&reg;": "®",
  "&rfisht;": "⥽",
  "&rfloor;": "⌋",
  "&rfr;": "𝔯",
  "&rhard;": "⇁",
  "&rharu;": "⇀",
  "&rharul;": "⥬",
  "&rho;": "ρ",
  "&rhov;": "ϱ",
  "&rightarrow;": "→",
  "&rightarrowtail;": "↣",
  "&rightharpoondown;": "⇁",
  "&rightharpoonup;": "⇀",
  "&rightleftarrows;": "⇄",
  "&rightleftharpoons;": "⇌",
  "&rightrightarrows;": "⇉",
  "&rightsquigarrow;": "↝",
  "&rightthreetimes;": "⋌",
  "&ring;": "˚",
  "&risingdotseq;": "≓",
  "&rlarr;": "⇄",
  "&rlhar;": "⇌",
  "&rlm;": "‏",
  "&rmoust;": "⎱",
  "&rmoustache;": "⎱",
  "&rnmid;": "⫮",
  "&roang;": "⟭",
  "&roarr;": "⇾",
  "&robrk;": "⟧",
  "&ropar;": "⦆",
  "&ropf;": "𝕣",
  "&roplus;": "⨮",
  "&rotimes;": "⨵",
  "&rpar;": ")",
  "&rpargt;": "⦔",
  "&rppolint;": "⨒",
  "&rrarr;": "⇉",
  "&rsaquo;": "›",
  "&rscr;": "𝓇",
  "&rsh;": "↱",
  "&rsqb;": "]",
  "&rsquo;": "’",
  "&rsquor;": "’",
  "&rthree;": "⋌",
  "&rtimes;": "⋊",
  "&rtri;": "▹",
  "&rtrie;": "⊵",
  "&rtrif;": "▸",
  "&rtriltri;": "⧎",
  "&ruluhar;": "⥨",
  "&rx;": "℞",
  "&sacute;": "ś",
  "&sbquo;": "‚",
  "&sc;": "≻",
  "&scE;": "⪴",
  "&scap;": "⪸",
  "&scaron;": "š",
  "&sccue;": "≽",
  "&sce;": "⪰",
  "&scedil;": "ş",
  "&scirc;": "ŝ",
  "&scnE;": "⪶",
  "&scnap;": "⪺",
  "&scnsim;": "⋩",
  "&scpolint;": "⨓",
  "&scsim;": "≿",
  "&scy;": "с",
  "&sdot;": "⋅",
  "&sdotb;": "⊡",
  "&sdote;": "⩦",
  "&seArr;": "⇘",
  "&searhk;": "⤥",
  "&searr;": "↘",
  "&searrow;": "↘",
  "&sect": "§",
  "&sect;": "§",
  "&semi;": ";",
  "&seswar;": "⤩",
  "&setminus;": "∖",
  "&setmn;": "∖",
  "&sext;": "✶",
  "&sfr;": "𝔰",
  "&sfrown;": "⌢",
  "&sharp;": "♯",
  "&shchcy;": "щ",
  "&shcy;": "ш",
  "&shortmid;": "∣",
  "&shortparallel;": "∥",
  "&shy": "­",
  "&shy;": "­",
  "&sigma;": "σ",
  "&sigmaf;": "ς",
  "&sigmav;": "ς",
  "&sim;": "∼",
  "&simdot;": "⩪",
  "&sime;": "≃",
  "&simeq;": "≃",
  "&simg;": "⪞",
  "&simgE;": "⪠",
  "&siml;": "⪝",
  "&simlE;": "⪟",
  "&simne;": "≆",
  "&simplus;": "⨤",
  "&simrarr;": "⥲",
  "&slarr;": "←",
  "&smallsetminus;": "∖",
  "&smashp;": "⨳",
  "&smeparsl;": "⧤",
  "&smid;": "∣",
  "&smile;": "⌣",
  "&smt;": "⪪",
  "&smte;": "⪬",
  "&smtes;": "⪬︀",
  "&softcy;": "ь",
  "&sol;": "/",
  "&solb;": "⧄",
  "&solbar;": "⌿",
  "&sopf;": "𝕤",
  "&spades;": "♠",
  "&spadesuit;": "♠",
  "&spar;": "∥",
  "&sqcap;": "⊓",
  "&sqcaps;": "⊓︀",
  "&sqcup;": "⊔",
  "&sqcups;": "⊔︀",
  "&sqsub;": "⊏",
  "&sqsube;": "⊑",
  "&sqsubset;": "⊏",
  "&sqsubseteq;": "⊑",
  "&sqsup;": "⊐",
  "&sqsupe;": "⊒",
  "&sqsupset;": "⊐",
  "&sqsupseteq;": "⊒",
  "&squ;": "□",
  "&square;": "□",
  "&squarf;": "▪",
  "&squf;": "▪",
  "&srarr;": "→",
  "&sscr;": "𝓈",
  "&ssetmn;": "∖",
  "&ssmile;": "⌣",
  "&sstarf;": "⋆",
  "&star;": "☆",
  "&starf;": "★",
  "&straightepsilon;": "ϵ",
  "&straightphi;": "ϕ",
  "&strns;": "¯",
  "&sub;": "⊂",
  "&subE;": "⫅",
  "&subdot;": "⪽",
  "&sube;": "⊆",
  "&subedot;": "⫃",
  "&submult;": "⫁",
  "&subnE;": "⫋",
  "&subne;": "⊊",
  "&subplus;": "⪿",
  "&subrarr;": "⥹",
  "&subset;": "⊂",
  "&subseteq;": "⊆",
  "&subseteqq;": "⫅",
  "&subsetneq;": "⊊",
  "&subsetneqq;": "⫋",
  "&subsim;": "⫇",
  "&subsub;": "⫕",
  "&subsup;": "⫓",
  "&succ;": "≻",
  "&succapprox;": "⪸",
  "&succcurlyeq;": "≽",
  "&succeq;": "⪰",
  "&succnapprox;": "⪺",
  "&succneqq;": "⪶",
  "&succnsim;": "⋩",
  "&succsim;": "≿",
  "&sum;": "∑",
  "&sung;": "♪",
  "&sup1": "¹",
  "&sup1;": "¹",
  "&sup2": "²",
  "&sup2;": "²",
  "&sup3": "³",
  "&sup3;": "³",
  "&sup;": "⊃",
  "&supE;": "⫆",
  "&supdot;": "⪾",
  "&supdsub;": "⫘",
  "&supe;": "⊇",
  "&supedot;": "⫄",
  "&suphsol;": "⟉",
  "&suphsub;": "⫗",
  "&suplarr;": "⥻",
  "&supmult;": "⫂",
  "&supnE;": "⫌",
  "&supne;": "⊋",
  "&supplus;": "⫀",
  "&supset;": "⊃",
  "&supseteq;": "⊇",
  "&supseteqq;": "⫆",
  "&supsetneq;": "⊋",
  "&supsetneqq;": "⫌",
  "&supsim;": "⫈",
  "&supsub;": "⫔",
  "&supsup;": "⫖",
  "&swArr;": "⇙",
  "&swarhk;": "⤦",
  "&swarr;": "↙",
  "&swarrow;": "↙",
  "&swnwar;": "⤪",
  "&szlig": "ß",
  "&szlig;": "ß",
  "&target;": "⌖",
  "&tau;": "τ",
  "&tbrk;": "⎴",
  "&tcaron;": "ť",
  "&tcedil;": "ţ",
  "&tcy;": "т",
  "&tdot;": "⃛",
  "&telrec;": "⌕",
  "&tfr;": "𝔱",
  "&there4;": "∴",
  "&therefore;": "∴",
  "&theta;": "θ",
  "&thetasym;": "ϑ",
  "&thetav;": "ϑ",
  "&thickapprox;": "≈",
  "&thicksim;": "∼",
  "&thinsp;": " ",
  "&thkap;": "≈",
  "&thksim;": "∼",
  "&thorn": "þ",
  "&thorn;": "þ",
  "&tilde;": "˜",
  "&times": "×",
  "&times;": "×",
  "&timesb;": "⊠",
  "&timesbar;": "⨱",
  "&timesd;": "⨰",
  "&tint;": "∭",
  "&toea;": "⤨",
  "&top;": "⊤",
  "&topbot;": "⌶",
  "&topcir;": "⫱",
  "&topf;": "𝕥",
  "&topfork;": "⫚",
  "&tosa;": "⤩",
  "&tprime;": "‴",
  "&trade;": "™",
  "&triangle;": "▵",
  "&triangledown;": "▿",
  "&triangleleft;": "◃",
  "&trianglelefteq;": "⊴",
  "&triangleq;": "≜",
  "&triangleright;": "▹",
  "&trianglerighteq;": "⊵",
  "&tridot;": "◬",
  "&trie;": "≜",
  "&triminus;": "⨺",
  "&triplus;": "⨹",
  "&trisb;": "⧍",
  "&tritime;": "⨻",
  "&trpezium;": "⏢",
  "&tscr;": "𝓉",
  "&tscy;": "ц",
  "&tshcy;": "ћ",
  "&tstrok;": "ŧ",
  "&twixt;": "≬",
  "&twoheadleftarrow;": "↞",
  "&twoheadrightarrow;": "↠",
  "&uArr;": "⇑",
  "&uHar;": "⥣",
  "&uacute": "ú",
  "&uacute;": "ú",
  "&uarr;": "↑",
  "&ubrcy;": "ў",
  "&ubreve;": "ŭ",
  "&ucirc": "û",
  "&ucirc;": "û",
  "&ucy;": "у",
  "&udarr;": "⇅",
  "&udblac;": "ű",
  "&udhar;": "⥮",
  "&ufisht;": "⥾",
  "&ufr;": "𝔲",
  "&ugrave": "ù",
  "&ugrave;": "ù",
  "&uharl;": "↿",
  "&uharr;": "↾",
  "&uhblk;": "▀",
  "&ulcorn;": "⌜",
  "&ulcorner;": "⌜",
  "&ulcrop;": "⌏",
  "&ultri;": "◸",
  "&umacr;": "ū",
  "&uml": "¨",
  "&uml;": "¨",
  "&uogon;": "ų",
  "&uopf;": "𝕦",
  "&uparrow;": "↑",
  "&updownarrow;": "↕",
  "&upharpoonleft;": "↿",
  "&upharpoonright;": "↾",
  "&uplus;": "⊎",
  "&upsi;": "υ",
  "&upsih;": "ϒ",
  "&upsilon;": "υ",
  "&upuparrows;": "⇈",
  "&urcorn;": "⌝",
  "&urcorner;": "⌝",
  "&urcrop;": "⌎",
  "&uring;": "ů",
  "&urtri;": "◹",
  "&uscr;": "𝓊",
  "&utdot;": "⋰",
  "&utilde;": "ũ",
  "&utri;": "▵",
  "&utrif;": "▴",
  "&uuarr;": "⇈",
  "&uuml": "ü",
  "&uuml;": "ü",
  "&uwangle;": "⦧",
  "&vArr;": "⇕",
  "&vBar;": "⫨",
  "&vBarv;": "⫩",
  "&vDash;": "⊨",
  "&vangrt;": "⦜",
  "&varepsilon;": "ϵ",
  "&varkappa;": "ϰ",
  "&varnothing;": "∅",
  "&varphi;": "ϕ",
  "&varpi;": "ϖ",
  "&varpropto;": "∝",
  "&varr;": "↕",
  "&varrho;": "ϱ",
  "&varsigma;": "ς",
  "&varsubsetneq;": "⊊︀",
  "&varsubsetneqq;": "⫋︀",
  "&varsupsetneq;": "⊋︀",
  "&varsupsetneqq;": "⫌︀",
  "&vartheta;": "ϑ",
  "&vartriangleleft;": "⊲",
  "&vartriangleright;": "⊳",
  "&vcy;": "в",
  "&vdash;": "⊢",
  "&vee;": "∨",
  "&veebar;": "⊻",
  "&veeeq;": "≚",
  "&vellip;": "⋮",
  "&verbar;": "|",
  "&vert;": "|",
  "&vfr;": "𝔳",
  "&vltri;": "⊲",
  "&vnsub;": "⊂⃒",
  "&vnsup;": "⊃⃒",
  "&vopf;": "𝕧",
  "&vprop;": "∝",
  "&vrtri;": "⊳",
  "&vscr;": "𝓋",
  "&vsubnE;": "⫋︀",
  "&vsubne;": "⊊︀",
  "&vsupnE;": "⫌︀",
  "&vsupne;": "⊋︀",
  "&vzigzag;": "⦚",
  "&wcirc;": "ŵ",
  "&wedbar;": "⩟",
  "&wedge;": "∧",
  "&wedgeq;": "≙",
  "&weierp;": "℘",
  "&wfr;": "𝔴",
  "&wopf;": "𝕨",
  "&wp;": "℘",
  "&wr;": "≀",
  "&wreath;": "≀",
  "&wscr;": "𝓌",
  "&xcap;": "⋂",
  "&xcirc;": "◯",
  "&xcup;": "⋃",
  "&xdtri;": "▽",
  "&xfr;": "𝔵",
  "&xhArr;": "⟺",
  "&xharr;": "⟷",
  "&xi;": "ξ",
  "&xlArr;": "⟸",
  "&xlarr;": "⟵",
  "&xmap;": "⟼",
  "&xnis;": "⋻",
  "&xodot;": "⨀",
  "&xopf;": "𝕩",
  "&xoplus;": "⨁",
  "&xotime;": "⨂",
  "&xrArr;": "⟹",
  "&xrarr;": "⟶",
  "&xscr;": "𝓍",
  "&xsqcup;": "⨆",
  "&xuplus;": "⨄",
  "&xutri;": "△",
  "&xvee;": "⋁",
  "&xwedge;": "⋀",
  "&yacute": "ý",
  "&yacute;": "ý",
  "&yacy;": "я",
  "&ycirc;": "ŷ",
  "&ycy;": "ы",
  "&yen": "¥",
  "&yen;": "¥",
  "&yfr;": "𝔶",
  "&yicy;": "ї",
  "&yopf;": "𝕪",
  "&yscr;": "𝓎",
  "&yucy;": "ю",
  "&yuml": "ÿ",
  "&yuml;": "ÿ",
  "&zacute;": "ź",
  "&zcaron;": "ž",
  "&zcy;": "з",
  "&zdot;": "ż",
  "&zeetrf;": "ℨ",
  "&zeta;": "ζ",
  "&zfr;": "𝔷",
  "&zhcy;": "ж",
  "&zigrarr;": "⇝",
  "&zopf;": "𝕫",
  "&zscr;": "𝓏",
  "&zwj;": "‍",
  "&zwnj;": "‌"
};
function decodeHTMLEntities(str) {
  return str.replace(/&(#\d+|#x[a-f0-9]+|[a-z]+\d*);?/gi, (match, entity) => {
    if (typeof htmlEntities[match] === "string") {
      return htmlEntities[match];
    }
    if (entity.charAt(0) !== "#" || match.charAt(match.length - 1) !== ";") {
      return match;
    }
    let codePoint;
    if (entity.charAt(1) === "x") {
      codePoint = parseInt(entity.substr(2), 16);
    } else {
      codePoint = parseInt(entity.substr(1), 10);
    }
    let output = "";
    if (codePoint >= 55296 && codePoint <= 57343 || codePoint > 1114111) {
      return "�";
    }
    if (codePoint > 65535) {
      codePoint -= 65536;
      output += String.fromCharCode(codePoint >>> 10 & 1023 | 55296);
      codePoint = 56320 | codePoint & 1023;
    }
    output += String.fromCharCode(codePoint);
    return output;
  });
}
function escapeHtml(str) {
  return str.trim().replace(/[<>"'?&]/g, (c) => {
    let hex = c.charCodeAt(0).toString(16);
    if (hex.length < 2) {
      hex = "0" + hex;
    }
    return "&#x" + hex.toUpperCase() + ";";
  });
}
function textToHtml(str) {
  let html = escapeHtml(str).replace(/\n/g, "<br />");
  return "<div>" + html + "</div>";
}
function htmlToText(str) {
  str = str.replace(/\r?\n/g, "").replace(/<\!\-\-.*?\-\->/gi, " ").replace(/<br\b[^>]*>/gi, "\n").replace(/<\/?(p|div|table|tr|td|th)\b[^>]*>/gi, "\n\n").replace(/<script\b[^>]*>.*?<\/script\b[^>]*>/gi, " ").replace(/^.*<body\b[^>]*>/i, "").replace(/^.*<\/head\b[^>]*>/i, "").replace(/^.*<\!doctype\b[^>]*>/i, "").replace(/<\/body\b[^>]*>.*$/i, "").replace(/<\/html\b[^>]*>.*$/i, "").replace(/<a\b[^>]*href\s*=\s*["']?([^\s"']+)[^>]*>/gi, " ($1) ").replace(/<\/?(span|em|i|strong|b|u|a)\b[^>]*>/gi, "").replace(/<li\b[^>]*>[\n\u0001\s]*/gi, "* ").replace(/<hr\b[^>]*>/g, "\n-------------\n").replace(/<[^>]*>/g, " ").replace(/\u0001/g, "\n").replace(/[ \t]+/g, " ").replace(/^\s+$/gm, "").replace(/\n\n+/g, "\n\n").replace(/^\n+/, "\n").replace(/\n+$/, "\n");
  str = decodeHTMLEntities(str);
  return str;
}
function formatTextAddress(address) {
  return [].concat(address.name || []).concat(address.name ? `<${address.address}>` : address.address).join(" ");
}
function formatTextAddresses(addresses) {
  let parts = [];
  let processAddress = (address, partCounter) => {
    if (partCounter) {
      parts.push(", ");
    }
    if (address.group) {
      let groupStart = `${address.name}:`;
      let groupEnd = `;`;
      parts.push(groupStart);
      address.group.forEach(processAddress);
      parts.push(groupEnd);
    } else {
      parts.push(formatTextAddress(address));
    }
  };
  addresses.forEach(processAddress);
  return parts.join("");
}
function formatHtmlAddress(address) {
  return `<a href="mailto:${escapeHtml(address.address)}" class="postal-email-address">${escapeHtml(address.name || `<${address.address}>`)}</a>`;
}
function formatHtmlAddresses(addresses) {
  let parts = [];
  let processAddress = (address, partCounter) => {
    if (partCounter) {
      parts.push('<span class="postal-email-address-separator">, </span>');
    }
    if (address.group) {
      let groupStart = `<span class="postal-email-address-group">${escapeHtml(address.name)}:</span>`;
      let groupEnd = `<span class="postal-email-address-group">;</span>`;
      parts.push(groupStart);
      address.group.forEach(processAddress);
      parts.push(groupEnd);
    } else {
      parts.push(formatHtmlAddress(address));
    }
  };
  addresses.forEach(processAddress);
  return parts.join(" ");
}
function foldLines(str, lineLength, afterSpace) {
  str = (str || "").toString();
  lineLength = lineLength || 76;
  let pos = 0, len = str.length, result = "", line, match;
  while (pos < len) {
    line = str.substr(pos, lineLength);
    if (line.length < lineLength) {
      result += line;
      break;
    }
    if (match = line.match(/^[^\n\r]*(\r?\n|\r)/)) {
      line = match[0];
      result += line;
      pos += line.length;
      continue;
    } else if ((match = line.match(/(\s+)[^\s]*$/)) && match[0].length - (match[1] || "").length < line.length) {
      line = line.substr(0, line.length - (match[0].length - (match[1] || "").length));
    } else if (match = str.substr(pos + line.length).match(/^[^\s]+(\s*)/)) {
      line = line + match[0].substr(0, match[0].length - 0);
    }
    result += line;
    pos += line.length;
    if (pos < len) {
      result += "\r\n";
    }
  }
  return result;
}
function formatTextHeader(message2) {
  let rows = [];
  if (message2.from) {
    rows.push({ key: "From", val: formatTextAddress(message2.from) });
  }
  if (message2.subject) {
    rows.push({ key: "Subject", val: message2.subject });
  }
  if (message2.date) {
    let dateOptions = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false
    };
    let dateStr = typeof Intl === "undefined" ? message2.date : new Intl.DateTimeFormat("default", dateOptions).format(new Date(message2.date));
    rows.push({ key: "Date", val: dateStr });
  }
  if (message2.to && message2.to.length) {
    rows.push({ key: "To", val: formatTextAddresses(message2.to) });
  }
  if (message2.cc && message2.cc.length) {
    rows.push({ key: "Cc", val: formatTextAddresses(message2.cc) });
  }
  if (message2.bcc && message2.bcc.length) {
    rows.push({ key: "Bcc", val: formatTextAddresses(message2.bcc) });
  }
  let maxKeyLength = rows.map((r) => r.key.length).reduce((acc, cur) => {
    return cur > acc ? cur : acc;
  }, 0);
  rows = rows.flatMap((row) => {
    let sepLen = maxKeyLength - row.key.length;
    let prefix = `${row.key}: ${" ".repeat(sepLen)}`;
    let emptyPrefix = `${" ".repeat(row.key.length + 1)} ${" ".repeat(sepLen)}`;
    let foldedLines = foldLines(row.val, 80).split(/\r?\n/).map((line) => line.trim());
    return foldedLines.map((line, i) => `${i ? emptyPrefix : prefix}${line}`);
  });
  let maxLineLength = rows.map((r) => r.length).reduce((acc, cur) => {
    return cur > acc ? cur : acc;
  }, 0);
  let lineMarker = "-".repeat(maxLineLength);
  let template = `
${lineMarker}
${rows.join("\n")}
${lineMarker}
`;
  return template;
}
function formatHtmlHeader(message2) {
  let rows = [];
  if (message2.from) {
    rows.push(
      `<div class="postal-email-header-key">From</div><div class="postal-email-header-value">${formatHtmlAddress(message2.from)}</div>`
    );
  }
  if (message2.subject) {
    rows.push(
      `<div class="postal-email-header-key">Subject</div><div class="postal-email-header-value postal-email-header-subject">${escapeHtml(
        message2.subject
      )}</div>`
    );
  }
  if (message2.date) {
    let dateOptions = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false
    };
    let dateStr = typeof Intl === "undefined" ? message2.date : new Intl.DateTimeFormat("default", dateOptions).format(new Date(message2.date));
    rows.push(
      `<div class="postal-email-header-key">Date</div><div class="postal-email-header-value postal-email-header-date" data-date="${escapeHtml(
        message2.date
      )}">${escapeHtml(dateStr)}</div>`
    );
  }
  if (message2.to && message2.to.length) {
    rows.push(
      `<div class="postal-email-header-key">To</div><div class="postal-email-header-value">${formatHtmlAddresses(message2.to)}</div>`
    );
  }
  if (message2.cc && message2.cc.length) {
    rows.push(
      `<div class="postal-email-header-key">Cc</div><div class="postal-email-header-value">${formatHtmlAddresses(message2.cc)}</div>`
    );
  }
  if (message2.bcc && message2.bcc.length) {
    rows.push(
      `<div class="postal-email-header-key">Bcc</div><div class="postal-email-header-value">${formatHtmlAddresses(message2.bcc)}</div>`
    );
  }
  let template = `<div class="postal-email-header">${rows.length ? '<div class="postal-email-header-row">' : ""}${rows.join(
    '</div>\n<div class="postal-email-header-row">'
  )}${rows.length ? "</div>" : ""}</div>`;
  return template;
}
function _handleAddress(tokens, depth) {
  let isGroup = false;
  let state = "text";
  let address;
  let addresses = [];
  let data = {
    address: [],
    comment: [],
    group: [],
    text: [],
    textWasQuoted: []
    // Track which text tokens came from inside quotes
  };
  let i;
  let len;
  let insideQuotes = false;
  for (i = 0, len = tokens.length; i < len; i++) {
    let token = tokens[i];
    let prevToken = i ? tokens[i - 1] : null;
    if (token.type === "operator") {
      switch (token.value) {
        case "<":
          state = "address";
          insideQuotes = false;
          break;
        case "(":
          state = "comment";
          insideQuotes = false;
          break;
        case ":":
          state = "group";
          isGroup = true;
          insideQuotes = false;
          break;
        case '"':
          insideQuotes = !insideQuotes;
          state = "text";
          break;
        default:
          state = "text";
          insideQuotes = false;
          break;
      }
    } else if (token.value) {
      if (state === "address") {
        token.value = token.value.replace(/^[^<]*<\s*/, "");
      }
      if (prevToken && prevToken.noBreak && data[state].length) {
        data[state][data[state].length - 1] += token.value;
        if (state === "text" && insideQuotes) {
          data.textWasQuoted[data.textWasQuoted.length - 1] = true;
        }
      } else {
        data[state].push(token.value);
        if (state === "text") {
          data.textWasQuoted.push(insideQuotes);
        }
      }
    }
  }
  if (!data.text.length && data.comment.length) {
    data.text = data.comment;
    data.comment = [];
  }
  if (isGroup) {
    data.text = data.text.join(" ");
    let groupMembers = [];
    if (data.group.length) {
      let parsedGroup = addressParser(data.group.join(","), { _depth: depth + 1 });
      parsedGroup.forEach((member) => {
        if (member.group) {
          groupMembers = groupMembers.concat(member.group);
        } else {
          groupMembers.push(member);
        }
      });
    }
    addresses.push({
      name: decodeWords(data.text || address && address.name),
      group: groupMembers
    });
  } else {
    if (!data.address.length && data.text.length) {
      for (i = data.text.length - 1; i >= 0; i--) {
        if (!data.textWasQuoted[i] && data.text[i].match(/^[^@\s]+@[^@\s]+$/)) {
          data.address = data.text.splice(i, 1);
          data.textWasQuoted.splice(i, 1);
          break;
        }
      }
      let _regexHandler = function(address2) {
        if (!data.address.length) {
          data.address = [address2.trim()];
          return " ";
        } else {
          return address2;
        }
      };
      if (!data.address.length) {
        for (i = data.text.length - 1; i >= 0; i--) {
          if (!data.textWasQuoted[i]) {
            data.text[i] = data.text[i].replace(/\s*\b[^@\s]+@[^\s]+\b\s*/, _regexHandler).trim();
            if (data.address.length) {
              break;
            }
          }
        }
      }
    }
    if (!data.text.length && data.comment.length) {
      data.text = data.comment;
      data.comment = [];
    }
    if (data.address.length > 1) {
      data.text = data.text.concat(data.address.splice(1));
    }
    data.text = data.text.join(" ");
    data.address = data.address.join(" ");
    if (!data.address && /^=\?[^=]+?=$/.test(data.text.trim())) {
      const decodedText = decodeWords(data.text);
      if (/<[^<>]+@[^<>]+>/.test(decodedText)) {
        const parsedSubAddresses = addressParser(decodedText);
        if (parsedSubAddresses && parsedSubAddresses.length) {
          return parsedSubAddresses;
        }
      }
      return [{ address: "", name: decodedText }];
    }
    address = {
      address: data.address || data.text || "",
      name: decodeWords(data.text || data.address || "")
    };
    if (address.address === address.name) {
      if ((address.address || "").match(/@/)) {
        address.name = "";
      } else {
        address.address = "";
      }
    }
    addresses.push(address);
  }
  return addresses;
}
class Tokenizer {
  constructor(str) {
    this.str = (str || "").toString();
    this.operatorCurrent = "";
    this.operatorExpecting = "";
    this.node = null;
    this.escaped = false;
    this.list = [];
    this.operators = {
      '"': '"',
      "(": ")",
      "<": ">",
      ",": "",
      ":": ";",
      // Semicolons are not a legal delimiter per the RFC2822 grammar other
      // than for terminating a group, but they are also not valid for any
      // other use in this context.  Given that some mail clients have
      // historically allowed the semicolon as a delimiter equivalent to the
      // comma in their UI, it makes sense to treat them the same as a comma
      // when used outside of a group.
      ";": ""
    };
  }
  /**
   * Tokenizes the original input string
   *
   * @return {Array} An array of operator|text tokens
   */
  tokenize() {
    let list = [];
    for (let i = 0, len = this.str.length; i < len; i++) {
      let chr = this.str.charAt(i);
      let nextChr = i < len - 1 ? this.str.charAt(i + 1) : null;
      this.checkChar(chr, nextChr);
    }
    this.list.forEach((node) => {
      node.value = (node.value || "").toString().trim();
      if (node.value) {
        list.push(node);
      }
    });
    return list;
  }
  /**
   * Checks if a character is an operator or text and acts accordingly
   *
   * @param {String} chr Character from the address field
   */
  checkChar(chr, nextChr) {
    if (this.escaped) ;
    else if (chr === this.operatorExpecting) {
      this.node = {
        type: "operator",
        value: chr
      };
      if (nextChr && ![" ", "	", "\r", "\n", ",", ";"].includes(nextChr)) {
        this.node.noBreak = true;
      }
      this.list.push(this.node);
      this.node = null;
      this.operatorExpecting = "";
      this.escaped = false;
      return;
    } else if (!this.operatorExpecting && chr in this.operators) {
      this.node = {
        type: "operator",
        value: chr
      };
      this.list.push(this.node);
      this.node = null;
      this.operatorExpecting = this.operators[chr];
      this.escaped = false;
      return;
    } else if (this.operatorExpecting === '"' && chr === "\\") {
      this.escaped = true;
      return;
    }
    if (!this.node) {
      this.node = {
        type: "text",
        value: ""
      };
      this.list.push(this.node);
    }
    if (chr === "\n") {
      chr = " ";
    }
    if (chr.charCodeAt(0) >= 33 || [" ", "	"].includes(chr)) {
      this.node.value += chr;
    }
    this.escaped = false;
  }
}
const MAX_NESTED_GROUP_DEPTH = 50;
function addressParser(str, options) {
  options = options || {};
  let depth = options._depth || 0;
  if (depth > MAX_NESTED_GROUP_DEPTH) {
    return [];
  }
  let tokenizer = new Tokenizer(str);
  let tokens = tokenizer.tokenize();
  let addresses = [];
  let address = [];
  let parsedAddresses = [];
  tokens.forEach((token) => {
    if (token.type === "operator" && (token.value === "," || token.value === ";")) {
      if (address.length) {
        addresses.push(address);
      }
      address = [];
    } else {
      address.push(token);
    }
  });
  if (address.length) {
    addresses.push(address);
  }
  addresses.forEach((address2) => {
    address2 = _handleAddress(address2, depth);
    if (address2.length) {
      parsedAddresses = parsedAddresses.concat(address2);
    }
  });
  if (options.flatten) {
    let addresses2 = [];
    let walkAddressList = (list) => {
      list.forEach((address2) => {
        if (address2.group) {
          return walkAddressList(address2.group);
        } else {
          addresses2.push(address2);
        }
      });
    };
    walkAddressList(parsedAddresses);
    return addresses2;
  }
  return parsedAddresses;
}
function base64ArrayBuffer(arrayBuffer) {
  var base642 = "";
  var encodings = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  var bytes = new Uint8Array(arrayBuffer);
  var byteLength = bytes.byteLength;
  var byteRemainder = byteLength % 3;
  var mainLength = byteLength - byteRemainder;
  var a, b, c, d;
  var chunk;
  for (var i = 0; i < mainLength; i = i + 3) {
    chunk = bytes[i] << 16 | bytes[i + 1] << 8 | bytes[i + 2];
    a = (chunk & 16515072) >> 18;
    b = (chunk & 258048) >> 12;
    c = (chunk & 4032) >> 6;
    d = chunk & 63;
    base642 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
  }
  if (byteRemainder == 1) {
    chunk = bytes[mainLength];
    a = (chunk & 252) >> 2;
    b = (chunk & 3) << 4;
    base642 += encodings[a] + encodings[b] + "==";
  } else if (byteRemainder == 2) {
    chunk = bytes[mainLength] << 8 | bytes[mainLength + 1];
    a = (chunk & 64512) >> 10;
    b = (chunk & 1008) >> 4;
    c = (chunk & 15) << 2;
    base642 += encodings[a] + encodings[b] + encodings[c] + "=";
  }
  return base642;
}
const MAX_NESTING_DEPTH = 256;
const MAX_HEADERS_SIZE = 2 * 1024 * 1024;
function toCamelCase(key) {
  return key.replace(/-(.)/g, (o, c) => c.toUpperCase());
}
class PostalMime {
  static parse(buf, options) {
    const parser = new PostalMime(options);
    return parser.parse(buf);
  }
  constructor(options) {
    this.options = options || {};
    this.mimeOptions = {
      maxNestingDepth: this.options.maxNestingDepth || MAX_NESTING_DEPTH,
      maxHeadersSize: this.options.maxHeadersSize || MAX_HEADERS_SIZE
    };
    this.root = this.currentNode = new MimeNode({
      postalMime: this,
      ...this.mimeOptions
    });
    this.boundaries = [];
    this.textContent = {};
    this.attachments = [];
    this.attachmentEncoding = (this.options.attachmentEncoding || "").toString().replace(/[-_\s]/g, "").trim().toLowerCase() || "arraybuffer";
    this.started = false;
  }
  async finalize() {
    await this.root.finalize();
  }
  async processLine(line, isFinal) {
    let boundaries = this.boundaries;
    if (boundaries.length && line.length > 2 && line[0] === 45 && line[1] === 45) {
      for (let i = boundaries.length - 1; i >= 0; i--) {
        let boundary = boundaries[i];
        if (line.length < boundary.value.length + 2) {
          continue;
        }
        let boundaryMatches = true;
        for (let j = 0; j < boundary.value.length; j++) {
          if (line[j + 2] !== boundary.value[j]) {
            boundaryMatches = false;
            break;
          }
        }
        if (!boundaryMatches) {
          continue;
        }
        let boundaryEnd = boundary.value.length + 2;
        let isTerminator = false;
        if (line.length >= boundary.value.length + 4 && line[boundary.value.length + 2] === 45 && line[boundary.value.length + 3] === 45) {
          isTerminator = true;
          boundaryEnd = boundary.value.length + 4;
        }
        let hasValidTrailing = true;
        for (let j = boundaryEnd; j < line.length; j++) {
          if (line[j] !== 32 && line[j] !== 9) {
            hasValidTrailing = false;
            break;
          }
        }
        if (!hasValidTrailing) {
          continue;
        }
        if (isTerminator) {
          await boundary.node.finalize();
          this.currentNode = boundary.node.parentNode || this.root;
        } else {
          await boundary.node.finalizeChildNodes();
          this.currentNode = new MimeNode({
            postalMime: this,
            parentNode: boundary.node,
            parentMultipartType: boundary.node.contentType.multipart,
            ...this.mimeOptions
          });
        }
        if (isFinal) {
          return this.finalize();
        }
        return;
      }
    }
    this.currentNode.feed(line);
    if (isFinal) {
      return this.finalize();
    }
  }
  readLine() {
    let startPos = this.readPos;
    let endPos = this.readPos;
    while (this.readPos < this.av.length) {
      const c = this.av[this.readPos++];
      if (c !== 13 && c !== 10) {
        endPos = this.readPos;
      }
      if (c === 10) {
        return {
          bytes: new Uint8Array(this.buf, startPos, endPos - startPos),
          done: this.readPos >= this.av.length
        };
      }
    }
    return {
      bytes: new Uint8Array(this.buf, startPos, endPos - startPos),
      done: this.readPos >= this.av.length
    };
  }
  async processNodeTree() {
    let textContent = {};
    let textTypes = /* @__PURE__ */ new Set();
    let textMap = this.textMap = /* @__PURE__ */ new Map();
    let forceRfc822Attachments = this.forceRfc822Attachments();
    let walk = async (node, alternative, related) => {
      alternative = alternative || false;
      related = related || false;
      if (!node.contentType.multipart) {
        if (this.isInlineMessageRfc822(node) && !forceRfc822Attachments) {
          const subParser = new PostalMime();
          node.subMessage = await subParser.parse(node.content);
          if (!textMap.has(node)) {
            textMap.set(node, {});
          }
          let textEntry = textMap.get(node);
          if (node.subMessage.text || !node.subMessage.html) {
            textEntry.plain = textEntry.plain || [];
            textEntry.plain.push({ type: "subMessage", value: node.subMessage });
            textTypes.add("plain");
          }
          if (node.subMessage.html) {
            textEntry.html = textEntry.html || [];
            textEntry.html.push({ type: "subMessage", value: node.subMessage });
            textTypes.add("html");
          }
          if (subParser.textMap) {
            subParser.textMap.forEach((subTextEntry, subTextNode) => {
              textMap.set(subTextNode, subTextEntry);
            });
          }
          for (let attachment of node.subMessage.attachments || []) {
            this.attachments.push(attachment);
          }
        } else if (this.isInlineTextNode(node)) {
          let textType = node.contentType.parsed.value.substr(node.contentType.parsed.value.indexOf("/") + 1);
          let selectorNode = alternative || node;
          if (!textMap.has(selectorNode)) {
            textMap.set(selectorNode, {});
          }
          let textEntry = textMap.get(selectorNode);
          textEntry[textType] = textEntry[textType] || [];
          textEntry[textType].push({ type: "text", value: node.getTextContent() });
          textTypes.add(textType);
        } else if (node.content) {
          const filename = node.contentDisposition?.parsed?.params?.filename || node.contentType.parsed.params.name || null;
          const attachment = {
            filename: filename ? decodeWords(filename) : null,
            mimeType: node.contentType.parsed.value,
            disposition: node.contentDisposition?.parsed?.value || null
          };
          if (related && node.contentId) {
            attachment.related = true;
          }
          if (node.contentDescription) {
            attachment.description = node.contentDescription;
          }
          if (node.contentId) {
            attachment.contentId = node.contentId;
          }
          switch (node.contentType.parsed.value) {
            // Special handling for calendar events
            case "text/calendar":
            case "application/ics": {
              if (node.contentType.parsed.params.method) {
                attachment.method = node.contentType.parsed.params.method.toString().toUpperCase().trim();
              }
              const decodedText = node.getTextContent().replace(/\r?\n/g, "\n").replace(/\n*$/, "\n");
              attachment.content = textEncoder.encode(decodedText);
              break;
            }
            // Regular attachments
            default:
              attachment.content = node.content;
          }
          this.attachments.push(attachment);
        }
      } else if (node.contentType.multipart === "alternative") {
        alternative = node;
      } else if (node.contentType.multipart === "related") {
        related = node;
      }
      for (let childNode of node.childNodes) {
        await walk(childNode, alternative, related);
      }
    };
    await walk(this.root, false, false);
    textMap.forEach((mapEntry) => {
      textTypes.forEach((textType) => {
        if (!textContent[textType]) {
          textContent[textType] = [];
        }
        if (mapEntry[textType]) {
          mapEntry[textType].forEach((textEntry) => {
            switch (textEntry.type) {
              case "text":
                textContent[textType].push(textEntry.value);
                break;
              case "subMessage":
                {
                  switch (textType) {
                    case "html":
                      textContent[textType].push(formatHtmlHeader(textEntry.value));
                      break;
                    case "plain":
                      textContent[textType].push(formatTextHeader(textEntry.value));
                      break;
                  }
                }
                break;
            }
          });
        } else {
          let alternativeType;
          switch (textType) {
            case "html":
              alternativeType = "plain";
              break;
            case "plain":
              alternativeType = "html";
              break;
          }
          (mapEntry[alternativeType] || []).forEach((textEntry) => {
            switch (textEntry.type) {
              case "text":
                switch (textType) {
                  case "html":
                    textContent[textType].push(textToHtml(textEntry.value));
                    break;
                  case "plain":
                    textContent[textType].push(htmlToText(textEntry.value));
                    break;
                }
                break;
              case "subMessage":
                {
                  switch (textType) {
                    case "html":
                      textContent[textType].push(formatHtmlHeader(textEntry.value));
                      break;
                    case "plain":
                      textContent[textType].push(formatTextHeader(textEntry.value));
                      break;
                  }
                }
                break;
            }
          });
        }
      });
    });
    Object.keys(textContent).forEach((textType) => {
      textContent[textType] = textContent[textType].join("\n");
    });
    this.textContent = textContent;
  }
  isInlineTextNode(node) {
    if (node.contentDisposition?.parsed?.value === "attachment") {
      return false;
    }
    switch (node.contentType.parsed?.value) {
      case "text/html":
      case "text/plain":
        return true;
      case "text/calendar":
      case "text/csv":
      default:
        return false;
    }
  }
  isInlineMessageRfc822(node) {
    if (node.contentType.parsed?.value !== "message/rfc822") {
      return false;
    }
    let disposition = node.contentDisposition?.parsed?.value || (this.options.rfc822Attachments ? "attachment" : "inline");
    return disposition === "inline";
  }
  // Check if this is a specially crafted report email where message/rfc822 content should not be inlined
  forceRfc822Attachments() {
    if (this.options.forceRfc822Attachments) {
      return true;
    }
    let forceRfc822Attachments = false;
    let walk = (node) => {
      if (!node.contentType.multipart) {
        if (node.contentType.parsed && ["message/delivery-status", "message/feedback-report"].includes(node.contentType.parsed.value)) {
          forceRfc822Attachments = true;
        }
      }
      for (let childNode of node.childNodes) {
        walk(childNode);
      }
    };
    walk(this.root);
    return forceRfc822Attachments;
  }
  async resolveStream(stream) {
    let chunkLen = 0;
    let chunks = [];
    const reader = stream.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      chunks.push(value);
      chunkLen += value.length;
    }
    const result = new Uint8Array(chunkLen);
    let chunkPointer = 0;
    for (let chunk of chunks) {
      result.set(chunk, chunkPointer);
      chunkPointer += chunk.length;
    }
    return result;
  }
  async parse(buf) {
    if (this.started) {
      throw new Error("Can not reuse parser, create a new PostalMime object");
    }
    this.started = true;
    if (buf && typeof buf.getReader === "function") {
      buf = await this.resolveStream(buf);
    }
    buf = buf || new ArrayBuffer(0);
    if (typeof buf === "string") {
      buf = textEncoder.encode(buf);
    }
    if (buf instanceof Blob || Object.prototype.toString.call(buf) === "[object Blob]") {
      buf = await blobToArrayBuffer(buf);
    }
    if (buf.buffer instanceof ArrayBuffer) {
      buf = new Uint8Array(buf).buffer;
    }
    this.buf = buf;
    this.av = new Uint8Array(buf);
    this.readPos = 0;
    while (this.readPos < this.av.length) {
      const line = this.readLine();
      await this.processLine(line.bytes, line.done);
    }
    await this.processNodeTree();
    const message2 = {
      headers: this.root.headers.map((entry) => ({ key: entry.key, originalKey: entry.originalKey, value: entry.value })).reverse()
    };
    for (const key of ["from", "sender"]) {
      const addressHeader = this.root.headers.find((line) => line.key === key);
      if (addressHeader && addressHeader.value) {
        const addresses = addressParser(addressHeader.value);
        if (addresses && addresses.length) {
          message2[key] = addresses[0];
        }
      }
    }
    for (const key of ["delivered-to", "return-path"]) {
      const addressHeader = this.root.headers.find((line) => line.key === key);
      if (addressHeader && addressHeader.value) {
        const addresses = addressParser(addressHeader.value);
        if (addresses && addresses.length && addresses[0].address) {
          const camelKey = toCamelCase(key);
          message2[camelKey] = addresses[0].address;
        }
      }
    }
    for (const key of ["to", "cc", "bcc", "reply-to"]) {
      const addressHeaders = this.root.headers.filter((line) => line.key === key);
      let addresses = [];
      addressHeaders.filter((entry) => entry && entry.value).map((entry) => addressParser(entry.value)).forEach((parsed) => addresses = addresses.concat(parsed || []));
      if (addresses && addresses.length) {
        const camelKey = toCamelCase(key);
        message2[camelKey] = addresses;
      }
    }
    for (const key of ["subject", "message-id", "in-reply-to", "references"]) {
      const header = this.root.headers.find((line) => line.key === key);
      if (header && header.value) {
        const camelKey = toCamelCase(key);
        message2[camelKey] = decodeWords(header.value);
      }
    }
    let dateHeader = this.root.headers.find((line) => line.key === "date");
    if (dateHeader) {
      let date = new Date(dateHeader.value);
      if (date.toString() === "Invalid Date") {
        date = dateHeader.value;
      } else {
        date = date.toISOString();
      }
      message2.date = date;
    }
    if (this.textContent?.html) {
      message2.html = this.textContent.html;
    }
    if (this.textContent?.plain) {
      message2.text = this.textContent.plain;
    }
    message2.attachments = this.attachments;
    message2.headerLines = (this.root.rawHeaderLines || []).slice().reverse();
    switch (this.attachmentEncoding) {
      case "arraybuffer":
        break;
      case "base64":
        for (let attachment of message2.attachments || []) {
          if (attachment?.content) {
            attachment.content = base64ArrayBuffer(attachment.content);
            attachment.encoding = "base64";
          }
        }
        break;
      case "utf8":
        let attachmentDecoder = new TextDecoder("utf8");
        for (let attachment of message2.attachments || []) {
          if (attachment?.content) {
            attachment.content = attachmentDecoder.decode(attachment.content);
            attachment.encoding = "utf8";
          }
        }
        break;
      default:
        throw new Error("Unknown attachment encoding");
    }
    return message2;
  }
}
var dist$1 = {};
var application = {};
var applicationIn = {};
var hasRequiredApplicationIn;
function requireApplicationIn() {
  if (hasRequiredApplicationIn) return applicationIn;
  hasRequiredApplicationIn = 1;
  Object.defineProperty(applicationIn, "__esModule", { value: true });
  applicationIn.ApplicationInSerializer = void 0;
  applicationIn.ApplicationInSerializer = {
    _fromJsonObject(object) {
      return {
        metadata: object["metadata"],
        name: object["name"],
        rateLimit: object["rateLimit"],
        uid: object["uid"]
      };
    },
    _toJsonObject(self) {
      return {
        metadata: self.metadata,
        name: self.name,
        rateLimit: self.rateLimit,
        uid: self.uid
      };
    }
  };
  return applicationIn;
}
var applicationOut = {};
var hasRequiredApplicationOut;
function requireApplicationOut() {
  if (hasRequiredApplicationOut) return applicationOut;
  hasRequiredApplicationOut = 1;
  Object.defineProperty(applicationOut, "__esModule", { value: true });
  applicationOut.ApplicationOutSerializer = void 0;
  applicationOut.ApplicationOutSerializer = {
    _fromJsonObject(object) {
      return {
        createdAt: new Date(object["createdAt"]),
        id: object["id"],
        metadata: object["metadata"],
        name: object["name"],
        rateLimit: object["rateLimit"],
        uid: object["uid"],
        updatedAt: new Date(object["updatedAt"])
      };
    },
    _toJsonObject(self) {
      return {
        createdAt: self.createdAt,
        id: self.id,
        metadata: self.metadata,
        name: self.name,
        rateLimit: self.rateLimit,
        uid: self.uid,
        updatedAt: self.updatedAt
      };
    }
  };
  return applicationOut;
}
var applicationPatch = {};
var hasRequiredApplicationPatch;
function requireApplicationPatch() {
  if (hasRequiredApplicationPatch) return applicationPatch;
  hasRequiredApplicationPatch = 1;
  Object.defineProperty(applicationPatch, "__esModule", { value: true });
  applicationPatch.ApplicationPatchSerializer = void 0;
  applicationPatch.ApplicationPatchSerializer = {
    _fromJsonObject(object) {
      return {
        metadata: object["metadata"],
        name: object["name"],
        rateLimit: object["rateLimit"],
        uid: object["uid"]
      };
    },
    _toJsonObject(self) {
      return {
        metadata: self.metadata,
        name: self.name,
        rateLimit: self.rateLimit,
        uid: self.uid
      };
    }
  };
  return applicationPatch;
}
var listResponseApplicationOut = {};
var hasRequiredListResponseApplicationOut;
function requireListResponseApplicationOut() {
  if (hasRequiredListResponseApplicationOut) return listResponseApplicationOut;
  hasRequiredListResponseApplicationOut = 1;
  Object.defineProperty(listResponseApplicationOut, "__esModule", { value: true });
  listResponseApplicationOut.ListResponseApplicationOutSerializer = void 0;
  const applicationOut_1 = requireApplicationOut();
  listResponseApplicationOut.ListResponseApplicationOutSerializer = {
    _fromJsonObject(object) {
      return {
        data: object["data"].map((item) => applicationOut_1.ApplicationOutSerializer._fromJsonObject(item)),
        done: object["done"],
        iterator: object["iterator"],
        prevIterator: object["prevIterator"]
      };
    },
    _toJsonObject(self) {
      return {
        data: self.data.map((item) => applicationOut_1.ApplicationOutSerializer._toJsonObject(item)),
        done: self.done,
        iterator: self.iterator,
        prevIterator: self.prevIterator
      };
    }
  };
  return listResponseApplicationOut;
}
var request = {};
var util = {};
var hasRequiredUtil;
function requireUtil() {
  if (hasRequiredUtil) return util;
  hasRequiredUtil = 1;
  Object.defineProperty(util, "__esModule", { value: true });
  util.ApiException = void 0;
  class ApiException extends Error {
    constructor(code, body, headers) {
      super(`HTTP-Code: ${code}
Headers: ${JSON.stringify(headers)}`);
      this.code = code;
      this.body = body;
      this.headers = {};
      headers.forEach((value, name) => {
        this.headers[name] = value;
      });
    }
  }
  util.ApiException = ApiException;
  return util;
}
var commonjsBrowser = {};
var max = {};
var hasRequiredMax;
function requireMax() {
  if (hasRequiredMax) return max;
  hasRequiredMax = 1;
  Object.defineProperty(max, "__esModule", {
    value: true
  });
  max.default = void 0;
  max.default = "ffffffff-ffff-ffff-ffff-ffffffffffff";
  return max;
}
var nil = {};
var hasRequiredNil;
function requireNil() {
  if (hasRequiredNil) return nil;
  hasRequiredNil = 1;
  Object.defineProperty(nil, "__esModule", {
    value: true
  });
  nil.default = void 0;
  nil.default = "00000000-0000-0000-0000-000000000000";
  return nil;
}
var parse = {};
var validate = {};
var regex = {};
var hasRequiredRegex;
function requireRegex() {
  if (hasRequiredRegex) return regex;
  hasRequiredRegex = 1;
  Object.defineProperty(regex, "__esModule", {
    value: true
  });
  regex.default = void 0;
  regex.default = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;
  return regex;
}
var hasRequiredValidate;
function requireValidate() {
  if (hasRequiredValidate) return validate;
  hasRequiredValidate = 1;
  Object.defineProperty(validate, "__esModule", {
    value: true
  });
  validate.default = void 0;
  var _regex = _interopRequireDefault(/* @__PURE__ */ requireRegex());
  function _interopRequireDefault(e) {
    return e && e.__esModule ? e : { default: e };
  }
  function validate$1(uuid) {
    return typeof uuid === "string" && _regex.default.test(uuid);
  }
  validate.default = validate$1;
  return validate;
}
var hasRequiredParse;
function requireParse() {
  if (hasRequiredParse) return parse;
  hasRequiredParse = 1;
  Object.defineProperty(parse, "__esModule", {
    value: true
  });
  parse.default = void 0;
  var _validate = _interopRequireDefault(/* @__PURE__ */ requireValidate());
  function _interopRequireDefault(e) {
    return e && e.__esModule ? e : { default: e };
  }
  function parse$1(uuid) {
    if (!(0, _validate.default)(uuid)) {
      throw TypeError("Invalid UUID");
    }
    var v;
    var arr = new Uint8Array(16);
    arr[0] = (v = parseInt(uuid.slice(0, 8), 16)) >>> 24;
    arr[1] = v >>> 16 & 255;
    arr[2] = v >>> 8 & 255;
    arr[3] = v & 255;
    arr[4] = (v = parseInt(uuid.slice(9, 13), 16)) >>> 8;
    arr[5] = v & 255;
    arr[6] = (v = parseInt(uuid.slice(14, 18), 16)) >>> 8;
    arr[7] = v & 255;
    arr[8] = (v = parseInt(uuid.slice(19, 23), 16)) >>> 8;
    arr[9] = v & 255;
    arr[10] = (v = parseInt(uuid.slice(24, 36), 16)) / 1099511627776 & 255;
    arr[11] = v / 4294967296 & 255;
    arr[12] = v >>> 24 & 255;
    arr[13] = v >>> 16 & 255;
    arr[14] = v >>> 8 & 255;
    arr[15] = v & 255;
    return arr;
  }
  parse.default = parse$1;
  return parse;
}
var stringify = {};
var hasRequiredStringify;
function requireStringify() {
  if (hasRequiredStringify) return stringify;
  hasRequiredStringify = 1;
  Object.defineProperty(stringify, "__esModule", {
    value: true
  });
  stringify.default = void 0;
  stringify.unsafeStringify = unsafeStringify;
  var _validate = _interopRequireDefault(/* @__PURE__ */ requireValidate());
  function _interopRequireDefault(e) {
    return e && e.__esModule ? e : { default: e };
  }
  var byteToHex = [];
  for (var i = 0; i < 256; ++i) {
    byteToHex.push((i + 256).toString(16).slice(1));
  }
  function unsafeStringify(arr, offset = 0) {
    return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
  }
  function stringify$1(arr, offset = 0) {
    var uuid = unsafeStringify(arr, offset);
    if (!(0, _validate.default)(uuid)) {
      throw TypeError("Stringified UUID is invalid");
    }
    return uuid;
  }
  stringify.default = stringify$1;
  return stringify;
}
var v1 = {};
var rng = {};
var hasRequiredRng;
function requireRng() {
  if (hasRequiredRng) return rng;
  hasRequiredRng = 1;
  Object.defineProperty(rng, "__esModule", {
    value: true
  });
  rng.default = rng$1;
  var getRandomValues;
  var rnds8 = new Uint8Array(16);
  function rng$1() {
    if (!getRandomValues) {
      getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
      if (!getRandomValues) {
        throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
      }
    }
    return getRandomValues(rnds8);
  }
  return rng;
}
var hasRequiredV1;
function requireV1() {
  if (hasRequiredV1) return v1;
  hasRequiredV1 = 1;
  Object.defineProperty(v1, "__esModule", {
    value: true
  });
  v1.default = void 0;
  var _rng = _interopRequireDefault(/* @__PURE__ */ requireRng());
  var _stringify = /* @__PURE__ */ requireStringify();
  function _interopRequireDefault(e) {
    return e && e.__esModule ? e : { default: e };
  }
  var _nodeId;
  var _clockseq;
  var _lastMSecs = 0;
  var _lastNSecs = 0;
  function v1$1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || new Array(16);
    options = options || {};
    var node = options.node;
    var clockseq = options.clockseq;
    if (!options._v6) {
      if (!node) {
        node = _nodeId;
      }
      if (clockseq == null) {
        clockseq = _clockseq;
      }
    }
    if (node == null || clockseq == null) {
      var seedBytes = options.random || (options.rng || _rng.default)();
      if (node == null) {
        node = [seedBytes[0], seedBytes[1], seedBytes[2], seedBytes[3], seedBytes[4], seedBytes[5]];
        if (!_nodeId && !options._v6) {
          node[0] |= 1;
          _nodeId = node;
        }
      }
      if (clockseq == null) {
        clockseq = (seedBytes[6] << 8 | seedBytes[7]) & 16383;
        if (_clockseq === void 0 && !options._v6) {
          _clockseq = clockseq;
        }
      }
    }
    var msecs = options.msecs !== void 0 ? options.msecs : Date.now();
    var nsecs = options.nsecs !== void 0 ? options.nsecs : _lastNSecs + 1;
    var dt = msecs - _lastMSecs + (nsecs - _lastNSecs) / 1e4;
    if (dt < 0 && options.clockseq === void 0) {
      clockseq = clockseq + 1 & 16383;
    }
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === void 0) {
      nsecs = 0;
    }
    if (nsecs >= 1e4) {
      throw new Error("uuid.v1(): Can't create more than 10M uuids/sec");
    }
    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;
    msecs += 122192928e5;
    var tl = ((msecs & 268435455) * 1e4 + nsecs) % 4294967296;
    b[i++] = tl >>> 24 & 255;
    b[i++] = tl >>> 16 & 255;
    b[i++] = tl >>> 8 & 255;
    b[i++] = tl & 255;
    var tmh = msecs / 4294967296 * 1e4 & 268435455;
    b[i++] = tmh >>> 8 & 255;
    b[i++] = tmh & 255;
    b[i++] = tmh >>> 24 & 15 | 16;
    b[i++] = tmh >>> 16 & 255;
    b[i++] = clockseq >>> 8 | 128;
    b[i++] = clockseq & 255;
    for (var n = 0; n < 6; ++n) {
      b[i + n] = node[n];
    }
    return buf || (0, _stringify.unsafeStringify)(b);
  }
  v1.default = v1$1;
  return v1;
}
var v1ToV6 = {};
var hasRequiredV1ToV6;
function requireV1ToV6() {
  if (hasRequiredV1ToV6) return v1ToV6;
  hasRequiredV1ToV6 = 1;
  Object.defineProperty(v1ToV6, "__esModule", {
    value: true
  });
  v1ToV6.default = v1ToV6$1;
  var _parse = _interopRequireDefault(/* @__PURE__ */ requireParse());
  var _stringify = /* @__PURE__ */ requireStringify();
  function _interopRequireDefault(e) {
    return e && e.__esModule ? e : { default: e };
  }
  function v1ToV6$1(uuid) {
    var v1Bytes = typeof uuid === "string" ? (0, _parse.default)(uuid) : uuid;
    var v6Bytes = _v1ToV6(v1Bytes);
    return typeof uuid === "string" ? (0, _stringify.unsafeStringify)(v6Bytes) : v6Bytes;
  }
  function _v1ToV6(v1Bytes, randomize = false) {
    return Uint8Array.of((v1Bytes[6] & 15) << 4 | v1Bytes[7] >> 4 & 15, (v1Bytes[7] & 15) << 4 | (v1Bytes[4] & 240) >> 4, (v1Bytes[4] & 15) << 4 | (v1Bytes[5] & 240) >> 4, (v1Bytes[5] & 15) << 4 | (v1Bytes[0] & 240) >> 4, (v1Bytes[0] & 15) << 4 | (v1Bytes[1] & 240) >> 4, (v1Bytes[1] & 15) << 4 | (v1Bytes[2] & 240) >> 4, 96 | v1Bytes[2] & 15, v1Bytes[3], v1Bytes[8], v1Bytes[9], v1Bytes[10], v1Bytes[11], v1Bytes[12], v1Bytes[13], v1Bytes[14], v1Bytes[15]);
  }
  return v1ToV6;
}
var v3 = {};
var v35 = {};
var hasRequiredV35;
function requireV35() {
  if (hasRequiredV35) return v35;
  hasRequiredV35 = 1;
  Object.defineProperty(v35, "__esModule", {
    value: true
  });
  v35.URL = v35.DNS = void 0;
  v35.default = v35$1;
  var _stringify = /* @__PURE__ */ requireStringify();
  var _parse = _interopRequireDefault(/* @__PURE__ */ requireParse());
  function _interopRequireDefault(e) {
    return e && e.__esModule ? e : { default: e };
  }
  function stringToBytes(str) {
    str = unescape(encodeURIComponent(str));
    var bytes = [];
    for (var i = 0; i < str.length; ++i) {
      bytes.push(str.charCodeAt(i));
    }
    return bytes;
  }
  var DNS = v35.DNS = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
  var URL2 = v35.URL = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";
  function v35$1(name, version2, hashfunc) {
    function generateUUID(value, namespace, buf, offset) {
      var _namespace;
      if (typeof value === "string") {
        value = stringToBytes(value);
      }
      if (typeof namespace === "string") {
        namespace = (0, _parse.default)(namespace);
      }
      if (((_namespace = namespace) === null || _namespace === void 0 ? void 0 : _namespace.length) !== 16) {
        throw TypeError("Namespace must be array-like (16 iterable integer values, 0-255)");
      }
      var bytes = new Uint8Array(16 + value.length);
      bytes.set(namespace);
      bytes.set(value, namespace.length);
      bytes = hashfunc(bytes);
      bytes[6] = bytes[6] & 15 | version2;
      bytes[8] = bytes[8] & 63 | 128;
      if (buf) {
        offset = offset || 0;
        for (var i = 0; i < 16; ++i) {
          buf[offset + i] = bytes[i];
        }
        return buf;
      }
      return (0, _stringify.unsafeStringify)(bytes);
    }
    try {
      generateUUID.name = name;
    } catch (err) {
    }
    generateUUID.DNS = DNS;
    generateUUID.URL = URL2;
    return generateUUID;
  }
  return v35;
}
var md5 = {};
var hasRequiredMd5;
function requireMd5() {
  if (hasRequiredMd5) return md5;
  hasRequiredMd5 = 1;
  Object.defineProperty(md5, "__esModule", {
    value: true
  });
  md5.default = void 0;
  function md5$1(bytes) {
    if (typeof bytes === "string") {
      var msg = unescape(encodeURIComponent(bytes));
      bytes = new Uint8Array(msg.length);
      for (var i = 0; i < msg.length; ++i) {
        bytes[i] = msg.charCodeAt(i);
      }
    }
    return md5ToHexEncodedArray(wordsToMd5(bytesToWords(bytes), bytes.length * 8));
  }
  function md5ToHexEncodedArray(input) {
    var output = [];
    var length32 = input.length * 32;
    var hexTab = "0123456789abcdef";
    for (var i = 0; i < length32; i += 8) {
      var x = input[i >> 5] >>> i % 32 & 255;
      var hex = parseInt(hexTab.charAt(x >>> 4 & 15) + hexTab.charAt(x & 15), 16);
      output.push(hex);
    }
    return output;
  }
  function getOutputLength(inputLength8) {
    return (inputLength8 + 64 >>> 9 << 4) + 14 + 1;
  }
  function wordsToMd5(x, len) {
    x[len >> 5] |= 128 << len % 32;
    x[getOutputLength(len) - 1] = len;
    var a = 1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d = 271733878;
    for (var i = 0; i < x.length; i += 16) {
      var olda = a;
      var oldb = b;
      var oldc = c;
      var oldd = d;
      a = md5ff(a, b, c, d, x[i], 7, -680876936);
      d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
      c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
      b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
      a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
      d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
      c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
      b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
      a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
      d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
      c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
      b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
      a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
      d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
      c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
      b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);
      a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
      d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
      c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
      b = md5gg(b, c, d, a, x[i], 20, -373897302);
      a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
      d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
      c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
      b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
      a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
      d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
      c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
      b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
      a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
      d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
      c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
      b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);
      a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
      d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
      c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
      b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
      a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
      d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
      c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
      b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
      a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
      d = md5hh(d, a, b, c, x[i], 11, -358537222);
      c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
      b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
      a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
      d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
      c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
      b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);
      a = md5ii(a, b, c, d, x[i], 6, -198630844);
      d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
      c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
      b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
      a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
      d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
      c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
      b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
      a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
      d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
      c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
      b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
      a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
      d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
      c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
      b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);
      a = safeAdd(a, olda);
      b = safeAdd(b, oldb);
      c = safeAdd(c, oldc);
      d = safeAdd(d, oldd);
    }
    return [a, b, c, d];
  }
  function bytesToWords(input) {
    if (input.length === 0) {
      return [];
    }
    var length8 = input.length * 8;
    var output = new Uint32Array(getOutputLength(length8));
    for (var i = 0; i < length8; i += 8) {
      output[i >> 5] |= (input[i / 8] & 255) << i % 32;
    }
    return output;
  }
  function safeAdd(x, y) {
    var lsw = (x & 65535) + (y & 65535);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return msw << 16 | lsw & 65535;
  }
  function bitRotateLeft(num, cnt) {
    return num << cnt | num >>> 32 - cnt;
  }
  function md5cmn(q, a, b, x, s, t) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }
  function md5ff(a, b, c, d, x, s, t) {
    return md5cmn(b & c | ~b & d, a, b, x, s, t);
  }
  function md5gg(a, b, c, d, x, s, t) {
    return md5cmn(b & d | c & ~d, a, b, x, s, t);
  }
  function md5hh(a, b, c, d, x, s, t) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function md5ii(a, b, c, d, x, s, t) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  md5.default = md5$1;
  return md5;
}
var hasRequiredV3;
function requireV3() {
  if (hasRequiredV3) return v3;
  hasRequiredV3 = 1;
  Object.defineProperty(v3, "__esModule", {
    value: true
  });
  v3.default = void 0;
  var _v = _interopRequireDefault(/* @__PURE__ */ requireV35());
  var _md = _interopRequireDefault(/* @__PURE__ */ requireMd5());
  function _interopRequireDefault(e) {
    return e && e.__esModule ? e : { default: e };
  }
  var v3$1 = (0, _v.default)("v3", 48, _md.default);
  v3.default = v3$1;
  return v3;
}
var v4 = {};
var native = {};
var hasRequiredNative;
function requireNative() {
  if (hasRequiredNative) return native;
  hasRequiredNative = 1;
  Object.defineProperty(native, "__esModule", {
    value: true
  });
  native.default = void 0;
  var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
  native.default = {
    randomUUID
  };
  return native;
}
var hasRequiredV4;
function requireV4() {
  if (hasRequiredV4) return v4;
  hasRequiredV4 = 1;
  Object.defineProperty(v4, "__esModule", {
    value: true
  });
  v4.default = void 0;
  var _native = _interopRequireDefault(/* @__PURE__ */ requireNative());
  var _rng = _interopRequireDefault(/* @__PURE__ */ requireRng());
  var _stringify = /* @__PURE__ */ requireStringify();
  function _interopRequireDefault(e) {
    return e && e.__esModule ? e : { default: e };
  }
  function v4$1(options, buf, offset) {
    if (_native.default.randomUUID && !buf && !options) {
      return _native.default.randomUUID();
    }
    options = options || {};
    var rnds = options.random || (options.rng || _rng.default)();
    rnds[6] = rnds[6] & 15 | 64;
    rnds[8] = rnds[8] & 63 | 128;
    if (buf) {
      offset = offset || 0;
      for (var i = 0; i < 16; ++i) {
        buf[offset + i] = rnds[i];
      }
      return buf;
    }
    return (0, _stringify.unsafeStringify)(rnds);
  }
  v4.default = v4$1;
  return v4;
}
var v5 = {};
var sha1 = {};
var hasRequiredSha1;
function requireSha1() {
  if (hasRequiredSha1) return sha1;
  hasRequiredSha1 = 1;
  Object.defineProperty(sha1, "__esModule", {
    value: true
  });
  sha1.default = void 0;
  function f(s, x, y, z) {
    switch (s) {
      case 0:
        return x & y ^ ~x & z;
      case 1:
        return x ^ y ^ z;
      case 2:
        return x & y ^ x & z ^ y & z;
      case 3:
        return x ^ y ^ z;
    }
  }
  function ROTL(x, n) {
    return x << n | x >>> 32 - n;
  }
  function sha1$1(bytes) {
    var K = [1518500249, 1859775393, 2400959708, 3395469782];
    var H = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
    if (typeof bytes === "string") {
      var msg = unescape(encodeURIComponent(bytes));
      bytes = [];
      for (var i = 0; i < msg.length; ++i) {
        bytes.push(msg.charCodeAt(i));
      }
    } else if (!Array.isArray(bytes)) {
      bytes = Array.prototype.slice.call(bytes);
    }
    bytes.push(128);
    var l = bytes.length / 4 + 2;
    var N = Math.ceil(l / 16);
    var M = new Array(N);
    for (var _i = 0; _i < N; ++_i) {
      var arr = new Uint32Array(16);
      for (var j = 0; j < 16; ++j) {
        arr[j] = bytes[_i * 64 + j * 4] << 24 | bytes[_i * 64 + j * 4 + 1] << 16 | bytes[_i * 64 + j * 4 + 2] << 8 | bytes[_i * 64 + j * 4 + 3];
      }
      M[_i] = arr;
    }
    M[N - 1][14] = (bytes.length - 1) * 8 / Math.pow(2, 32);
    M[N - 1][14] = Math.floor(M[N - 1][14]);
    M[N - 1][15] = (bytes.length - 1) * 8 & 4294967295;
    for (var _i2 = 0; _i2 < N; ++_i2) {
      var W = new Uint32Array(80);
      for (var t = 0; t < 16; ++t) {
        W[t] = M[_i2][t];
      }
      for (var _t = 16; _t < 80; ++_t) {
        W[_t] = ROTL(W[_t - 3] ^ W[_t - 8] ^ W[_t - 14] ^ W[_t - 16], 1);
      }
      var a = H[0];
      var b = H[1];
      var c = H[2];
      var d = H[3];
      var e = H[4];
      for (var _t2 = 0; _t2 < 80; ++_t2) {
        var s = Math.floor(_t2 / 20);
        var T = ROTL(a, 5) + f(s, b, c, d) + e + K[s] + W[_t2] >>> 0;
        e = d;
        d = c;
        c = ROTL(b, 30) >>> 0;
        b = a;
        a = T;
      }
      H[0] = H[0] + a >>> 0;
      H[1] = H[1] + b >>> 0;
      H[2] = H[2] + c >>> 0;
      H[3] = H[3] + d >>> 0;
      H[4] = H[4] + e >>> 0;
    }
    return [H[0] >> 24 & 255, H[0] >> 16 & 255, H[0] >> 8 & 255, H[0] & 255, H[1] >> 24 & 255, H[1] >> 16 & 255, H[1] >> 8 & 255, H[1] & 255, H[2] >> 24 & 255, H[2] >> 16 & 255, H[2] >> 8 & 255, H[2] & 255, H[3] >> 24 & 255, H[3] >> 16 & 255, H[3] >> 8 & 255, H[3] & 255, H[4] >> 24 & 255, H[4] >> 16 & 255, H[4] >> 8 & 255, H[4] & 255];
  }
  sha1.default = sha1$1;
  return sha1;
}
var hasRequiredV5;
function requireV5() {
  if (hasRequiredV5) return v5;
  hasRequiredV5 = 1;
  Object.defineProperty(v5, "__esModule", {
    value: true
  });
  v5.default = void 0;
  var _v = _interopRequireDefault(/* @__PURE__ */ requireV35());
  var _sha = _interopRequireDefault(/* @__PURE__ */ requireSha1());
  function _interopRequireDefault(e) {
    return e && e.__esModule ? e : { default: e };
  }
  var v5$1 = (0, _v.default)("v5", 80, _sha.default);
  v5.default = v5$1;
  return v5;
}
var v6 = {};
var hasRequiredV6;
function requireV6() {
  if (hasRequiredV6) return v6;
  hasRequiredV6 = 1;
  Object.defineProperty(v6, "__esModule", {
    value: true
  });
  v6.default = v6$1;
  var _stringify = /* @__PURE__ */ requireStringify();
  var _v = _interopRequireDefault(/* @__PURE__ */ requireV1());
  var _v1ToV = _interopRequireDefault(/* @__PURE__ */ requireV1ToV6());
  function _interopRequireDefault(e) {
    return e && e.__esModule ? e : { default: e };
  }
  function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var o = Object.getOwnPropertySymbols(e);
      r && (o = o.filter(function(r2) {
        return Object.getOwnPropertyDescriptor(e, r2).enumerable;
      })), t.push.apply(t, o);
    }
    return t;
  }
  function _objectSpread(e) {
    for (var r = 1; r < arguments.length; r++) {
      var t = null != arguments[r] ? arguments[r] : {};
      r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
        _defineProperty(e, r2, t[r2]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
        Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
      });
    }
    return e;
  }
  function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: true, configurable: true, writable: true }) : e[r] = t, e;
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r);
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function v6$1(options = {}, buf, offset = 0) {
    var bytes = (0, _v.default)(_objectSpread(_objectSpread({}, options), {}, {
      _v6: true
    }), new Uint8Array(16));
    bytes = (0, _v1ToV.default)(bytes);
    if (buf) {
      for (var i = 0; i < 16; i++) {
        buf[offset + i] = bytes[i];
      }
      return buf;
    }
    return (0, _stringify.unsafeStringify)(bytes);
  }
  return v6;
}
var v6ToV1 = {};
var hasRequiredV6ToV1;
function requireV6ToV1() {
  if (hasRequiredV6ToV1) return v6ToV1;
  hasRequiredV6ToV1 = 1;
  Object.defineProperty(v6ToV1, "__esModule", {
    value: true
  });
  v6ToV1.default = v6ToV1$1;
  var _parse = _interopRequireDefault(/* @__PURE__ */ requireParse());
  var _stringify = /* @__PURE__ */ requireStringify();
  function _interopRequireDefault(e) {
    return e && e.__esModule ? e : { default: e };
  }
  function v6ToV1$1(uuid) {
    var v6Bytes = typeof uuid === "string" ? (0, _parse.default)(uuid) : uuid;
    var v1Bytes = _v6ToV1(v6Bytes);
    return typeof uuid === "string" ? (0, _stringify.unsafeStringify)(v1Bytes) : v1Bytes;
  }
  function _v6ToV1(v6Bytes) {
    return Uint8Array.of((v6Bytes[3] & 15) << 4 | v6Bytes[4] >> 4 & 15, (v6Bytes[4] & 15) << 4 | (v6Bytes[5] & 240) >> 4, (v6Bytes[5] & 15) << 4 | v6Bytes[6] & 15, v6Bytes[7], (v6Bytes[1] & 15) << 4 | (v6Bytes[2] & 240) >> 4, (v6Bytes[2] & 15) << 4 | (v6Bytes[3] & 240) >> 4, 16 | (v6Bytes[0] & 240) >> 4, (v6Bytes[0] & 15) << 4 | (v6Bytes[1] & 240) >> 4, v6Bytes[8], v6Bytes[9], v6Bytes[10], v6Bytes[11], v6Bytes[12], v6Bytes[13], v6Bytes[14], v6Bytes[15]);
  }
  return v6ToV1;
}
var v7 = {};
var hasRequiredV7;
function requireV7() {
  if (hasRequiredV7) return v7;
  hasRequiredV7 = 1;
  Object.defineProperty(v7, "__esModule", {
    value: true
  });
  v7.default = void 0;
  var _rng = _interopRequireDefault(/* @__PURE__ */ requireRng());
  var _stringify = /* @__PURE__ */ requireStringify();
  function _interopRequireDefault(e) {
    return e && e.__esModule ? e : { default: e };
  }
  var _seqLow = null;
  var _seqHigh = null;
  var _msecs = 0;
  function v7$1(options, buf, offset) {
    options = options || {};
    var i = buf && offset || 0;
    var b = buf || new Uint8Array(16);
    var rnds = options.random || (options.rng || _rng.default)();
    var msecs = options.msecs !== void 0 ? options.msecs : Date.now();
    var seq = options.seq !== void 0 ? options.seq : null;
    var seqHigh = _seqHigh;
    var seqLow = _seqLow;
    if (msecs > _msecs && options.msecs === void 0) {
      _msecs = msecs;
      if (seq !== null) {
        seqHigh = null;
        seqLow = null;
      }
    }
    if (seq !== null) {
      if (seq > 2147483647) {
        seq = 2147483647;
      }
      seqHigh = seq >>> 19 & 4095;
      seqLow = seq & 524287;
    }
    if (seqHigh === null || seqLow === null) {
      seqHigh = rnds[6] & 127;
      seqHigh = seqHigh << 8 | rnds[7];
      seqLow = rnds[8] & 63;
      seqLow = seqLow << 8 | rnds[9];
      seqLow = seqLow << 5 | rnds[10] >>> 3;
    }
    if (msecs + 1e4 > _msecs && seq === null) {
      if (++seqLow > 524287) {
        seqLow = 0;
        if (++seqHigh > 4095) {
          seqHigh = 0;
          _msecs++;
        }
      }
    } else {
      _msecs = msecs;
    }
    _seqHigh = seqHigh;
    _seqLow = seqLow;
    b[i++] = _msecs / 1099511627776 & 255;
    b[i++] = _msecs / 4294967296 & 255;
    b[i++] = _msecs / 16777216 & 255;
    b[i++] = _msecs / 65536 & 255;
    b[i++] = _msecs / 256 & 255;
    b[i++] = _msecs & 255;
    b[i++] = seqHigh >>> 4 & 15 | 112;
    b[i++] = seqHigh & 255;
    b[i++] = seqLow >>> 13 & 63 | 128;
    b[i++] = seqLow >>> 5 & 255;
    b[i++] = seqLow << 3 & 255 | rnds[10] & 7;
    b[i++] = rnds[11];
    b[i++] = rnds[12];
    b[i++] = rnds[13];
    b[i++] = rnds[14];
    b[i++] = rnds[15];
    return buf || (0, _stringify.unsafeStringify)(b);
  }
  v7.default = v7$1;
  return v7;
}
var version$1 = {};
var hasRequiredVersion;
function requireVersion() {
  if (hasRequiredVersion) return version$1;
  hasRequiredVersion = 1;
  Object.defineProperty(version$1, "__esModule", {
    value: true
  });
  version$1.default = void 0;
  var _validate = _interopRequireDefault(/* @__PURE__ */ requireValidate());
  function _interopRequireDefault(e) {
    return e && e.__esModule ? e : { default: e };
  }
  function version2(uuid) {
    if (!(0, _validate.default)(uuid)) {
      throw TypeError("Invalid UUID");
    }
    return parseInt(uuid.slice(14, 15), 16);
  }
  version$1.default = version2;
  return version$1;
}
var hasRequiredCommonjsBrowser;
function requireCommonjsBrowser() {
  if (hasRequiredCommonjsBrowser) return commonjsBrowser;
  hasRequiredCommonjsBrowser = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", {
      value: true
    });
    Object.defineProperty(exports$1, "MAX", {
      enumerable: true,
      get: function get() {
        return _max.default;
      }
    });
    Object.defineProperty(exports$1, "NIL", {
      enumerable: true,
      get: function get() {
        return _nil.default;
      }
    });
    Object.defineProperty(exports$1, "parse", {
      enumerable: true,
      get: function get() {
        return _parse.default;
      }
    });
    Object.defineProperty(exports$1, "stringify", {
      enumerable: true,
      get: function get() {
        return _stringify.default;
      }
    });
    Object.defineProperty(exports$1, "v1", {
      enumerable: true,
      get: function get() {
        return _v.default;
      }
    });
    Object.defineProperty(exports$1, "v1ToV6", {
      enumerable: true,
      get: function get() {
        return _v1ToV.default;
      }
    });
    Object.defineProperty(exports$1, "v3", {
      enumerable: true,
      get: function get() {
        return _v2.default;
      }
    });
    Object.defineProperty(exports$1, "v4", {
      enumerable: true,
      get: function get() {
        return _v3.default;
      }
    });
    Object.defineProperty(exports$1, "v5", {
      enumerable: true,
      get: function get() {
        return _v4.default;
      }
    });
    Object.defineProperty(exports$1, "v6", {
      enumerable: true,
      get: function get() {
        return _v5.default;
      }
    });
    Object.defineProperty(exports$1, "v6ToV1", {
      enumerable: true,
      get: function get() {
        return _v6ToV.default;
      }
    });
    Object.defineProperty(exports$1, "v7", {
      enumerable: true,
      get: function get() {
        return _v6.default;
      }
    });
    Object.defineProperty(exports$1, "validate", {
      enumerable: true,
      get: function get() {
        return _validate.default;
      }
    });
    Object.defineProperty(exports$1, "version", {
      enumerable: true,
      get: function get() {
        return _version.default;
      }
    });
    var _max = _interopRequireDefault(/* @__PURE__ */ requireMax());
    var _nil = _interopRequireDefault(/* @__PURE__ */ requireNil());
    var _parse = _interopRequireDefault(/* @__PURE__ */ requireParse());
    var _stringify = _interopRequireDefault(/* @__PURE__ */ requireStringify());
    var _v = _interopRequireDefault(/* @__PURE__ */ requireV1());
    var _v1ToV = _interopRequireDefault(/* @__PURE__ */ requireV1ToV6());
    var _v2 = _interopRequireDefault(/* @__PURE__ */ requireV3());
    var _v3 = _interopRequireDefault(/* @__PURE__ */ requireV4());
    var _v4 = _interopRequireDefault(/* @__PURE__ */ requireV5());
    var _v5 = _interopRequireDefault(/* @__PURE__ */ requireV6());
    var _v6ToV = _interopRequireDefault(/* @__PURE__ */ requireV6ToV1());
    var _v6 = _interopRequireDefault(/* @__PURE__ */ requireV7());
    var _validate = _interopRequireDefault(/* @__PURE__ */ requireValidate());
    var _version = _interopRequireDefault(/* @__PURE__ */ requireVersion());
    function _interopRequireDefault(e) {
      return e && e.__esModule ? e : { default: e };
    }
  })(commonjsBrowser);
  return commonjsBrowser;
}
var hasRequiredRequest;
function requireRequest() {
  if (hasRequiredRequest) return request;
  hasRequiredRequest = 1;
  (function(exports$1) {
    var __awaiter = request && request.__awaiter || function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.SvixRequest = exports$1.HttpMethod = exports$1.LIB_VERSION = void 0;
    const util_1 = requireUtil();
    const uuid_1 = /* @__PURE__ */ requireCommonjsBrowser();
    exports$1.LIB_VERSION = "1.88.0";
    const USER_AGENT = `svix-libs/${exports$1.LIB_VERSION}/javascript`;
    (function(HttpMethod) {
      HttpMethod["GET"] = "GET";
      HttpMethod["HEAD"] = "HEAD";
      HttpMethod["POST"] = "POST";
      HttpMethod["PUT"] = "PUT";
      HttpMethod["DELETE"] = "DELETE";
      HttpMethod["CONNECT"] = "CONNECT";
      HttpMethod["OPTIONS"] = "OPTIONS";
      HttpMethod["TRACE"] = "TRACE";
      HttpMethod["PATCH"] = "PATCH";
    })(exports$1.HttpMethod || (exports$1.HttpMethod = {}));
    class SvixRequest {
      constructor(method, path) {
        this.method = method;
        this.path = path;
        this.queryParams = {};
        this.headerParams = {};
      }
      setPathParam(name, value) {
        const newPath = this.path.replace(`{${name}}`, encodeURIComponent(value));
        if (this.path === newPath) {
          throw new Error(`path parameter ${name} not found`);
        }
        this.path = newPath;
      }
      setQueryParams(params) {
        for (const [name, value] of Object.entries(params)) {
          this.setQueryParam(name, value);
        }
      }
      setQueryParam(name, value) {
        if (value === void 0 || value === null) {
          return;
        }
        if (typeof value === "string") {
          this.queryParams[name] = value;
        } else if (typeof value === "boolean" || typeof value === "number") {
          this.queryParams[name] = value.toString();
        } else if (value instanceof Date) {
          this.queryParams[name] = value.toISOString();
        } else if (Array.isArray(value)) {
          if (value.length > 0) {
            this.queryParams[name] = value.join(",");
          }
        } else {
          throw new Error(`query parameter ${name} has unsupported type`);
        }
      }
      setHeaderParam(name, value) {
        if (value === void 0) {
          return;
        }
        this.headerParams[name] = value;
      }
      setBody(value) {
        this.body = JSON.stringify(value);
      }
      send(ctx, parseResponseBody) {
        return __awaiter(this, void 0, void 0, function* () {
          const response = yield this.sendInner(ctx);
          if (response.status === 204) {
            return null;
          }
          const responseBody = yield response.text();
          return parseResponseBody(JSON.parse(responseBody));
        });
      }
      sendNoResponseBody(ctx) {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.sendInner(ctx);
        });
      }
      sendInner(ctx) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
          const url = new URL(ctx.baseUrl + this.path);
          for (const [name, value] of Object.entries(this.queryParams)) {
            url.searchParams.set(name, value);
          }
          if (this.headerParams["idempotency-key"] === void 0 && this.method.toUpperCase() === "POST") {
            this.headerParams["idempotency-key"] = `auto_${(0, uuid_1.v4)()}`;
          }
          const randomId = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
          if (this.body != null) {
            this.headerParams["content-type"] = "application/json";
          }
          const isCredentialsSupported = "credentials" in Request.prototype;
          const response = yield sendWithRetry(url, {
            method: this.method.toString(),
            body: this.body,
            headers: Object.assign({ accept: "application/json, */*;q=0.8", authorization: `Bearer ${ctx.token}`, "user-agent": USER_AGENT, "svix-req-id": randomId.toString() }, this.headerParams),
            credentials: isCredentialsSupported ? "same-origin" : void 0,
            signal: ctx.timeout !== void 0 ? AbortSignal.timeout(ctx.timeout) : void 0
          }, ctx.retryScheduleInMs, (_a = ctx.retryScheduleInMs) === null || _a === void 0 ? void 0 : _a[0], ((_b = ctx.retryScheduleInMs) === null || _b === void 0 ? void 0 : _b.length) || ctx.numRetries, ctx.fetch);
          return filterResponseForErrors(response);
        });
      }
    }
    exports$1.SvixRequest = SvixRequest;
    function filterResponseForErrors(response) {
      return __awaiter(this, void 0, void 0, function* () {
        if (response.status < 300) {
          return response;
        }
        const responseBody = yield response.text();
        if (response.status === 422) {
          throw new util_1.ApiException(response.status, JSON.parse(responseBody), response.headers);
        }
        if (response.status >= 400 && response.status <= 499) {
          throw new util_1.ApiException(response.status, JSON.parse(responseBody), response.headers);
        }
        throw new util_1.ApiException(response.status, responseBody, response.headers);
      });
    }
    function sendWithRetry(url, init, retryScheduleInMs, nextInterval = 50, triesLeft = 2, fetchImpl = fetch, retryCount = 1) {
      return __awaiter(this, void 0, void 0, function* () {
        const sleep = (interval) => new Promise((resolve) => setTimeout(resolve, interval));
        try {
          const response = yield fetchImpl(url, init);
          if (triesLeft <= 0 || response.status < 500) {
            return response;
          }
        } catch (e) {
          if (triesLeft <= 0) {
            throw e;
          }
        }
        yield sleep(nextInterval);
        init.headers["svix-retry-count"] = retryCount.toString();
        nextInterval = (retryScheduleInMs === null || retryScheduleInMs === void 0 ? void 0 : retryScheduleInMs[retryCount]) || nextInterval * 2;
        return yield sendWithRetry(url, init, retryScheduleInMs, nextInterval, --triesLeft, fetchImpl, ++retryCount);
      });
    }
  })(request);
  return request;
}
var hasRequiredApplication;
function requireApplication() {
  if (hasRequiredApplication) return application;
  hasRequiredApplication = 1;
  Object.defineProperty(application, "__esModule", { value: true });
  application.Application = void 0;
  const applicationIn_1 = requireApplicationIn();
  const applicationOut_1 = requireApplicationOut();
  const applicationPatch_1 = requireApplicationPatch();
  const listResponseApplicationOut_1 = requireListResponseApplicationOut();
  const request_1 = requireRequest();
  class Application {
    constructor(requestCtx) {
      this.requestCtx = requestCtx;
    }
    list(options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app");
      request2.setQueryParams({
        exclude_apps_with_no_endpoints: options === null || options === void 0 ? void 0 : options.excludeAppsWithNoEndpoints,
        exclude_apps_with_disabled_endpoints: options === null || options === void 0 ? void 0 : options.excludeAppsWithDisabledEndpoints,
        limit: options === null || options === void 0 ? void 0 : options.limit,
        iterator: options === null || options === void 0 ? void 0 : options.iterator,
        order: options === null || options === void 0 ? void 0 : options.order
      });
      return request2.send(this.requestCtx, listResponseApplicationOut_1.ListResponseApplicationOutSerializer._fromJsonObject);
    }
    create(applicationIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app");
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(applicationIn_1.ApplicationInSerializer._toJsonObject(applicationIn2));
      return request2.send(this.requestCtx, applicationOut_1.ApplicationOutSerializer._fromJsonObject);
    }
    getOrCreate(applicationIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app");
      request2.setQueryParam("get_if_exists", true);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(applicationIn_1.ApplicationInSerializer._toJsonObject(applicationIn2));
      return request2.send(this.requestCtx, applicationOut_1.ApplicationOutSerializer._fromJsonObject);
    }
    get(appId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}");
      request2.setPathParam("app_id", appId);
      return request2.send(this.requestCtx, applicationOut_1.ApplicationOutSerializer._fromJsonObject);
    }
    update(appId, applicationIn2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/app/{app_id}");
      request2.setPathParam("app_id", appId);
      request2.setBody(applicationIn_1.ApplicationInSerializer._toJsonObject(applicationIn2));
      return request2.send(this.requestCtx, applicationOut_1.ApplicationOutSerializer._fromJsonObject);
    }
    delete(appId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/app/{app_id}");
      request2.setPathParam("app_id", appId);
      return request2.sendNoResponseBody(this.requestCtx);
    }
    patch(appId, applicationPatch2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/app/{app_id}");
      request2.setPathParam("app_id", appId);
      request2.setBody(applicationPatch_1.ApplicationPatchSerializer._toJsonObject(applicationPatch2));
      return request2.send(this.requestCtx, applicationOut_1.ApplicationOutSerializer._fromJsonObject);
    }
  }
  application.Application = Application;
  return application;
}
var authentication = {};
var apiTokenOut = {};
var hasRequiredApiTokenOut;
function requireApiTokenOut() {
  if (hasRequiredApiTokenOut) return apiTokenOut;
  hasRequiredApiTokenOut = 1;
  Object.defineProperty(apiTokenOut, "__esModule", { value: true });
  apiTokenOut.ApiTokenOutSerializer = void 0;
  apiTokenOut.ApiTokenOutSerializer = {
    _fromJsonObject(object) {
      return {
        createdAt: new Date(object["createdAt"]),
        expiresAt: object["expiresAt"] ? new Date(object["expiresAt"]) : null,
        id: object["id"],
        name: object["name"],
        scopes: object["scopes"],
        token: object["token"]
      };
    },
    _toJsonObject(self) {
      return {
        createdAt: self.createdAt,
        expiresAt: self.expiresAt,
        id: self.id,
        name: self.name,
        scopes: self.scopes,
        token: self.token
      };
    }
  };
  return apiTokenOut;
}
var appPortalAccessIn = {};
var appPortalCapability = {};
var hasRequiredAppPortalCapability;
function requireAppPortalCapability() {
  if (hasRequiredAppPortalCapability) return appPortalCapability;
  hasRequiredAppPortalCapability = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.AppPortalCapabilitySerializer = exports$1.AppPortalCapability = void 0;
    (function(AppPortalCapability) {
      AppPortalCapability["ViewBase"] = "ViewBase";
      AppPortalCapability["ViewEndpointSecret"] = "ViewEndpointSecret";
      AppPortalCapability["ManageEndpointSecret"] = "ManageEndpointSecret";
      AppPortalCapability["ManageTransformations"] = "ManageTransformations";
      AppPortalCapability["CreateAttempts"] = "CreateAttempts";
      AppPortalCapability["ManageEndpoint"] = "ManageEndpoint";
    })(exports$1.AppPortalCapability || (exports$1.AppPortalCapability = {}));
    exports$1.AppPortalCapabilitySerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  })(appPortalCapability);
  return appPortalCapability;
}
var hasRequiredAppPortalAccessIn;
function requireAppPortalAccessIn() {
  if (hasRequiredAppPortalAccessIn) return appPortalAccessIn;
  hasRequiredAppPortalAccessIn = 1;
  Object.defineProperty(appPortalAccessIn, "__esModule", { value: true });
  appPortalAccessIn.AppPortalAccessInSerializer = void 0;
  const appPortalCapability_1 = requireAppPortalCapability();
  const applicationIn_1 = requireApplicationIn();
  appPortalAccessIn.AppPortalAccessInSerializer = {
    _fromJsonObject(object) {
      var _a;
      return {
        application: object["application"] != null ? applicationIn_1.ApplicationInSerializer._fromJsonObject(object["application"]) : void 0,
        capabilities: (_a = object["capabilities"]) === null || _a === void 0 ? void 0 : _a.map((item) => appPortalCapability_1.AppPortalCapabilitySerializer._fromJsonObject(item)),
        expiry: object["expiry"],
        featureFlags: object["featureFlags"],
        readOnly: object["readOnly"],
        sessionId: object["sessionId"]
      };
    },
    _toJsonObject(self) {
      var _a;
      return {
        application: self.application != null ? applicationIn_1.ApplicationInSerializer._toJsonObject(self.application) : void 0,
        capabilities: (_a = self.capabilities) === null || _a === void 0 ? void 0 : _a.map((item) => appPortalCapability_1.AppPortalCapabilitySerializer._toJsonObject(item)),
        expiry: self.expiry,
        featureFlags: self.featureFlags,
        readOnly: self.readOnly,
        sessionId: self.sessionId
      };
    }
  };
  return appPortalAccessIn;
}
var appPortalAccessOut = {};
var hasRequiredAppPortalAccessOut;
function requireAppPortalAccessOut() {
  if (hasRequiredAppPortalAccessOut) return appPortalAccessOut;
  hasRequiredAppPortalAccessOut = 1;
  Object.defineProperty(appPortalAccessOut, "__esModule", { value: true });
  appPortalAccessOut.AppPortalAccessOutSerializer = void 0;
  appPortalAccessOut.AppPortalAccessOutSerializer = {
    _fromJsonObject(object) {
      return {
        token: object["token"],
        url: object["url"]
      };
    },
    _toJsonObject(self) {
      return {
        token: self.token,
        url: self.url
      };
    }
  };
  return appPortalAccessOut;
}
var applicationTokenExpireIn = {};
var hasRequiredApplicationTokenExpireIn;
function requireApplicationTokenExpireIn() {
  if (hasRequiredApplicationTokenExpireIn) return applicationTokenExpireIn;
  hasRequiredApplicationTokenExpireIn = 1;
  Object.defineProperty(applicationTokenExpireIn, "__esModule", { value: true });
  applicationTokenExpireIn.ApplicationTokenExpireInSerializer = void 0;
  applicationTokenExpireIn.ApplicationTokenExpireInSerializer = {
    _fromJsonObject(object) {
      return {
        expiry: object["expiry"],
        sessionIds: object["sessionIds"]
      };
    },
    _toJsonObject(self) {
      return {
        expiry: self.expiry,
        sessionIds: self.sessionIds
      };
    }
  };
  return applicationTokenExpireIn;
}
var rotatePollerTokenIn = {};
var hasRequiredRotatePollerTokenIn;
function requireRotatePollerTokenIn() {
  if (hasRequiredRotatePollerTokenIn) return rotatePollerTokenIn;
  hasRequiredRotatePollerTokenIn = 1;
  Object.defineProperty(rotatePollerTokenIn, "__esModule", { value: true });
  rotatePollerTokenIn.RotatePollerTokenInSerializer = void 0;
  rotatePollerTokenIn.RotatePollerTokenInSerializer = {
    _fromJsonObject(object) {
      return {
        expiry: object["expiry"],
        oldTokenExpiry: object["oldTokenExpiry"]
      };
    },
    _toJsonObject(self) {
      return {
        expiry: self.expiry,
        oldTokenExpiry: self.oldTokenExpiry
      };
    }
  };
  return rotatePollerTokenIn;
}
var streamPortalAccessIn = {};
var hasRequiredStreamPortalAccessIn;
function requireStreamPortalAccessIn() {
  if (hasRequiredStreamPortalAccessIn) return streamPortalAccessIn;
  hasRequiredStreamPortalAccessIn = 1;
  Object.defineProperty(streamPortalAccessIn, "__esModule", { value: true });
  streamPortalAccessIn.StreamPortalAccessInSerializer = void 0;
  streamPortalAccessIn.StreamPortalAccessInSerializer = {
    _fromJsonObject(object) {
      return {
        expiry: object["expiry"],
        featureFlags: object["featureFlags"],
        sessionId: object["sessionId"]
      };
    },
    _toJsonObject(self) {
      return {
        expiry: self.expiry,
        featureFlags: self.featureFlags,
        sessionId: self.sessionId
      };
    }
  };
  return streamPortalAccessIn;
}
var dashboardAccessOut = {};
var hasRequiredDashboardAccessOut;
function requireDashboardAccessOut() {
  if (hasRequiredDashboardAccessOut) return dashboardAccessOut;
  hasRequiredDashboardAccessOut = 1;
  Object.defineProperty(dashboardAccessOut, "__esModule", { value: true });
  dashboardAccessOut.DashboardAccessOutSerializer = void 0;
  dashboardAccessOut.DashboardAccessOutSerializer = {
    _fromJsonObject(object) {
      return {
        token: object["token"],
        url: object["url"]
      };
    },
    _toJsonObject(self) {
      return {
        token: self.token,
        url: self.url
      };
    }
  };
  return dashboardAccessOut;
}
var hasRequiredAuthentication;
function requireAuthentication() {
  if (hasRequiredAuthentication) return authentication;
  hasRequiredAuthentication = 1;
  Object.defineProperty(authentication, "__esModule", { value: true });
  authentication.Authentication = void 0;
  const apiTokenOut_1 = requireApiTokenOut();
  const appPortalAccessIn_1 = requireAppPortalAccessIn();
  const appPortalAccessOut_1 = requireAppPortalAccessOut();
  const applicationTokenExpireIn_1 = requireApplicationTokenExpireIn();
  const rotatePollerTokenIn_1 = requireRotatePollerTokenIn();
  const streamPortalAccessIn_1 = requireStreamPortalAccessIn();
  const dashboardAccessOut_1 = requireDashboardAccessOut();
  const request_1 = requireRequest();
  class Authentication {
    constructor(requestCtx) {
      this.requestCtx = requestCtx;
    }
    appPortalAccess(appId, appPortalAccessIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/app-portal-access/{app_id}");
      request2.setPathParam("app_id", appId);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(appPortalAccessIn_1.AppPortalAccessInSerializer._toJsonObject(appPortalAccessIn2));
      return request2.send(this.requestCtx, appPortalAccessOut_1.AppPortalAccessOutSerializer._fromJsonObject);
    }
    expireAll(appId, applicationTokenExpireIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/app/{app_id}/expire-all");
      request2.setPathParam("app_id", appId);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(applicationTokenExpireIn_1.ApplicationTokenExpireInSerializer._toJsonObject(applicationTokenExpireIn2));
      return request2.sendNoResponseBody(this.requestCtx);
    }
    dashboardAccess(appId, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/dashboard-access/{app_id}");
      request2.setPathParam("app_id", appId);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      return request2.send(this.requestCtx, dashboardAccessOut_1.DashboardAccessOutSerializer._fromJsonObject);
    }
    logout(options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/logout");
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      return request2.sendNoResponseBody(this.requestCtx);
    }
    streamPortalAccess(streamId, streamPortalAccessIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/stream-portal-access/{stream_id}");
      request2.setPathParam("stream_id", streamId);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(streamPortalAccessIn_1.StreamPortalAccessInSerializer._toJsonObject(streamPortalAccessIn2));
      return request2.send(this.requestCtx, appPortalAccessOut_1.AppPortalAccessOutSerializer._fromJsonObject);
    }
    getStreamPollerToken(streamId, sinkId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/auth/stream/{stream_id}/sink/{sink_id}/poller/token");
      request2.setPathParam("stream_id", streamId);
      request2.setPathParam("sink_id", sinkId);
      return request2.send(this.requestCtx, apiTokenOut_1.ApiTokenOutSerializer._fromJsonObject);
    }
    rotateStreamPollerToken(streamId, sinkId, rotatePollerTokenIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/auth/stream/{stream_id}/sink/{sink_id}/poller/token/rotate");
      request2.setPathParam("stream_id", streamId);
      request2.setPathParam("sink_id", sinkId);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(rotatePollerTokenIn_1.RotatePollerTokenInSerializer._toJsonObject(rotatePollerTokenIn2));
      return request2.send(this.requestCtx, apiTokenOut_1.ApiTokenOutSerializer._fromJsonObject);
    }
  }
  authentication.Authentication = Authentication;
  return authentication;
}
var backgroundTask = {};
var backgroundTaskOut = {};
var backgroundTaskStatus = {};
var hasRequiredBackgroundTaskStatus;
function requireBackgroundTaskStatus() {
  if (hasRequiredBackgroundTaskStatus) return backgroundTaskStatus;
  hasRequiredBackgroundTaskStatus = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.BackgroundTaskStatusSerializer = exports$1.BackgroundTaskStatus = void 0;
    (function(BackgroundTaskStatus) {
      BackgroundTaskStatus["Running"] = "running";
      BackgroundTaskStatus["Finished"] = "finished";
      BackgroundTaskStatus["Failed"] = "failed";
    })(exports$1.BackgroundTaskStatus || (exports$1.BackgroundTaskStatus = {}));
    exports$1.BackgroundTaskStatusSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  })(backgroundTaskStatus);
  return backgroundTaskStatus;
}
var backgroundTaskType = {};
var hasRequiredBackgroundTaskType;
function requireBackgroundTaskType() {
  if (hasRequiredBackgroundTaskType) return backgroundTaskType;
  hasRequiredBackgroundTaskType = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.BackgroundTaskTypeSerializer = exports$1.BackgroundTaskType = void 0;
    (function(BackgroundTaskType) {
      BackgroundTaskType["EndpointReplay"] = "endpoint.replay";
      BackgroundTaskType["EndpointRecover"] = "endpoint.recover";
      BackgroundTaskType["ApplicationStats"] = "application.stats";
      BackgroundTaskType["MessageBroadcast"] = "message.broadcast";
      BackgroundTaskType["SdkGenerate"] = "sdk.generate";
      BackgroundTaskType["EventTypeAggregate"] = "event-type.aggregate";
      BackgroundTaskType["ApplicationPurgeContent"] = "application.purge_content";
      BackgroundTaskType["EndpointBulkReplay"] = "endpoint.bulk_replay";
    })(exports$1.BackgroundTaskType || (exports$1.BackgroundTaskType = {}));
    exports$1.BackgroundTaskTypeSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  })(backgroundTaskType);
  return backgroundTaskType;
}
var hasRequiredBackgroundTaskOut;
function requireBackgroundTaskOut() {
  if (hasRequiredBackgroundTaskOut) return backgroundTaskOut;
  hasRequiredBackgroundTaskOut = 1;
  Object.defineProperty(backgroundTaskOut, "__esModule", { value: true });
  backgroundTaskOut.BackgroundTaskOutSerializer = void 0;
  const backgroundTaskStatus_1 = requireBackgroundTaskStatus();
  const backgroundTaskType_1 = requireBackgroundTaskType();
  backgroundTaskOut.BackgroundTaskOutSerializer = {
    _fromJsonObject(object) {
      return {
        data: object["data"],
        id: object["id"],
        status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
        task: backgroundTaskType_1.BackgroundTaskTypeSerializer._fromJsonObject(object["task"])
      };
    },
    _toJsonObject(self) {
      return {
        data: self.data,
        id: self.id,
        status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._toJsonObject(self.status),
        task: backgroundTaskType_1.BackgroundTaskTypeSerializer._toJsonObject(self.task)
      };
    }
  };
  return backgroundTaskOut;
}
var listResponseBackgroundTaskOut = {};
var hasRequiredListResponseBackgroundTaskOut;
function requireListResponseBackgroundTaskOut() {
  if (hasRequiredListResponseBackgroundTaskOut) return listResponseBackgroundTaskOut;
  hasRequiredListResponseBackgroundTaskOut = 1;
  Object.defineProperty(listResponseBackgroundTaskOut, "__esModule", { value: true });
  listResponseBackgroundTaskOut.ListResponseBackgroundTaskOutSerializer = void 0;
  const backgroundTaskOut_1 = requireBackgroundTaskOut();
  listResponseBackgroundTaskOut.ListResponseBackgroundTaskOutSerializer = {
    _fromJsonObject(object) {
      return {
        data: object["data"].map((item) => backgroundTaskOut_1.BackgroundTaskOutSerializer._fromJsonObject(item)),
        done: object["done"],
        iterator: object["iterator"],
        prevIterator: object["prevIterator"]
      };
    },
    _toJsonObject(self) {
      return {
        data: self.data.map((item) => backgroundTaskOut_1.BackgroundTaskOutSerializer._toJsonObject(item)),
        done: self.done,
        iterator: self.iterator,
        prevIterator: self.prevIterator
      };
    }
  };
  return listResponseBackgroundTaskOut;
}
var hasRequiredBackgroundTask;
function requireBackgroundTask() {
  if (hasRequiredBackgroundTask) return backgroundTask;
  hasRequiredBackgroundTask = 1;
  Object.defineProperty(backgroundTask, "__esModule", { value: true });
  backgroundTask.BackgroundTask = void 0;
  const backgroundTaskOut_1 = requireBackgroundTaskOut();
  const listResponseBackgroundTaskOut_1 = requireListResponseBackgroundTaskOut();
  const request_1 = requireRequest();
  class BackgroundTask {
    constructor(requestCtx) {
      this.requestCtx = requestCtx;
    }
    list(options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/background-task");
      request2.setQueryParams({
        status: options === null || options === void 0 ? void 0 : options.status,
        task: options === null || options === void 0 ? void 0 : options.task,
        limit: options === null || options === void 0 ? void 0 : options.limit,
        iterator: options === null || options === void 0 ? void 0 : options.iterator,
        order: options === null || options === void 0 ? void 0 : options.order
      });
      return request2.send(this.requestCtx, listResponseBackgroundTaskOut_1.ListResponseBackgroundTaskOutSerializer._fromJsonObject);
    }
    listByEndpoint(options) {
      return this.list(options);
    }
    get(taskId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/background-task/{task_id}");
      request2.setPathParam("task_id", taskId);
      return request2.send(this.requestCtx, backgroundTaskOut_1.BackgroundTaskOutSerializer._fromJsonObject);
    }
  }
  backgroundTask.BackgroundTask = BackgroundTask;
  return backgroundTask;
}
var connector = {};
var connectorIn = {};
var connectorKind = {};
var hasRequiredConnectorKind;
function requireConnectorKind() {
  if (hasRequiredConnectorKind) return connectorKind;
  hasRequiredConnectorKind = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.ConnectorKindSerializer = exports$1.ConnectorKind = void 0;
    (function(ConnectorKind) {
      ConnectorKind["Custom"] = "Custom";
      ConnectorKind["AgenticCommerceProtocol"] = "AgenticCommerceProtocol";
      ConnectorKind["CloseCrm"] = "CloseCRM";
      ConnectorKind["CustomerIo"] = "CustomerIO";
      ConnectorKind["Discord"] = "Discord";
      ConnectorKind["Hubspot"] = "Hubspot";
      ConnectorKind["Inngest"] = "Inngest";
      ConnectorKind["Loops"] = "Loops";
      ConnectorKind["Otel"] = "Otel";
      ConnectorKind["Resend"] = "Resend";
      ConnectorKind["Salesforce"] = "Salesforce";
      ConnectorKind["Segment"] = "Segment";
      ConnectorKind["Sendgrid"] = "Sendgrid";
      ConnectorKind["Slack"] = "Slack";
      ConnectorKind["Teams"] = "Teams";
      ConnectorKind["TriggerDev"] = "TriggerDev";
      ConnectorKind["Windmill"] = "Windmill";
      ConnectorKind["Zapier"] = "Zapier";
    })(exports$1.ConnectorKind || (exports$1.ConnectorKind = {}));
    exports$1.ConnectorKindSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  })(connectorKind);
  return connectorKind;
}
var connectorProduct = {};
var hasRequiredConnectorProduct;
function requireConnectorProduct() {
  if (hasRequiredConnectorProduct) return connectorProduct;
  hasRequiredConnectorProduct = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.ConnectorProductSerializer = exports$1.ConnectorProduct = void 0;
    (function(ConnectorProduct) {
      ConnectorProduct["Dispatch"] = "Dispatch";
      ConnectorProduct["Stream"] = "Stream";
    })(exports$1.ConnectorProduct || (exports$1.ConnectorProduct = {}));
    exports$1.ConnectorProductSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  })(connectorProduct);
  return connectorProduct;
}
var hasRequiredConnectorIn;
function requireConnectorIn() {
  if (hasRequiredConnectorIn) return connectorIn;
  hasRequiredConnectorIn = 1;
  Object.defineProperty(connectorIn, "__esModule", { value: true });
  connectorIn.ConnectorInSerializer = void 0;
  const connectorKind_1 = requireConnectorKind();
  const connectorProduct_1 = requireConnectorProduct();
  connectorIn.ConnectorInSerializer = {
    _fromJsonObject(object) {
      return {
        allowedEventTypes: object["allowedEventTypes"],
        description: object["description"],
        featureFlags: object["featureFlags"],
        instructions: object["instructions"],
        kind: object["kind"] != null ? connectorKind_1.ConnectorKindSerializer._fromJsonObject(object["kind"]) : void 0,
        logo: object["logo"],
        name: object["name"],
        productType: object["productType"] != null ? connectorProduct_1.ConnectorProductSerializer._fromJsonObject(object["productType"]) : void 0,
        transformation: object["transformation"],
        uid: object["uid"]
      };
    },
    _toJsonObject(self) {
      return {
        allowedEventTypes: self.allowedEventTypes,
        description: self.description,
        featureFlags: self.featureFlags,
        instructions: self.instructions,
        kind: self.kind != null ? connectorKind_1.ConnectorKindSerializer._toJsonObject(self.kind) : void 0,
        logo: self.logo,
        name: self.name,
        productType: self.productType != null ? connectorProduct_1.ConnectorProductSerializer._toJsonObject(self.productType) : void 0,
        transformation: self.transformation,
        uid: self.uid
      };
    }
  };
  return connectorIn;
}
var connectorOut = {};
var hasRequiredConnectorOut;
function requireConnectorOut() {
  if (hasRequiredConnectorOut) return connectorOut;
  hasRequiredConnectorOut = 1;
  Object.defineProperty(connectorOut, "__esModule", { value: true });
  connectorOut.ConnectorOutSerializer = void 0;
  const connectorKind_1 = requireConnectorKind();
  const connectorProduct_1 = requireConnectorProduct();
  connectorOut.ConnectorOutSerializer = {
    _fromJsonObject(object) {
      return {
        allowedEventTypes: object["allowedEventTypes"],
        createdAt: new Date(object["createdAt"]),
        description: object["description"],
        featureFlags: object["featureFlags"],
        id: object["id"],
        instructions: object["instructions"],
        kind: connectorKind_1.ConnectorKindSerializer._fromJsonObject(object["kind"]),
        logo: object["logo"],
        name: object["name"],
        orgId: object["orgId"],
        productType: connectorProduct_1.ConnectorProductSerializer._fromJsonObject(object["productType"]),
        transformation: object["transformation"],
        transformationUpdatedAt: new Date(object["transformationUpdatedAt"]),
        uid: object["uid"],
        updatedAt: new Date(object["updatedAt"])
      };
    },
    _toJsonObject(self) {
      return {
        allowedEventTypes: self.allowedEventTypes,
        createdAt: self.createdAt,
        description: self.description,
        featureFlags: self.featureFlags,
        id: self.id,
        instructions: self.instructions,
        kind: connectorKind_1.ConnectorKindSerializer._toJsonObject(self.kind),
        logo: self.logo,
        name: self.name,
        orgId: self.orgId,
        productType: connectorProduct_1.ConnectorProductSerializer._toJsonObject(self.productType),
        transformation: self.transformation,
        transformationUpdatedAt: self.transformationUpdatedAt,
        uid: self.uid,
        updatedAt: self.updatedAt
      };
    }
  };
  return connectorOut;
}
var connectorPatch = {};
var hasRequiredConnectorPatch;
function requireConnectorPatch() {
  if (hasRequiredConnectorPatch) return connectorPatch;
  hasRequiredConnectorPatch = 1;
  Object.defineProperty(connectorPatch, "__esModule", { value: true });
  connectorPatch.ConnectorPatchSerializer = void 0;
  const connectorKind_1 = requireConnectorKind();
  connectorPatch.ConnectorPatchSerializer = {
    _fromJsonObject(object) {
      return {
        allowedEventTypes: object["allowedEventTypes"],
        description: object["description"],
        featureFlags: object["featureFlags"],
        instructions: object["instructions"],
        kind: object["kind"] != null ? connectorKind_1.ConnectorKindSerializer._fromJsonObject(object["kind"]) : void 0,
        logo: object["logo"],
        name: object["name"],
        transformation: object["transformation"]
      };
    },
    _toJsonObject(self) {
      return {
        allowedEventTypes: self.allowedEventTypes,
        description: self.description,
        featureFlags: self.featureFlags,
        instructions: self.instructions,
        kind: self.kind != null ? connectorKind_1.ConnectorKindSerializer._toJsonObject(self.kind) : void 0,
        logo: self.logo,
        name: self.name,
        transformation: self.transformation
      };
    }
  };
  return connectorPatch;
}
var connectorUpdate = {};
var hasRequiredConnectorUpdate;
function requireConnectorUpdate() {
  if (hasRequiredConnectorUpdate) return connectorUpdate;
  hasRequiredConnectorUpdate = 1;
  Object.defineProperty(connectorUpdate, "__esModule", { value: true });
  connectorUpdate.ConnectorUpdateSerializer = void 0;
  const connectorKind_1 = requireConnectorKind();
  connectorUpdate.ConnectorUpdateSerializer = {
    _fromJsonObject(object) {
      return {
        allowedEventTypes: object["allowedEventTypes"],
        description: object["description"],
        featureFlags: object["featureFlags"],
        instructions: object["instructions"],
        kind: object["kind"] != null ? connectorKind_1.ConnectorKindSerializer._fromJsonObject(object["kind"]) : void 0,
        logo: object["logo"],
        name: object["name"],
        transformation: object["transformation"]
      };
    },
    _toJsonObject(self) {
      return {
        allowedEventTypes: self.allowedEventTypes,
        description: self.description,
        featureFlags: self.featureFlags,
        instructions: self.instructions,
        kind: self.kind != null ? connectorKind_1.ConnectorKindSerializer._toJsonObject(self.kind) : void 0,
        logo: self.logo,
        name: self.name,
        transformation: self.transformation
      };
    }
  };
  return connectorUpdate;
}
var listResponseConnectorOut = {};
var hasRequiredListResponseConnectorOut;
function requireListResponseConnectorOut() {
  if (hasRequiredListResponseConnectorOut) return listResponseConnectorOut;
  hasRequiredListResponseConnectorOut = 1;
  Object.defineProperty(listResponseConnectorOut, "__esModule", { value: true });
  listResponseConnectorOut.ListResponseConnectorOutSerializer = void 0;
  const connectorOut_1 = requireConnectorOut();
  listResponseConnectorOut.ListResponseConnectorOutSerializer = {
    _fromJsonObject(object) {
      return {
        data: object["data"].map((item) => connectorOut_1.ConnectorOutSerializer._fromJsonObject(item)),
        done: object["done"],
        iterator: object["iterator"],
        prevIterator: object["prevIterator"]
      };
    },
    _toJsonObject(self) {
      return {
        data: self.data.map((item) => connectorOut_1.ConnectorOutSerializer._toJsonObject(item)),
        done: self.done,
        iterator: self.iterator,
        prevIterator: self.prevIterator
      };
    }
  };
  return listResponseConnectorOut;
}
var hasRequiredConnector;
function requireConnector() {
  if (hasRequiredConnector) return connector;
  hasRequiredConnector = 1;
  Object.defineProperty(connector, "__esModule", { value: true });
  connector.Connector = void 0;
  const connectorIn_1 = requireConnectorIn();
  const connectorOut_1 = requireConnectorOut();
  const connectorPatch_1 = requireConnectorPatch();
  const connectorUpdate_1 = requireConnectorUpdate();
  const listResponseConnectorOut_1 = requireListResponseConnectorOut();
  const request_1 = requireRequest();
  class Connector {
    constructor(requestCtx) {
      this.requestCtx = requestCtx;
    }
    list(options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/connector");
      request2.setQueryParams({
        limit: options === null || options === void 0 ? void 0 : options.limit,
        iterator: options === null || options === void 0 ? void 0 : options.iterator,
        order: options === null || options === void 0 ? void 0 : options.order,
        product_type: options === null || options === void 0 ? void 0 : options.productType
      });
      return request2.send(this.requestCtx, listResponseConnectorOut_1.ListResponseConnectorOutSerializer._fromJsonObject);
    }
    create(connectorIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/connector");
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(connectorIn_1.ConnectorInSerializer._toJsonObject(connectorIn2));
      return request2.send(this.requestCtx, connectorOut_1.ConnectorOutSerializer._fromJsonObject);
    }
    get(connectorId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/connector/{connector_id}");
      request2.setPathParam("connector_id", connectorId);
      return request2.send(this.requestCtx, connectorOut_1.ConnectorOutSerializer._fromJsonObject);
    }
    update(connectorId, connectorUpdate2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/connector/{connector_id}");
      request2.setPathParam("connector_id", connectorId);
      request2.setBody(connectorUpdate_1.ConnectorUpdateSerializer._toJsonObject(connectorUpdate2));
      return request2.send(this.requestCtx, connectorOut_1.ConnectorOutSerializer._fromJsonObject);
    }
    delete(connectorId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/connector/{connector_id}");
      request2.setPathParam("connector_id", connectorId);
      return request2.sendNoResponseBody(this.requestCtx);
    }
    patch(connectorId, connectorPatch2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/connector/{connector_id}");
      request2.setPathParam("connector_id", connectorId);
      request2.setBody(connectorPatch_1.ConnectorPatchSerializer._toJsonObject(connectorPatch2));
      return request2.send(this.requestCtx, connectorOut_1.ConnectorOutSerializer._fromJsonObject);
    }
  }
  connector.Connector = Connector;
  return connector;
}
var endpoint = {};
var endpointHeadersIn = {};
var hasRequiredEndpointHeadersIn;
function requireEndpointHeadersIn() {
  if (hasRequiredEndpointHeadersIn) return endpointHeadersIn;
  hasRequiredEndpointHeadersIn = 1;
  Object.defineProperty(endpointHeadersIn, "__esModule", { value: true });
  endpointHeadersIn.EndpointHeadersInSerializer = void 0;
  endpointHeadersIn.EndpointHeadersInSerializer = {
    _fromJsonObject(object) {
      return {
        headers: object["headers"]
      };
    },
    _toJsonObject(self) {
      return {
        headers: self.headers
      };
    }
  };
  return endpointHeadersIn;
}
var endpointHeadersOut = {};
var hasRequiredEndpointHeadersOut;
function requireEndpointHeadersOut() {
  if (hasRequiredEndpointHeadersOut) return endpointHeadersOut;
  hasRequiredEndpointHeadersOut = 1;
  Object.defineProperty(endpointHeadersOut, "__esModule", { value: true });
  endpointHeadersOut.EndpointHeadersOutSerializer = void 0;
  endpointHeadersOut.EndpointHeadersOutSerializer = {
    _fromJsonObject(object) {
      return {
        headers: object["headers"],
        sensitive: object["sensitive"]
      };
    },
    _toJsonObject(self) {
      return {
        headers: self.headers,
        sensitive: self.sensitive
      };
    }
  };
  return endpointHeadersOut;
}
var endpointHeadersPatchIn = {};
var hasRequiredEndpointHeadersPatchIn;
function requireEndpointHeadersPatchIn() {
  if (hasRequiredEndpointHeadersPatchIn) return endpointHeadersPatchIn;
  hasRequiredEndpointHeadersPatchIn = 1;
  Object.defineProperty(endpointHeadersPatchIn, "__esModule", { value: true });
  endpointHeadersPatchIn.EndpointHeadersPatchInSerializer = void 0;
  endpointHeadersPatchIn.EndpointHeadersPatchInSerializer = {
    _fromJsonObject(object) {
      return {
        deleteHeaders: object["deleteHeaders"],
        headers: object["headers"]
      };
    },
    _toJsonObject(self) {
      return {
        deleteHeaders: self.deleteHeaders,
        headers: self.headers
      };
    }
  };
  return endpointHeadersPatchIn;
}
var endpointIn = {};
var hasRequiredEndpointIn;
function requireEndpointIn() {
  if (hasRequiredEndpointIn) return endpointIn;
  hasRequiredEndpointIn = 1;
  Object.defineProperty(endpointIn, "__esModule", { value: true });
  endpointIn.EndpointInSerializer = void 0;
  endpointIn.EndpointInSerializer = {
    _fromJsonObject(object) {
      return {
        channels: object["channels"],
        description: object["description"],
        disabled: object["disabled"],
        filterTypes: object["filterTypes"],
        headers: object["headers"],
        metadata: object["metadata"],
        rateLimit: object["rateLimit"],
        secret: object["secret"],
        uid: object["uid"],
        url: object["url"],
        version: object["version"]
      };
    },
    _toJsonObject(self) {
      return {
        channels: self.channels,
        description: self.description,
        disabled: self.disabled,
        filterTypes: self.filterTypes,
        headers: self.headers,
        metadata: self.metadata,
        rateLimit: self.rateLimit,
        secret: self.secret,
        uid: self.uid,
        url: self.url,
        version: self.version
      };
    }
  };
  return endpointIn;
}
var endpointOut = {};
var hasRequiredEndpointOut;
function requireEndpointOut() {
  if (hasRequiredEndpointOut) return endpointOut;
  hasRequiredEndpointOut = 1;
  Object.defineProperty(endpointOut, "__esModule", { value: true });
  endpointOut.EndpointOutSerializer = void 0;
  endpointOut.EndpointOutSerializer = {
    _fromJsonObject(object) {
      return {
        channels: object["channels"],
        createdAt: new Date(object["createdAt"]),
        description: object["description"],
        disabled: object["disabled"],
        filterTypes: object["filterTypes"],
        id: object["id"],
        metadata: object["metadata"],
        rateLimit: object["rateLimit"],
        uid: object["uid"],
        updatedAt: new Date(object["updatedAt"]),
        url: object["url"],
        version: object["version"]
      };
    },
    _toJsonObject(self) {
      return {
        channels: self.channels,
        createdAt: self.createdAt,
        description: self.description,
        disabled: self.disabled,
        filterTypes: self.filterTypes,
        id: self.id,
        metadata: self.metadata,
        rateLimit: self.rateLimit,
        uid: self.uid,
        updatedAt: self.updatedAt,
        url: self.url,
        version: self.version
      };
    }
  };
  return endpointOut;
}
var endpointPatch = {};
var hasRequiredEndpointPatch;
function requireEndpointPatch() {
  if (hasRequiredEndpointPatch) return endpointPatch;
  hasRequiredEndpointPatch = 1;
  Object.defineProperty(endpointPatch, "__esModule", { value: true });
  endpointPatch.EndpointPatchSerializer = void 0;
  endpointPatch.EndpointPatchSerializer = {
    _fromJsonObject(object) {
      return {
        channels: object["channels"],
        description: object["description"],
        disabled: object["disabled"],
        filterTypes: object["filterTypes"],
        metadata: object["metadata"],
        rateLimit: object["rateLimit"],
        secret: object["secret"],
        uid: object["uid"],
        url: object["url"],
        version: object["version"]
      };
    },
    _toJsonObject(self) {
      return {
        channels: self.channels,
        description: self.description,
        disabled: self.disabled,
        filterTypes: self.filterTypes,
        metadata: self.metadata,
        rateLimit: self.rateLimit,
        secret: self.secret,
        uid: self.uid,
        url: self.url,
        version: self.version
      };
    }
  };
  return endpointPatch;
}
var endpointSecretOut = {};
var hasRequiredEndpointSecretOut;
function requireEndpointSecretOut() {
  if (hasRequiredEndpointSecretOut) return endpointSecretOut;
  hasRequiredEndpointSecretOut = 1;
  Object.defineProperty(endpointSecretOut, "__esModule", { value: true });
  endpointSecretOut.EndpointSecretOutSerializer = void 0;
  endpointSecretOut.EndpointSecretOutSerializer = {
    _fromJsonObject(object) {
      return {
        key: object["key"]
      };
    },
    _toJsonObject(self) {
      return {
        key: self.key
      };
    }
  };
  return endpointSecretOut;
}
var endpointSecretRotateIn = {};
var hasRequiredEndpointSecretRotateIn;
function requireEndpointSecretRotateIn() {
  if (hasRequiredEndpointSecretRotateIn) return endpointSecretRotateIn;
  hasRequiredEndpointSecretRotateIn = 1;
  Object.defineProperty(endpointSecretRotateIn, "__esModule", { value: true });
  endpointSecretRotateIn.EndpointSecretRotateInSerializer = void 0;
  endpointSecretRotateIn.EndpointSecretRotateInSerializer = {
    _fromJsonObject(object) {
      return {
        key: object["key"]
      };
    },
    _toJsonObject(self) {
      return {
        key: self.key
      };
    }
  };
  return endpointSecretRotateIn;
}
var endpointStats = {};
var hasRequiredEndpointStats;
function requireEndpointStats() {
  if (hasRequiredEndpointStats) return endpointStats;
  hasRequiredEndpointStats = 1;
  Object.defineProperty(endpointStats, "__esModule", { value: true });
  endpointStats.EndpointStatsSerializer = void 0;
  endpointStats.EndpointStatsSerializer = {
    _fromJsonObject(object) {
      return {
        fail: object["fail"],
        pending: object["pending"],
        sending: object["sending"],
        success: object["success"]
      };
    },
    _toJsonObject(self) {
      return {
        fail: self.fail,
        pending: self.pending,
        sending: self.sending,
        success: self.success
      };
    }
  };
  return endpointStats;
}
var endpointTransformationIn = {};
var hasRequiredEndpointTransformationIn;
function requireEndpointTransformationIn() {
  if (hasRequiredEndpointTransformationIn) return endpointTransformationIn;
  hasRequiredEndpointTransformationIn = 1;
  Object.defineProperty(endpointTransformationIn, "__esModule", { value: true });
  endpointTransformationIn.EndpointTransformationInSerializer = void 0;
  endpointTransformationIn.EndpointTransformationInSerializer = {
    _fromJsonObject(object) {
      return {
        code: object["code"],
        enabled: object["enabled"]
      };
    },
    _toJsonObject(self) {
      return {
        code: self.code,
        enabled: self.enabled
      };
    }
  };
  return endpointTransformationIn;
}
var endpointTransformationOut = {};
var hasRequiredEndpointTransformationOut;
function requireEndpointTransformationOut() {
  if (hasRequiredEndpointTransformationOut) return endpointTransformationOut;
  hasRequiredEndpointTransformationOut = 1;
  Object.defineProperty(endpointTransformationOut, "__esModule", { value: true });
  endpointTransformationOut.EndpointTransformationOutSerializer = void 0;
  endpointTransformationOut.EndpointTransformationOutSerializer = {
    _fromJsonObject(object) {
      return {
        code: object["code"],
        enabled: object["enabled"],
        updatedAt: object["updatedAt"] ? new Date(object["updatedAt"]) : null
      };
    },
    _toJsonObject(self) {
      return {
        code: self.code,
        enabled: self.enabled,
        updatedAt: self.updatedAt
      };
    }
  };
  return endpointTransformationOut;
}
var endpointTransformationPatch = {};
var hasRequiredEndpointTransformationPatch;
function requireEndpointTransformationPatch() {
  if (hasRequiredEndpointTransformationPatch) return endpointTransformationPatch;
  hasRequiredEndpointTransformationPatch = 1;
  Object.defineProperty(endpointTransformationPatch, "__esModule", { value: true });
  endpointTransformationPatch.EndpointTransformationPatchSerializer = void 0;
  endpointTransformationPatch.EndpointTransformationPatchSerializer = {
    _fromJsonObject(object) {
      return {
        code: object["code"],
        enabled: object["enabled"]
      };
    },
    _toJsonObject(self) {
      return {
        code: self.code,
        enabled: self.enabled
      };
    }
  };
  return endpointTransformationPatch;
}
var endpointUpdate = {};
var hasRequiredEndpointUpdate;
function requireEndpointUpdate() {
  if (hasRequiredEndpointUpdate) return endpointUpdate;
  hasRequiredEndpointUpdate = 1;
  Object.defineProperty(endpointUpdate, "__esModule", { value: true });
  endpointUpdate.EndpointUpdateSerializer = void 0;
  endpointUpdate.EndpointUpdateSerializer = {
    _fromJsonObject(object) {
      return {
        channels: object["channels"],
        description: object["description"],
        disabled: object["disabled"],
        filterTypes: object["filterTypes"],
        metadata: object["metadata"],
        rateLimit: object["rateLimit"],
        uid: object["uid"],
        url: object["url"],
        version: object["version"]
      };
    },
    _toJsonObject(self) {
      return {
        channels: self.channels,
        description: self.description,
        disabled: self.disabled,
        filterTypes: self.filterTypes,
        metadata: self.metadata,
        rateLimit: self.rateLimit,
        uid: self.uid,
        url: self.url,
        version: self.version
      };
    }
  };
  return endpointUpdate;
}
var eventExampleIn = {};
var hasRequiredEventExampleIn;
function requireEventExampleIn() {
  if (hasRequiredEventExampleIn) return eventExampleIn;
  hasRequiredEventExampleIn = 1;
  Object.defineProperty(eventExampleIn, "__esModule", { value: true });
  eventExampleIn.EventExampleInSerializer = void 0;
  eventExampleIn.EventExampleInSerializer = {
    _fromJsonObject(object) {
      return {
        eventType: object["eventType"],
        exampleIndex: object["exampleIndex"]
      };
    },
    _toJsonObject(self) {
      return {
        eventType: self.eventType,
        exampleIndex: self.exampleIndex
      };
    }
  };
  return eventExampleIn;
}
var listResponseEndpointOut = {};
var hasRequiredListResponseEndpointOut;
function requireListResponseEndpointOut() {
  if (hasRequiredListResponseEndpointOut) return listResponseEndpointOut;
  hasRequiredListResponseEndpointOut = 1;
  Object.defineProperty(listResponseEndpointOut, "__esModule", { value: true });
  listResponseEndpointOut.ListResponseEndpointOutSerializer = void 0;
  const endpointOut_1 = requireEndpointOut();
  listResponseEndpointOut.ListResponseEndpointOutSerializer = {
    _fromJsonObject(object) {
      return {
        data: object["data"].map((item) => endpointOut_1.EndpointOutSerializer._fromJsonObject(item)),
        done: object["done"],
        iterator: object["iterator"],
        prevIterator: object["prevIterator"]
      };
    },
    _toJsonObject(self) {
      return {
        data: self.data.map((item) => endpointOut_1.EndpointOutSerializer._toJsonObject(item)),
        done: self.done,
        iterator: self.iterator,
        prevIterator: self.prevIterator
      };
    }
  };
  return listResponseEndpointOut;
}
var messageOut = {};
var hasRequiredMessageOut;
function requireMessageOut() {
  if (hasRequiredMessageOut) return messageOut;
  hasRequiredMessageOut = 1;
  Object.defineProperty(messageOut, "__esModule", { value: true });
  messageOut.MessageOutSerializer = void 0;
  messageOut.MessageOutSerializer = {
    _fromJsonObject(object) {
      return {
        channels: object["channels"],
        deliverAt: object["deliverAt"] ? new Date(object["deliverAt"]) : null,
        eventId: object["eventId"],
        eventType: object["eventType"],
        id: object["id"],
        payload: object["payload"],
        tags: object["tags"],
        timestamp: new Date(object["timestamp"])
      };
    },
    _toJsonObject(self) {
      return {
        channels: self.channels,
        deliverAt: self.deliverAt,
        eventId: self.eventId,
        eventType: self.eventType,
        id: self.id,
        payload: self.payload,
        tags: self.tags,
        timestamp: self.timestamp
      };
    }
  };
  return messageOut;
}
var recoverIn = {};
var hasRequiredRecoverIn;
function requireRecoverIn() {
  if (hasRequiredRecoverIn) return recoverIn;
  hasRequiredRecoverIn = 1;
  Object.defineProperty(recoverIn, "__esModule", { value: true });
  recoverIn.RecoverInSerializer = void 0;
  recoverIn.RecoverInSerializer = {
    _fromJsonObject(object) {
      return {
        since: new Date(object["since"]),
        until: object["until"] ? new Date(object["until"]) : null
      };
    },
    _toJsonObject(self) {
      return {
        since: self.since,
        until: self.until
      };
    }
  };
  return recoverIn;
}
var recoverOut = {};
var hasRequiredRecoverOut;
function requireRecoverOut() {
  if (hasRequiredRecoverOut) return recoverOut;
  hasRequiredRecoverOut = 1;
  Object.defineProperty(recoverOut, "__esModule", { value: true });
  recoverOut.RecoverOutSerializer = void 0;
  const backgroundTaskStatus_1 = requireBackgroundTaskStatus();
  const backgroundTaskType_1 = requireBackgroundTaskType();
  recoverOut.RecoverOutSerializer = {
    _fromJsonObject(object) {
      return {
        id: object["id"],
        status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
        task: backgroundTaskType_1.BackgroundTaskTypeSerializer._fromJsonObject(object["task"])
      };
    },
    _toJsonObject(self) {
      return {
        id: self.id,
        status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._toJsonObject(self.status),
        task: backgroundTaskType_1.BackgroundTaskTypeSerializer._toJsonObject(self.task)
      };
    }
  };
  return recoverOut;
}
var replayIn = {};
var hasRequiredReplayIn;
function requireReplayIn() {
  if (hasRequiredReplayIn) return replayIn;
  hasRequiredReplayIn = 1;
  Object.defineProperty(replayIn, "__esModule", { value: true });
  replayIn.ReplayInSerializer = void 0;
  replayIn.ReplayInSerializer = {
    _fromJsonObject(object) {
      return {
        since: new Date(object["since"]),
        until: object["until"] ? new Date(object["until"]) : null
      };
    },
    _toJsonObject(self) {
      return {
        since: self.since,
        until: self.until
      };
    }
  };
  return replayIn;
}
var replayOut = {};
var hasRequiredReplayOut;
function requireReplayOut() {
  if (hasRequiredReplayOut) return replayOut;
  hasRequiredReplayOut = 1;
  Object.defineProperty(replayOut, "__esModule", { value: true });
  replayOut.ReplayOutSerializer = void 0;
  const backgroundTaskStatus_1 = requireBackgroundTaskStatus();
  const backgroundTaskType_1 = requireBackgroundTaskType();
  replayOut.ReplayOutSerializer = {
    _fromJsonObject(object) {
      return {
        id: object["id"],
        status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
        task: backgroundTaskType_1.BackgroundTaskTypeSerializer._fromJsonObject(object["task"])
      };
    },
    _toJsonObject(self) {
      return {
        id: self.id,
        status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._toJsonObject(self.status),
        task: backgroundTaskType_1.BackgroundTaskTypeSerializer._toJsonObject(self.task)
      };
    }
  };
  return replayOut;
}
var hasRequiredEndpoint;
function requireEndpoint() {
  if (hasRequiredEndpoint) return endpoint;
  hasRequiredEndpoint = 1;
  Object.defineProperty(endpoint, "__esModule", { value: true });
  endpoint.Endpoint = void 0;
  const endpointHeadersIn_1 = requireEndpointHeadersIn();
  const endpointHeadersOut_1 = requireEndpointHeadersOut();
  const endpointHeadersPatchIn_1 = requireEndpointHeadersPatchIn();
  const endpointIn_1 = requireEndpointIn();
  const endpointOut_1 = requireEndpointOut();
  const endpointPatch_1 = requireEndpointPatch();
  const endpointSecretOut_1 = requireEndpointSecretOut();
  const endpointSecretRotateIn_1 = requireEndpointSecretRotateIn();
  const endpointStats_1 = requireEndpointStats();
  const endpointTransformationIn_1 = requireEndpointTransformationIn();
  const endpointTransformationOut_1 = requireEndpointTransformationOut();
  const endpointTransformationPatch_1 = requireEndpointTransformationPatch();
  const endpointUpdate_1 = requireEndpointUpdate();
  const eventExampleIn_1 = requireEventExampleIn();
  const listResponseEndpointOut_1 = requireListResponseEndpointOut();
  const messageOut_1 = requireMessageOut();
  const recoverIn_1 = requireRecoverIn();
  const recoverOut_1 = requireRecoverOut();
  const replayIn_1 = requireReplayIn();
  const replayOut_1 = requireReplayOut();
  const request_1 = requireRequest();
  class Endpoint {
    constructor(requestCtx) {
      this.requestCtx = requestCtx;
    }
    list(appId, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint");
      request2.setPathParam("app_id", appId);
      request2.setQueryParams({
        limit: options === null || options === void 0 ? void 0 : options.limit,
        iterator: options === null || options === void 0 ? void 0 : options.iterator,
        order: options === null || options === void 0 ? void 0 : options.order
      });
      return request2.send(this.requestCtx, listResponseEndpointOut_1.ListResponseEndpointOutSerializer._fromJsonObject);
    }
    create(appId, endpointIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/endpoint");
      request2.setPathParam("app_id", appId);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(endpointIn_1.EndpointInSerializer._toJsonObject(endpointIn2));
      return request2.send(this.requestCtx, endpointOut_1.EndpointOutSerializer._fromJsonObject);
    }
    get(appId, endpointId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("endpoint_id", endpointId);
      return request2.send(this.requestCtx, endpointOut_1.EndpointOutSerializer._fromJsonObject);
    }
    update(appId, endpointId, endpointUpdate2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/app/{app_id}/endpoint/{endpoint_id}");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("endpoint_id", endpointId);
      request2.setBody(endpointUpdate_1.EndpointUpdateSerializer._toJsonObject(endpointUpdate2));
      return request2.send(this.requestCtx, endpointOut_1.EndpointOutSerializer._fromJsonObject);
    }
    delete(appId, endpointId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/app/{app_id}/endpoint/{endpoint_id}");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("endpoint_id", endpointId);
      return request2.sendNoResponseBody(this.requestCtx);
    }
    patch(appId, endpointId, endpointPatch2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/app/{app_id}/endpoint/{endpoint_id}");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("endpoint_id", endpointId);
      request2.setBody(endpointPatch_1.EndpointPatchSerializer._toJsonObject(endpointPatch2));
      return request2.send(this.requestCtx, endpointOut_1.EndpointOutSerializer._fromJsonObject);
    }
    getHeaders(appId, endpointId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/headers");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("endpoint_id", endpointId);
      return request2.send(this.requestCtx, endpointHeadersOut_1.EndpointHeadersOutSerializer._fromJsonObject);
    }
    updateHeaders(appId, endpointId, endpointHeadersIn2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/headers");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("endpoint_id", endpointId);
      request2.setBody(endpointHeadersIn_1.EndpointHeadersInSerializer._toJsonObject(endpointHeadersIn2));
      return request2.sendNoResponseBody(this.requestCtx);
    }
    headersUpdate(appId, endpointId, endpointHeadersIn2) {
      return this.updateHeaders(appId, endpointId, endpointHeadersIn2);
    }
    patchHeaders(appId, endpointId, endpointHeadersPatchIn2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/headers");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("endpoint_id", endpointId);
      request2.setBody(endpointHeadersPatchIn_1.EndpointHeadersPatchInSerializer._toJsonObject(endpointHeadersPatchIn2));
      return request2.sendNoResponseBody(this.requestCtx);
    }
    headersPatch(appId, endpointId, endpointHeadersPatchIn2) {
      return this.patchHeaders(appId, endpointId, endpointHeadersPatchIn2);
    }
    recover(appId, endpointId, recoverIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/recover");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("endpoint_id", endpointId);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(recoverIn_1.RecoverInSerializer._toJsonObject(recoverIn2));
      return request2.send(this.requestCtx, recoverOut_1.RecoverOutSerializer._fromJsonObject);
    }
    replayMissing(appId, endpointId, replayIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/replay-missing");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("endpoint_id", endpointId);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(replayIn_1.ReplayInSerializer._toJsonObject(replayIn2));
      return request2.send(this.requestCtx, replayOut_1.ReplayOutSerializer._fromJsonObject);
    }
    getSecret(appId, endpointId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/secret");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("endpoint_id", endpointId);
      return request2.send(this.requestCtx, endpointSecretOut_1.EndpointSecretOutSerializer._fromJsonObject);
    }
    rotateSecret(appId, endpointId, endpointSecretRotateIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/secret/rotate");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("endpoint_id", endpointId);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(endpointSecretRotateIn_1.EndpointSecretRotateInSerializer._toJsonObject(endpointSecretRotateIn2));
      return request2.sendNoResponseBody(this.requestCtx);
    }
    sendExample(appId, endpointId, eventExampleIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/send-example");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("endpoint_id", endpointId);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(eventExampleIn_1.EventExampleInSerializer._toJsonObject(eventExampleIn2));
      return request2.send(this.requestCtx, messageOut_1.MessageOutSerializer._fromJsonObject);
    }
    getStats(appId, endpointId, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/stats");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("endpoint_id", endpointId);
      request2.setQueryParams({
        since: options === null || options === void 0 ? void 0 : options.since,
        until: options === null || options === void 0 ? void 0 : options.until
      });
      return request2.send(this.requestCtx, endpointStats_1.EndpointStatsSerializer._fromJsonObject);
    }
    transformationGet(appId, endpointId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/transformation");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("endpoint_id", endpointId);
      return request2.send(this.requestCtx, endpointTransformationOut_1.EndpointTransformationOutSerializer._fromJsonObject);
    }
    patchTransformation(appId, endpointId, endpointTransformationPatch2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/transformation");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("endpoint_id", endpointId);
      request2.setBody(endpointTransformationPatch_1.EndpointTransformationPatchSerializer._toJsonObject(endpointTransformationPatch2));
      return request2.sendNoResponseBody(this.requestCtx);
    }
    transformationPartialUpdate(appId, endpointId, endpointTransformationIn2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/transformation");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("endpoint_id", endpointId);
      request2.setBody(endpointTransformationIn_1.EndpointTransformationInSerializer._toJsonObject(endpointTransformationIn2));
      return request2.sendNoResponseBody(this.requestCtx);
    }
  }
  endpoint.Endpoint = Endpoint;
  return endpoint;
}
var environment = {};
var environmentIn = {};
var eventTypeIn = {};
var hasRequiredEventTypeIn;
function requireEventTypeIn() {
  if (hasRequiredEventTypeIn) return eventTypeIn;
  hasRequiredEventTypeIn = 1;
  Object.defineProperty(eventTypeIn, "__esModule", { value: true });
  eventTypeIn.EventTypeInSerializer = void 0;
  eventTypeIn.EventTypeInSerializer = {
    _fromJsonObject(object) {
      return {
        archived: object["archived"],
        deprecated: object["deprecated"],
        description: object["description"],
        featureFlag: object["featureFlag"],
        featureFlags: object["featureFlags"],
        groupName: object["groupName"],
        name: object["name"],
        schemas: object["schemas"]
      };
    },
    _toJsonObject(self) {
      return {
        archived: self.archived,
        deprecated: self.deprecated,
        description: self.description,
        featureFlag: self.featureFlag,
        featureFlags: self.featureFlags,
        groupName: self.groupName,
        name: self.name,
        schemas: self.schemas
      };
    }
  };
  return eventTypeIn;
}
var hasRequiredEnvironmentIn;
function requireEnvironmentIn() {
  if (hasRequiredEnvironmentIn) return environmentIn;
  hasRequiredEnvironmentIn = 1;
  Object.defineProperty(environmentIn, "__esModule", { value: true });
  environmentIn.EnvironmentInSerializer = void 0;
  const connectorIn_1 = requireConnectorIn();
  const eventTypeIn_1 = requireEventTypeIn();
  environmentIn.EnvironmentInSerializer = {
    _fromJsonObject(object) {
      var _a, _b;
      return {
        connectors: (_a = object["connectors"]) === null || _a === void 0 ? void 0 : _a.map((item) => connectorIn_1.ConnectorInSerializer._fromJsonObject(item)),
        eventTypes: (_b = object["eventTypes"]) === null || _b === void 0 ? void 0 : _b.map((item) => eventTypeIn_1.EventTypeInSerializer._fromJsonObject(item)),
        settings: object["settings"]
      };
    },
    _toJsonObject(self) {
      var _a, _b;
      return {
        connectors: (_a = self.connectors) === null || _a === void 0 ? void 0 : _a.map((item) => connectorIn_1.ConnectorInSerializer._toJsonObject(item)),
        eventTypes: (_b = self.eventTypes) === null || _b === void 0 ? void 0 : _b.map((item) => eventTypeIn_1.EventTypeInSerializer._toJsonObject(item)),
        settings: self.settings
      };
    }
  };
  return environmentIn;
}
var environmentOut = {};
var eventTypeOut = {};
var hasRequiredEventTypeOut;
function requireEventTypeOut() {
  if (hasRequiredEventTypeOut) return eventTypeOut;
  hasRequiredEventTypeOut = 1;
  Object.defineProperty(eventTypeOut, "__esModule", { value: true });
  eventTypeOut.EventTypeOutSerializer = void 0;
  eventTypeOut.EventTypeOutSerializer = {
    _fromJsonObject(object) {
      return {
        archived: object["archived"],
        createdAt: new Date(object["createdAt"]),
        deprecated: object["deprecated"],
        description: object["description"],
        featureFlag: object["featureFlag"],
        featureFlags: object["featureFlags"],
        groupName: object["groupName"],
        name: object["name"],
        schemas: object["schemas"],
        updatedAt: new Date(object["updatedAt"])
      };
    },
    _toJsonObject(self) {
      return {
        archived: self.archived,
        createdAt: self.createdAt,
        deprecated: self.deprecated,
        description: self.description,
        featureFlag: self.featureFlag,
        featureFlags: self.featureFlags,
        groupName: self.groupName,
        name: self.name,
        schemas: self.schemas,
        updatedAt: self.updatedAt
      };
    }
  };
  return eventTypeOut;
}
var hasRequiredEnvironmentOut;
function requireEnvironmentOut() {
  if (hasRequiredEnvironmentOut) return environmentOut;
  hasRequiredEnvironmentOut = 1;
  Object.defineProperty(environmentOut, "__esModule", { value: true });
  environmentOut.EnvironmentOutSerializer = void 0;
  const connectorOut_1 = requireConnectorOut();
  const eventTypeOut_1 = requireEventTypeOut();
  environmentOut.EnvironmentOutSerializer = {
    _fromJsonObject(object) {
      return {
        connectors: object["connectors"].map((item) => connectorOut_1.ConnectorOutSerializer._fromJsonObject(item)),
        createdAt: new Date(object["createdAt"]),
        eventTypes: object["eventTypes"].map((item) => eventTypeOut_1.EventTypeOutSerializer._fromJsonObject(item)),
        settings: object["settings"],
        version: object["version"]
      };
    },
    _toJsonObject(self) {
      return {
        connectors: self.connectors.map((item) => connectorOut_1.ConnectorOutSerializer._toJsonObject(item)),
        createdAt: self.createdAt,
        eventTypes: self.eventTypes.map((item) => eventTypeOut_1.EventTypeOutSerializer._toJsonObject(item)),
        settings: self.settings,
        version: self.version
      };
    }
  };
  return environmentOut;
}
var hasRequiredEnvironment;
function requireEnvironment() {
  if (hasRequiredEnvironment) return environment;
  hasRequiredEnvironment = 1;
  Object.defineProperty(environment, "__esModule", { value: true });
  environment.Environment = void 0;
  const environmentIn_1 = requireEnvironmentIn();
  const environmentOut_1 = requireEnvironmentOut();
  const request_1 = requireRequest();
  class Environment {
    constructor(requestCtx) {
      this.requestCtx = requestCtx;
    }
    export(options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/environment/export");
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      return request2.send(this.requestCtx, environmentOut_1.EnvironmentOutSerializer._fromJsonObject);
    }
    import(environmentIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/environment/import");
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(environmentIn_1.EnvironmentInSerializer._toJsonObject(environmentIn2));
      return request2.sendNoResponseBody(this.requestCtx);
    }
  }
  environment.Environment = Environment;
  return environment;
}
var eventType = {};
var eventTypeImportOpenApiIn = {};
var hasRequiredEventTypeImportOpenApiIn;
function requireEventTypeImportOpenApiIn() {
  if (hasRequiredEventTypeImportOpenApiIn) return eventTypeImportOpenApiIn;
  hasRequiredEventTypeImportOpenApiIn = 1;
  Object.defineProperty(eventTypeImportOpenApiIn, "__esModule", { value: true });
  eventTypeImportOpenApiIn.EventTypeImportOpenApiInSerializer = void 0;
  eventTypeImportOpenApiIn.EventTypeImportOpenApiInSerializer = {
    _fromJsonObject(object) {
      return {
        dryRun: object["dryRun"],
        replaceAll: object["replaceAll"],
        spec: object["spec"],
        specRaw: object["specRaw"]
      };
    },
    _toJsonObject(self) {
      return {
        dryRun: self.dryRun,
        replaceAll: self.replaceAll,
        spec: self.spec,
        specRaw: self.specRaw
      };
    }
  };
  return eventTypeImportOpenApiIn;
}
var eventTypeImportOpenApiOut = {};
var eventTypeImportOpenApiOutData = {};
var eventTypeFromOpenApi = {};
var hasRequiredEventTypeFromOpenApi;
function requireEventTypeFromOpenApi() {
  if (hasRequiredEventTypeFromOpenApi) return eventTypeFromOpenApi;
  hasRequiredEventTypeFromOpenApi = 1;
  Object.defineProperty(eventTypeFromOpenApi, "__esModule", { value: true });
  eventTypeFromOpenApi.EventTypeFromOpenApiSerializer = void 0;
  eventTypeFromOpenApi.EventTypeFromOpenApiSerializer = {
    _fromJsonObject(object) {
      return {
        deprecated: object["deprecated"],
        description: object["description"],
        featureFlag: object["featureFlag"],
        featureFlags: object["featureFlags"],
        groupName: object["groupName"],
        name: object["name"],
        schemas: object["schemas"]
      };
    },
    _toJsonObject(self) {
      return {
        deprecated: self.deprecated,
        description: self.description,
        featureFlag: self.featureFlag,
        featureFlags: self.featureFlags,
        groupName: self.groupName,
        name: self.name,
        schemas: self.schemas
      };
    }
  };
  return eventTypeFromOpenApi;
}
var hasRequiredEventTypeImportOpenApiOutData;
function requireEventTypeImportOpenApiOutData() {
  if (hasRequiredEventTypeImportOpenApiOutData) return eventTypeImportOpenApiOutData;
  hasRequiredEventTypeImportOpenApiOutData = 1;
  Object.defineProperty(eventTypeImportOpenApiOutData, "__esModule", { value: true });
  eventTypeImportOpenApiOutData.EventTypeImportOpenApiOutDataSerializer = void 0;
  const eventTypeFromOpenApi_1 = requireEventTypeFromOpenApi();
  eventTypeImportOpenApiOutData.EventTypeImportOpenApiOutDataSerializer = {
    _fromJsonObject(object) {
      var _a;
      return {
        modified: object["modified"],
        toModify: (_a = object["to_modify"]) === null || _a === void 0 ? void 0 : _a.map((item) => eventTypeFromOpenApi_1.EventTypeFromOpenApiSerializer._fromJsonObject(item))
      };
    },
    _toJsonObject(self) {
      var _a;
      return {
        modified: self.modified,
        to_modify: (_a = self.toModify) === null || _a === void 0 ? void 0 : _a.map((item) => eventTypeFromOpenApi_1.EventTypeFromOpenApiSerializer._toJsonObject(item))
      };
    }
  };
  return eventTypeImportOpenApiOutData;
}
var hasRequiredEventTypeImportOpenApiOut;
function requireEventTypeImportOpenApiOut() {
  if (hasRequiredEventTypeImportOpenApiOut) return eventTypeImportOpenApiOut;
  hasRequiredEventTypeImportOpenApiOut = 1;
  Object.defineProperty(eventTypeImportOpenApiOut, "__esModule", { value: true });
  eventTypeImportOpenApiOut.EventTypeImportOpenApiOutSerializer = void 0;
  const eventTypeImportOpenApiOutData_1 = requireEventTypeImportOpenApiOutData();
  eventTypeImportOpenApiOut.EventTypeImportOpenApiOutSerializer = {
    _fromJsonObject(object) {
      return {
        data: eventTypeImportOpenApiOutData_1.EventTypeImportOpenApiOutDataSerializer._fromJsonObject(object["data"])
      };
    },
    _toJsonObject(self) {
      return {
        data: eventTypeImportOpenApiOutData_1.EventTypeImportOpenApiOutDataSerializer._toJsonObject(self.data)
      };
    }
  };
  return eventTypeImportOpenApiOut;
}
var eventTypePatch = {};
var hasRequiredEventTypePatch;
function requireEventTypePatch() {
  if (hasRequiredEventTypePatch) return eventTypePatch;
  hasRequiredEventTypePatch = 1;
  Object.defineProperty(eventTypePatch, "__esModule", { value: true });
  eventTypePatch.EventTypePatchSerializer = void 0;
  eventTypePatch.EventTypePatchSerializer = {
    _fromJsonObject(object) {
      return {
        archived: object["archived"],
        deprecated: object["deprecated"],
        description: object["description"],
        featureFlag: object["featureFlag"],
        featureFlags: object["featureFlags"],
        groupName: object["groupName"],
        schemas: object["schemas"]
      };
    },
    _toJsonObject(self) {
      return {
        archived: self.archived,
        deprecated: self.deprecated,
        description: self.description,
        featureFlag: self.featureFlag,
        featureFlags: self.featureFlags,
        groupName: self.groupName,
        schemas: self.schemas
      };
    }
  };
  return eventTypePatch;
}
var eventTypeUpdate = {};
var hasRequiredEventTypeUpdate;
function requireEventTypeUpdate() {
  if (hasRequiredEventTypeUpdate) return eventTypeUpdate;
  hasRequiredEventTypeUpdate = 1;
  Object.defineProperty(eventTypeUpdate, "__esModule", { value: true });
  eventTypeUpdate.EventTypeUpdateSerializer = void 0;
  eventTypeUpdate.EventTypeUpdateSerializer = {
    _fromJsonObject(object) {
      return {
        archived: object["archived"],
        deprecated: object["deprecated"],
        description: object["description"],
        featureFlag: object["featureFlag"],
        featureFlags: object["featureFlags"],
        groupName: object["groupName"],
        schemas: object["schemas"]
      };
    },
    _toJsonObject(self) {
      return {
        archived: self.archived,
        deprecated: self.deprecated,
        description: self.description,
        featureFlag: self.featureFlag,
        featureFlags: self.featureFlags,
        groupName: self.groupName,
        schemas: self.schemas
      };
    }
  };
  return eventTypeUpdate;
}
var listResponseEventTypeOut = {};
var hasRequiredListResponseEventTypeOut;
function requireListResponseEventTypeOut() {
  if (hasRequiredListResponseEventTypeOut) return listResponseEventTypeOut;
  hasRequiredListResponseEventTypeOut = 1;
  Object.defineProperty(listResponseEventTypeOut, "__esModule", { value: true });
  listResponseEventTypeOut.ListResponseEventTypeOutSerializer = void 0;
  const eventTypeOut_1 = requireEventTypeOut();
  listResponseEventTypeOut.ListResponseEventTypeOutSerializer = {
    _fromJsonObject(object) {
      return {
        data: object["data"].map((item) => eventTypeOut_1.EventTypeOutSerializer._fromJsonObject(item)),
        done: object["done"],
        iterator: object["iterator"],
        prevIterator: object["prevIterator"]
      };
    },
    _toJsonObject(self) {
      return {
        data: self.data.map((item) => eventTypeOut_1.EventTypeOutSerializer._toJsonObject(item)),
        done: self.done,
        iterator: self.iterator,
        prevIterator: self.prevIterator
      };
    }
  };
  return listResponseEventTypeOut;
}
var hasRequiredEventType;
function requireEventType() {
  if (hasRequiredEventType) return eventType;
  hasRequiredEventType = 1;
  Object.defineProperty(eventType, "__esModule", { value: true });
  eventType.EventType = void 0;
  const eventTypeImportOpenApiIn_1 = requireEventTypeImportOpenApiIn();
  const eventTypeImportOpenApiOut_1 = requireEventTypeImportOpenApiOut();
  const eventTypeIn_1 = requireEventTypeIn();
  const eventTypeOut_1 = requireEventTypeOut();
  const eventTypePatch_1 = requireEventTypePatch();
  const eventTypeUpdate_1 = requireEventTypeUpdate();
  const listResponseEventTypeOut_1 = requireListResponseEventTypeOut();
  const request_1 = requireRequest();
  class EventType {
    constructor(requestCtx) {
      this.requestCtx = requestCtx;
    }
    list(options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/event-type");
      request2.setQueryParams({
        limit: options === null || options === void 0 ? void 0 : options.limit,
        iterator: options === null || options === void 0 ? void 0 : options.iterator,
        order: options === null || options === void 0 ? void 0 : options.order,
        include_archived: options === null || options === void 0 ? void 0 : options.includeArchived,
        with_content: options === null || options === void 0 ? void 0 : options.withContent
      });
      return request2.send(this.requestCtx, listResponseEventTypeOut_1.ListResponseEventTypeOutSerializer._fromJsonObject);
    }
    create(eventTypeIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/event-type");
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(eventTypeIn_1.EventTypeInSerializer._toJsonObject(eventTypeIn2));
      return request2.send(this.requestCtx, eventTypeOut_1.EventTypeOutSerializer._fromJsonObject);
    }
    importOpenapi(eventTypeImportOpenApiIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/event-type/import/openapi");
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(eventTypeImportOpenApiIn_1.EventTypeImportOpenApiInSerializer._toJsonObject(eventTypeImportOpenApiIn2));
      return request2.send(this.requestCtx, eventTypeImportOpenApiOut_1.EventTypeImportOpenApiOutSerializer._fromJsonObject);
    }
    get(eventTypeName) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/event-type/{event_type_name}");
      request2.setPathParam("event_type_name", eventTypeName);
      return request2.send(this.requestCtx, eventTypeOut_1.EventTypeOutSerializer._fromJsonObject);
    }
    update(eventTypeName, eventTypeUpdate2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/event-type/{event_type_name}");
      request2.setPathParam("event_type_name", eventTypeName);
      request2.setBody(eventTypeUpdate_1.EventTypeUpdateSerializer._toJsonObject(eventTypeUpdate2));
      return request2.send(this.requestCtx, eventTypeOut_1.EventTypeOutSerializer._fromJsonObject);
    }
    delete(eventTypeName, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/event-type/{event_type_name}");
      request2.setPathParam("event_type_name", eventTypeName);
      request2.setQueryParams({
        expunge: options === null || options === void 0 ? void 0 : options.expunge
      });
      return request2.sendNoResponseBody(this.requestCtx);
    }
    patch(eventTypeName, eventTypePatch2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/event-type/{event_type_name}");
      request2.setPathParam("event_type_name", eventTypeName);
      request2.setBody(eventTypePatch_1.EventTypePatchSerializer._toJsonObject(eventTypePatch2));
      return request2.send(this.requestCtx, eventTypeOut_1.EventTypeOutSerializer._fromJsonObject);
    }
  }
  eventType.EventType = EventType;
  return eventType;
}
var health = {};
var hasRequiredHealth;
function requireHealth() {
  if (hasRequiredHealth) return health;
  hasRequiredHealth = 1;
  Object.defineProperty(health, "__esModule", { value: true });
  health.Health = void 0;
  const request_1 = requireRequest();
  class Health {
    constructor(requestCtx) {
      this.requestCtx = requestCtx;
    }
    get() {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/health");
      return request2.sendNoResponseBody(this.requestCtx);
    }
  }
  health.Health = Health;
  return health;
}
var ingest = {};
var ingestSourceConsumerPortalAccessIn = {};
var hasRequiredIngestSourceConsumerPortalAccessIn;
function requireIngestSourceConsumerPortalAccessIn() {
  if (hasRequiredIngestSourceConsumerPortalAccessIn) return ingestSourceConsumerPortalAccessIn;
  hasRequiredIngestSourceConsumerPortalAccessIn = 1;
  Object.defineProperty(ingestSourceConsumerPortalAccessIn, "__esModule", { value: true });
  ingestSourceConsumerPortalAccessIn.IngestSourceConsumerPortalAccessInSerializer = void 0;
  ingestSourceConsumerPortalAccessIn.IngestSourceConsumerPortalAccessInSerializer = {
    _fromJsonObject(object) {
      return {
        expiry: object["expiry"],
        readOnly: object["readOnly"]
      };
    },
    _toJsonObject(self) {
      return {
        expiry: self.expiry,
        readOnly: self.readOnly
      };
    }
  };
  return ingestSourceConsumerPortalAccessIn;
}
var ingestEndpoint = {};
var ingestEndpointHeadersIn = {};
var hasRequiredIngestEndpointHeadersIn;
function requireIngestEndpointHeadersIn() {
  if (hasRequiredIngestEndpointHeadersIn) return ingestEndpointHeadersIn;
  hasRequiredIngestEndpointHeadersIn = 1;
  Object.defineProperty(ingestEndpointHeadersIn, "__esModule", { value: true });
  ingestEndpointHeadersIn.IngestEndpointHeadersInSerializer = void 0;
  ingestEndpointHeadersIn.IngestEndpointHeadersInSerializer = {
    _fromJsonObject(object) {
      return {
        headers: object["headers"]
      };
    },
    _toJsonObject(self) {
      return {
        headers: self.headers
      };
    }
  };
  return ingestEndpointHeadersIn;
}
var ingestEndpointHeadersOut = {};
var hasRequiredIngestEndpointHeadersOut;
function requireIngestEndpointHeadersOut() {
  if (hasRequiredIngestEndpointHeadersOut) return ingestEndpointHeadersOut;
  hasRequiredIngestEndpointHeadersOut = 1;
  Object.defineProperty(ingestEndpointHeadersOut, "__esModule", { value: true });
  ingestEndpointHeadersOut.IngestEndpointHeadersOutSerializer = void 0;
  ingestEndpointHeadersOut.IngestEndpointHeadersOutSerializer = {
    _fromJsonObject(object) {
      return {
        headers: object["headers"],
        sensitive: object["sensitive"]
      };
    },
    _toJsonObject(self) {
      return {
        headers: self.headers,
        sensitive: self.sensitive
      };
    }
  };
  return ingestEndpointHeadersOut;
}
var ingestEndpointIn = {};
var hasRequiredIngestEndpointIn;
function requireIngestEndpointIn() {
  if (hasRequiredIngestEndpointIn) return ingestEndpointIn;
  hasRequiredIngestEndpointIn = 1;
  Object.defineProperty(ingestEndpointIn, "__esModule", { value: true });
  ingestEndpointIn.IngestEndpointInSerializer = void 0;
  ingestEndpointIn.IngestEndpointInSerializer = {
    _fromJsonObject(object) {
      return {
        description: object["description"],
        disabled: object["disabled"],
        metadata: object["metadata"],
        rateLimit: object["rateLimit"],
        secret: object["secret"],
        uid: object["uid"],
        url: object["url"]
      };
    },
    _toJsonObject(self) {
      return {
        description: self.description,
        disabled: self.disabled,
        metadata: self.metadata,
        rateLimit: self.rateLimit,
        secret: self.secret,
        uid: self.uid,
        url: self.url
      };
    }
  };
  return ingestEndpointIn;
}
var ingestEndpointOut = {};
var hasRequiredIngestEndpointOut;
function requireIngestEndpointOut() {
  if (hasRequiredIngestEndpointOut) return ingestEndpointOut;
  hasRequiredIngestEndpointOut = 1;
  Object.defineProperty(ingestEndpointOut, "__esModule", { value: true });
  ingestEndpointOut.IngestEndpointOutSerializer = void 0;
  ingestEndpointOut.IngestEndpointOutSerializer = {
    _fromJsonObject(object) {
      return {
        createdAt: new Date(object["createdAt"]),
        description: object["description"],
        disabled: object["disabled"],
        id: object["id"],
        metadata: object["metadata"],
        rateLimit: object["rateLimit"],
        uid: object["uid"],
        updatedAt: new Date(object["updatedAt"]),
        url: object["url"]
      };
    },
    _toJsonObject(self) {
      return {
        createdAt: self.createdAt,
        description: self.description,
        disabled: self.disabled,
        id: self.id,
        metadata: self.metadata,
        rateLimit: self.rateLimit,
        uid: self.uid,
        updatedAt: self.updatedAt,
        url: self.url
      };
    }
  };
  return ingestEndpointOut;
}
var ingestEndpointSecretIn = {};
var hasRequiredIngestEndpointSecretIn;
function requireIngestEndpointSecretIn() {
  if (hasRequiredIngestEndpointSecretIn) return ingestEndpointSecretIn;
  hasRequiredIngestEndpointSecretIn = 1;
  Object.defineProperty(ingestEndpointSecretIn, "__esModule", { value: true });
  ingestEndpointSecretIn.IngestEndpointSecretInSerializer = void 0;
  ingestEndpointSecretIn.IngestEndpointSecretInSerializer = {
    _fromJsonObject(object) {
      return {
        key: object["key"]
      };
    },
    _toJsonObject(self) {
      return {
        key: self.key
      };
    }
  };
  return ingestEndpointSecretIn;
}
var ingestEndpointSecretOut = {};
var hasRequiredIngestEndpointSecretOut;
function requireIngestEndpointSecretOut() {
  if (hasRequiredIngestEndpointSecretOut) return ingestEndpointSecretOut;
  hasRequiredIngestEndpointSecretOut = 1;
  Object.defineProperty(ingestEndpointSecretOut, "__esModule", { value: true });
  ingestEndpointSecretOut.IngestEndpointSecretOutSerializer = void 0;
  ingestEndpointSecretOut.IngestEndpointSecretOutSerializer = {
    _fromJsonObject(object) {
      return {
        key: object["key"]
      };
    },
    _toJsonObject(self) {
      return {
        key: self.key
      };
    }
  };
  return ingestEndpointSecretOut;
}
var ingestEndpointTransformationOut = {};
var hasRequiredIngestEndpointTransformationOut;
function requireIngestEndpointTransformationOut() {
  if (hasRequiredIngestEndpointTransformationOut) return ingestEndpointTransformationOut;
  hasRequiredIngestEndpointTransformationOut = 1;
  Object.defineProperty(ingestEndpointTransformationOut, "__esModule", { value: true });
  ingestEndpointTransformationOut.IngestEndpointTransformationOutSerializer = void 0;
  ingestEndpointTransformationOut.IngestEndpointTransformationOutSerializer = {
    _fromJsonObject(object) {
      return {
        code: object["code"],
        enabled: object["enabled"]
      };
    },
    _toJsonObject(self) {
      return {
        code: self.code,
        enabled: self.enabled
      };
    }
  };
  return ingestEndpointTransformationOut;
}
var ingestEndpointTransformationPatch = {};
var hasRequiredIngestEndpointTransformationPatch;
function requireIngestEndpointTransformationPatch() {
  if (hasRequiredIngestEndpointTransformationPatch) return ingestEndpointTransformationPatch;
  hasRequiredIngestEndpointTransformationPatch = 1;
  Object.defineProperty(ingestEndpointTransformationPatch, "__esModule", { value: true });
  ingestEndpointTransformationPatch.IngestEndpointTransformationPatchSerializer = void 0;
  ingestEndpointTransformationPatch.IngestEndpointTransformationPatchSerializer = {
    _fromJsonObject(object) {
      return {
        code: object["code"],
        enabled: object["enabled"]
      };
    },
    _toJsonObject(self) {
      return {
        code: self.code,
        enabled: self.enabled
      };
    }
  };
  return ingestEndpointTransformationPatch;
}
var ingestEndpointUpdate = {};
var hasRequiredIngestEndpointUpdate;
function requireIngestEndpointUpdate() {
  if (hasRequiredIngestEndpointUpdate) return ingestEndpointUpdate;
  hasRequiredIngestEndpointUpdate = 1;
  Object.defineProperty(ingestEndpointUpdate, "__esModule", { value: true });
  ingestEndpointUpdate.IngestEndpointUpdateSerializer = void 0;
  ingestEndpointUpdate.IngestEndpointUpdateSerializer = {
    _fromJsonObject(object) {
      return {
        description: object["description"],
        disabled: object["disabled"],
        metadata: object["metadata"],
        rateLimit: object["rateLimit"],
        uid: object["uid"],
        url: object["url"]
      };
    },
    _toJsonObject(self) {
      return {
        description: self.description,
        disabled: self.disabled,
        metadata: self.metadata,
        rateLimit: self.rateLimit,
        uid: self.uid,
        url: self.url
      };
    }
  };
  return ingestEndpointUpdate;
}
var listResponseIngestEndpointOut = {};
var hasRequiredListResponseIngestEndpointOut;
function requireListResponseIngestEndpointOut() {
  if (hasRequiredListResponseIngestEndpointOut) return listResponseIngestEndpointOut;
  hasRequiredListResponseIngestEndpointOut = 1;
  Object.defineProperty(listResponseIngestEndpointOut, "__esModule", { value: true });
  listResponseIngestEndpointOut.ListResponseIngestEndpointOutSerializer = void 0;
  const ingestEndpointOut_1 = requireIngestEndpointOut();
  listResponseIngestEndpointOut.ListResponseIngestEndpointOutSerializer = {
    _fromJsonObject(object) {
      return {
        data: object["data"].map((item) => ingestEndpointOut_1.IngestEndpointOutSerializer._fromJsonObject(item)),
        done: object["done"],
        iterator: object["iterator"],
        prevIterator: object["prevIterator"]
      };
    },
    _toJsonObject(self) {
      return {
        data: self.data.map((item) => ingestEndpointOut_1.IngestEndpointOutSerializer._toJsonObject(item)),
        done: self.done,
        iterator: self.iterator,
        prevIterator: self.prevIterator
      };
    }
  };
  return listResponseIngestEndpointOut;
}
var hasRequiredIngestEndpoint;
function requireIngestEndpoint() {
  if (hasRequiredIngestEndpoint) return ingestEndpoint;
  hasRequiredIngestEndpoint = 1;
  Object.defineProperty(ingestEndpoint, "__esModule", { value: true });
  ingestEndpoint.IngestEndpoint = void 0;
  const ingestEndpointHeadersIn_1 = requireIngestEndpointHeadersIn();
  const ingestEndpointHeadersOut_1 = requireIngestEndpointHeadersOut();
  const ingestEndpointIn_1 = requireIngestEndpointIn();
  const ingestEndpointOut_1 = requireIngestEndpointOut();
  const ingestEndpointSecretIn_1 = requireIngestEndpointSecretIn();
  const ingestEndpointSecretOut_1 = requireIngestEndpointSecretOut();
  const ingestEndpointTransformationOut_1 = requireIngestEndpointTransformationOut();
  const ingestEndpointTransformationPatch_1 = requireIngestEndpointTransformationPatch();
  const ingestEndpointUpdate_1 = requireIngestEndpointUpdate();
  const listResponseIngestEndpointOut_1 = requireListResponseIngestEndpointOut();
  const request_1 = requireRequest();
  class IngestEndpoint {
    constructor(requestCtx) {
      this.requestCtx = requestCtx;
    }
    list(sourceId, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source/{source_id}/endpoint");
      request2.setPathParam("source_id", sourceId);
      request2.setQueryParams({
        limit: options === null || options === void 0 ? void 0 : options.limit,
        iterator: options === null || options === void 0 ? void 0 : options.iterator,
        order: options === null || options === void 0 ? void 0 : options.order
      });
      return request2.send(this.requestCtx, listResponseIngestEndpointOut_1.ListResponseIngestEndpointOutSerializer._fromJsonObject);
    }
    create(sourceId, ingestEndpointIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/ingest/api/v1/source/{source_id}/endpoint");
      request2.setPathParam("source_id", sourceId);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(ingestEndpointIn_1.IngestEndpointInSerializer._toJsonObject(ingestEndpointIn2));
      return request2.send(this.requestCtx, ingestEndpointOut_1.IngestEndpointOutSerializer._fromJsonObject);
    }
    get(sourceId, endpointId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}");
      request2.setPathParam("source_id", sourceId);
      request2.setPathParam("endpoint_id", endpointId);
      return request2.send(this.requestCtx, ingestEndpointOut_1.IngestEndpointOutSerializer._fromJsonObject);
    }
    update(sourceId, endpointId, ingestEndpointUpdate2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}");
      request2.setPathParam("source_id", sourceId);
      request2.setPathParam("endpoint_id", endpointId);
      request2.setBody(ingestEndpointUpdate_1.IngestEndpointUpdateSerializer._toJsonObject(ingestEndpointUpdate2));
      return request2.send(this.requestCtx, ingestEndpointOut_1.IngestEndpointOutSerializer._fromJsonObject);
    }
    delete(sourceId, endpointId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}");
      request2.setPathParam("source_id", sourceId);
      request2.setPathParam("endpoint_id", endpointId);
      return request2.sendNoResponseBody(this.requestCtx);
    }
    getHeaders(sourceId, endpointId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/headers");
      request2.setPathParam("source_id", sourceId);
      request2.setPathParam("endpoint_id", endpointId);
      return request2.send(this.requestCtx, ingestEndpointHeadersOut_1.IngestEndpointHeadersOutSerializer._fromJsonObject);
    }
    updateHeaders(sourceId, endpointId, ingestEndpointHeadersIn2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/headers");
      request2.setPathParam("source_id", sourceId);
      request2.setPathParam("endpoint_id", endpointId);
      request2.setBody(ingestEndpointHeadersIn_1.IngestEndpointHeadersInSerializer._toJsonObject(ingestEndpointHeadersIn2));
      return request2.sendNoResponseBody(this.requestCtx);
    }
    getSecret(sourceId, endpointId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/secret");
      request2.setPathParam("source_id", sourceId);
      request2.setPathParam("endpoint_id", endpointId);
      return request2.send(this.requestCtx, ingestEndpointSecretOut_1.IngestEndpointSecretOutSerializer._fromJsonObject);
    }
    rotateSecret(sourceId, endpointId, ingestEndpointSecretIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/secret/rotate");
      request2.setPathParam("source_id", sourceId);
      request2.setPathParam("endpoint_id", endpointId);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(ingestEndpointSecretIn_1.IngestEndpointSecretInSerializer._toJsonObject(ingestEndpointSecretIn2));
      return request2.sendNoResponseBody(this.requestCtx);
    }
    getTransformation(sourceId, endpointId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/transformation");
      request2.setPathParam("source_id", sourceId);
      request2.setPathParam("endpoint_id", endpointId);
      return request2.send(this.requestCtx, ingestEndpointTransformationOut_1.IngestEndpointTransformationOutSerializer._fromJsonObject);
    }
    setTransformation(sourceId, endpointId, ingestEndpointTransformationPatch2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/ingest/api/v1/source/{source_id}/endpoint/{endpoint_id}/transformation");
      request2.setPathParam("source_id", sourceId);
      request2.setPathParam("endpoint_id", endpointId);
      request2.setBody(ingestEndpointTransformationPatch_1.IngestEndpointTransformationPatchSerializer._toJsonObject(ingestEndpointTransformationPatch2));
      return request2.sendNoResponseBody(this.requestCtx);
    }
  }
  ingestEndpoint.IngestEndpoint = IngestEndpoint;
  return ingestEndpoint;
}
var ingestSource = {};
var ingestSourceIn = {};
var adobeSignConfig = {};
var hasRequiredAdobeSignConfig;
function requireAdobeSignConfig() {
  if (hasRequiredAdobeSignConfig) return adobeSignConfig;
  hasRequiredAdobeSignConfig = 1;
  Object.defineProperty(adobeSignConfig, "__esModule", { value: true });
  adobeSignConfig.AdobeSignConfigSerializer = void 0;
  adobeSignConfig.AdobeSignConfigSerializer = {
    _fromJsonObject(object) {
      return {
        clientId: object["clientId"]
      };
    },
    _toJsonObject(self) {
      return {
        clientId: self.clientId
      };
    }
  };
  return adobeSignConfig;
}
var airwallexConfig = {};
var hasRequiredAirwallexConfig;
function requireAirwallexConfig() {
  if (hasRequiredAirwallexConfig) return airwallexConfig;
  hasRequiredAirwallexConfig = 1;
  Object.defineProperty(airwallexConfig, "__esModule", { value: true });
  airwallexConfig.AirwallexConfigSerializer = void 0;
  airwallexConfig.AirwallexConfigSerializer = {
    _fromJsonObject(object) {
      return {
        secret: object["secret"]
      };
    },
    _toJsonObject(self) {
      return {
        secret: self.secret
      };
    }
  };
  return airwallexConfig;
}
var checkbookConfig = {};
var hasRequiredCheckbookConfig;
function requireCheckbookConfig() {
  if (hasRequiredCheckbookConfig) return checkbookConfig;
  hasRequiredCheckbookConfig = 1;
  Object.defineProperty(checkbookConfig, "__esModule", { value: true });
  checkbookConfig.CheckbookConfigSerializer = void 0;
  checkbookConfig.CheckbookConfigSerializer = {
    _fromJsonObject(object) {
      return {
        secret: object["secret"]
      };
    },
    _toJsonObject(self) {
      return {
        secret: self.secret
      };
    }
  };
  return checkbookConfig;
}
var cronConfig = {};
var hasRequiredCronConfig;
function requireCronConfig() {
  if (hasRequiredCronConfig) return cronConfig;
  hasRequiredCronConfig = 1;
  Object.defineProperty(cronConfig, "__esModule", { value: true });
  cronConfig.CronConfigSerializer = void 0;
  cronConfig.CronConfigSerializer = {
    _fromJsonObject(object) {
      return {
        contentType: object["contentType"],
        payload: object["payload"],
        schedule: object["schedule"]
      };
    },
    _toJsonObject(self) {
      return {
        contentType: self.contentType,
        payload: self.payload,
        schedule: self.schedule
      };
    }
  };
  return cronConfig;
}
var docusignConfig = {};
var hasRequiredDocusignConfig;
function requireDocusignConfig() {
  if (hasRequiredDocusignConfig) return docusignConfig;
  hasRequiredDocusignConfig = 1;
  Object.defineProperty(docusignConfig, "__esModule", { value: true });
  docusignConfig.DocusignConfigSerializer = void 0;
  docusignConfig.DocusignConfigSerializer = {
    _fromJsonObject(object) {
      return {
        secret: object["secret"]
      };
    },
    _toJsonObject(self) {
      return {
        secret: self.secret
      };
    }
  };
  return docusignConfig;
}
var easypostConfig = {};
var hasRequiredEasypostConfig;
function requireEasypostConfig() {
  if (hasRequiredEasypostConfig) return easypostConfig;
  hasRequiredEasypostConfig = 1;
  Object.defineProperty(easypostConfig, "__esModule", { value: true });
  easypostConfig.EasypostConfigSerializer = void 0;
  easypostConfig.EasypostConfigSerializer = {
    _fromJsonObject(object) {
      return {
        secret: object["secret"]
      };
    },
    _toJsonObject(self) {
      return {
        secret: self.secret
      };
    }
  };
  return easypostConfig;
}
var githubConfig = {};
var hasRequiredGithubConfig;
function requireGithubConfig() {
  if (hasRequiredGithubConfig) return githubConfig;
  hasRequiredGithubConfig = 1;
  Object.defineProperty(githubConfig, "__esModule", { value: true });
  githubConfig.GithubConfigSerializer = void 0;
  githubConfig.GithubConfigSerializer = {
    _fromJsonObject(object) {
      return {
        secret: object["secret"]
      };
    },
    _toJsonObject(self) {
      return {
        secret: self.secret
      };
    }
  };
  return githubConfig;
}
var hubspotConfig = {};
var hasRequiredHubspotConfig;
function requireHubspotConfig() {
  if (hasRequiredHubspotConfig) return hubspotConfig;
  hasRequiredHubspotConfig = 1;
  Object.defineProperty(hubspotConfig, "__esModule", { value: true });
  hubspotConfig.HubspotConfigSerializer = void 0;
  hubspotConfig.HubspotConfigSerializer = {
    _fromJsonObject(object) {
      return {
        secret: object["secret"]
      };
    },
    _toJsonObject(self) {
      return {
        secret: self.secret
      };
    }
  };
  return hubspotConfig;
}
var orumIoConfig = {};
var hasRequiredOrumIoConfig;
function requireOrumIoConfig() {
  if (hasRequiredOrumIoConfig) return orumIoConfig;
  hasRequiredOrumIoConfig = 1;
  Object.defineProperty(orumIoConfig, "__esModule", { value: true });
  orumIoConfig.OrumIoConfigSerializer = void 0;
  orumIoConfig.OrumIoConfigSerializer = {
    _fromJsonObject(object) {
      return {
        publicKey: object["publicKey"]
      };
    },
    _toJsonObject(self) {
      return {
        publicKey: self.publicKey
      };
    }
  };
  return orumIoConfig;
}
var pandaDocConfig = {};
var hasRequiredPandaDocConfig;
function requirePandaDocConfig() {
  if (hasRequiredPandaDocConfig) return pandaDocConfig;
  hasRequiredPandaDocConfig = 1;
  Object.defineProperty(pandaDocConfig, "__esModule", { value: true });
  pandaDocConfig.PandaDocConfigSerializer = void 0;
  pandaDocConfig.PandaDocConfigSerializer = {
    _fromJsonObject(object) {
      return {
        secret: object["secret"]
      };
    },
    _toJsonObject(self) {
      return {
        secret: self.secret
      };
    }
  };
  return pandaDocConfig;
}
var portIoConfig = {};
var hasRequiredPortIoConfig;
function requirePortIoConfig() {
  if (hasRequiredPortIoConfig) return portIoConfig;
  hasRequiredPortIoConfig = 1;
  Object.defineProperty(portIoConfig, "__esModule", { value: true });
  portIoConfig.PortIoConfigSerializer = void 0;
  portIoConfig.PortIoConfigSerializer = {
    _fromJsonObject(object) {
      return {
        secret: object["secret"]
      };
    },
    _toJsonObject(self) {
      return {
        secret: self.secret
      };
    }
  };
  return portIoConfig;
}
var rutterConfig = {};
var hasRequiredRutterConfig;
function requireRutterConfig() {
  if (hasRequiredRutterConfig) return rutterConfig;
  hasRequiredRutterConfig = 1;
  Object.defineProperty(rutterConfig, "__esModule", { value: true });
  rutterConfig.RutterConfigSerializer = void 0;
  rutterConfig.RutterConfigSerializer = {
    _fromJsonObject(object) {
      return {
        secret: object["secret"]
      };
    },
    _toJsonObject(self) {
      return {
        secret: self.secret
      };
    }
  };
  return rutterConfig;
}
var segmentConfig = {};
var hasRequiredSegmentConfig;
function requireSegmentConfig() {
  if (hasRequiredSegmentConfig) return segmentConfig;
  hasRequiredSegmentConfig = 1;
  Object.defineProperty(segmentConfig, "__esModule", { value: true });
  segmentConfig.SegmentConfigSerializer = void 0;
  segmentConfig.SegmentConfigSerializer = {
    _fromJsonObject(object) {
      return {
        secret: object["secret"]
      };
    },
    _toJsonObject(self) {
      return {
        secret: self.secret
      };
    }
  };
  return segmentConfig;
}
var shopifyConfig = {};
var hasRequiredShopifyConfig;
function requireShopifyConfig() {
  if (hasRequiredShopifyConfig) return shopifyConfig;
  hasRequiredShopifyConfig = 1;
  Object.defineProperty(shopifyConfig, "__esModule", { value: true });
  shopifyConfig.ShopifyConfigSerializer = void 0;
  shopifyConfig.ShopifyConfigSerializer = {
    _fromJsonObject(object) {
      return {
        secret: object["secret"]
      };
    },
    _toJsonObject(self) {
      return {
        secret: self.secret
      };
    }
  };
  return shopifyConfig;
}
var slackConfig = {};
var hasRequiredSlackConfig;
function requireSlackConfig() {
  if (hasRequiredSlackConfig) return slackConfig;
  hasRequiredSlackConfig = 1;
  Object.defineProperty(slackConfig, "__esModule", { value: true });
  slackConfig.SlackConfigSerializer = void 0;
  slackConfig.SlackConfigSerializer = {
    _fromJsonObject(object) {
      return {
        secret: object["secret"]
      };
    },
    _toJsonObject(self) {
      return {
        secret: self.secret
      };
    }
  };
  return slackConfig;
}
var stripeConfig = {};
var hasRequiredStripeConfig;
function requireStripeConfig() {
  if (hasRequiredStripeConfig) return stripeConfig;
  hasRequiredStripeConfig = 1;
  Object.defineProperty(stripeConfig, "__esModule", { value: true });
  stripeConfig.StripeConfigSerializer = void 0;
  stripeConfig.StripeConfigSerializer = {
    _fromJsonObject(object) {
      return {
        secret: object["secret"]
      };
    },
    _toJsonObject(self) {
      return {
        secret: self.secret
      };
    }
  };
  return stripeConfig;
}
var svixConfig = {};
var hasRequiredSvixConfig;
function requireSvixConfig() {
  if (hasRequiredSvixConfig) return svixConfig;
  hasRequiredSvixConfig = 1;
  Object.defineProperty(svixConfig, "__esModule", { value: true });
  svixConfig.SvixConfigSerializer = void 0;
  svixConfig.SvixConfigSerializer = {
    _fromJsonObject(object) {
      return {
        secret: object["secret"]
      };
    },
    _toJsonObject(self) {
      return {
        secret: self.secret
      };
    }
  };
  return svixConfig;
}
var telnyxConfig = {};
var hasRequiredTelnyxConfig;
function requireTelnyxConfig() {
  if (hasRequiredTelnyxConfig) return telnyxConfig;
  hasRequiredTelnyxConfig = 1;
  Object.defineProperty(telnyxConfig, "__esModule", { value: true });
  telnyxConfig.TelnyxConfigSerializer = void 0;
  telnyxConfig.TelnyxConfigSerializer = {
    _fromJsonObject(object) {
      return {
        publicKey: object["publicKey"]
      };
    },
    _toJsonObject(self) {
      return {
        publicKey: self.publicKey
      };
    }
  };
  return telnyxConfig;
}
var vapiConfig = {};
var hasRequiredVapiConfig;
function requireVapiConfig() {
  if (hasRequiredVapiConfig) return vapiConfig;
  hasRequiredVapiConfig = 1;
  Object.defineProperty(vapiConfig, "__esModule", { value: true });
  vapiConfig.VapiConfigSerializer = void 0;
  vapiConfig.VapiConfigSerializer = {
    _fromJsonObject(object) {
      return {
        secret: object["secret"]
      };
    },
    _toJsonObject(self) {
      return {
        secret: self.secret
      };
    }
  };
  return vapiConfig;
}
var veriffConfig = {};
var hasRequiredVeriffConfig;
function requireVeriffConfig() {
  if (hasRequiredVeriffConfig) return veriffConfig;
  hasRequiredVeriffConfig = 1;
  Object.defineProperty(veriffConfig, "__esModule", { value: true });
  veriffConfig.VeriffConfigSerializer = void 0;
  veriffConfig.VeriffConfigSerializer = {
    _fromJsonObject(object) {
      return {
        secret: object["secret"]
      };
    },
    _toJsonObject(self) {
      return {
        secret: self.secret
      };
    }
  };
  return veriffConfig;
}
var zoomConfig = {};
var hasRequiredZoomConfig;
function requireZoomConfig() {
  if (hasRequiredZoomConfig) return zoomConfig;
  hasRequiredZoomConfig = 1;
  Object.defineProperty(zoomConfig, "__esModule", { value: true });
  zoomConfig.ZoomConfigSerializer = void 0;
  zoomConfig.ZoomConfigSerializer = {
    _fromJsonObject(object) {
      return {
        secret: object["secret"]
      };
    },
    _toJsonObject(self) {
      return {
        secret: self.secret
      };
    }
  };
  return zoomConfig;
}
var hasRequiredIngestSourceIn;
function requireIngestSourceIn() {
  if (hasRequiredIngestSourceIn) return ingestSourceIn;
  hasRequiredIngestSourceIn = 1;
  Object.defineProperty(ingestSourceIn, "__esModule", { value: true });
  ingestSourceIn.IngestSourceInSerializer = void 0;
  const adobeSignConfig_1 = requireAdobeSignConfig();
  const airwallexConfig_1 = requireAirwallexConfig();
  const checkbookConfig_1 = requireCheckbookConfig();
  const cronConfig_1 = requireCronConfig();
  const docusignConfig_1 = requireDocusignConfig();
  const easypostConfig_1 = requireEasypostConfig();
  const githubConfig_1 = requireGithubConfig();
  const hubspotConfig_1 = requireHubspotConfig();
  const orumIoConfig_1 = requireOrumIoConfig();
  const pandaDocConfig_1 = requirePandaDocConfig();
  const portIoConfig_1 = requirePortIoConfig();
  const rutterConfig_1 = requireRutterConfig();
  const segmentConfig_1 = requireSegmentConfig();
  const shopifyConfig_1 = requireShopifyConfig();
  const slackConfig_1 = requireSlackConfig();
  const stripeConfig_1 = requireStripeConfig();
  const svixConfig_1 = requireSvixConfig();
  const telnyxConfig_1 = requireTelnyxConfig();
  const vapiConfig_1 = requireVapiConfig();
  const veriffConfig_1 = requireVeriffConfig();
  const zoomConfig_1 = requireZoomConfig();
  ingestSourceIn.IngestSourceInSerializer = {
    _fromJsonObject(object) {
      const type = object["type"];
      function getConfig(type2) {
        switch (type2) {
          case "generic-webhook":
            return {};
          case "cron":
            return cronConfig_1.CronConfigSerializer._fromJsonObject(object["config"]);
          case "adobe-sign":
            return adobeSignConfig_1.AdobeSignConfigSerializer._fromJsonObject(object["config"]);
          case "beehiiv":
            return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
          case "brex":
            return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
          case "checkbook":
            return checkbookConfig_1.CheckbookConfigSerializer._fromJsonObject(object["config"]);
          case "clerk":
            return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
          case "docusign":
            return docusignConfig_1.DocusignConfigSerializer._fromJsonObject(object["config"]);
          case "easypost":
            return easypostConfig_1.EasypostConfigSerializer._fromJsonObject(object["config"]);
          case "github":
            return githubConfig_1.GithubConfigSerializer._fromJsonObject(object["config"]);
          case "guesty":
            return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
          case "hubspot":
            return hubspotConfig_1.HubspotConfigSerializer._fromJsonObject(object["config"]);
          case "incident-io":
            return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
          case "lithic":
            return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
          case "nash":
            return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
          case "orum-io":
            return orumIoConfig_1.OrumIoConfigSerializer._fromJsonObject(object["config"]);
          case "panda-doc":
            return pandaDocConfig_1.PandaDocConfigSerializer._fromJsonObject(object["config"]);
          case "port-io":
            return portIoConfig_1.PortIoConfigSerializer._fromJsonObject(object["config"]);
          case "pleo":
            return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
          case "replicate":
            return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
          case "resend":
            return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
          case "rutter":
            return rutterConfig_1.RutterConfigSerializer._fromJsonObject(object["config"]);
          case "safebase":
            return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
          case "sardine":
            return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
          case "segment":
            return segmentConfig_1.SegmentConfigSerializer._fromJsonObject(object["config"]);
          case "shopify":
            return shopifyConfig_1.ShopifyConfigSerializer._fromJsonObject(object["config"]);
          case "slack":
            return slackConfig_1.SlackConfigSerializer._fromJsonObject(object["config"]);
          case "stripe":
            return stripeConfig_1.StripeConfigSerializer._fromJsonObject(object["config"]);
          case "stych":
            return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
          case "svix":
            return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
          case "zoom":
            return zoomConfig_1.ZoomConfigSerializer._fromJsonObject(object["config"]);
          case "telnyx":
            return telnyxConfig_1.TelnyxConfigSerializer._fromJsonObject(object["config"]);
          case "vapi":
            return vapiConfig_1.VapiConfigSerializer._fromJsonObject(object["config"]);
          case "open-ai":
            return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
          case "render":
            return svixConfig_1.SvixConfigSerializer._fromJsonObject(object["config"]);
          case "veriff":
            return veriffConfig_1.VeriffConfigSerializer._fromJsonObject(object["config"]);
          case "airwallex":
            return airwallexConfig_1.AirwallexConfigSerializer._fromJsonObject(object["config"]);
          default:
            throw new Error(`Unexpected type: ${type2}`);
        }
      }
      return {
        type,
        config: getConfig(type),
        metadata: object["metadata"],
        name: object["name"],
        uid: object["uid"]
      };
    },
    _toJsonObject(self) {
      let config;
      switch (self.type) {
        case "generic-webhook":
          config = {};
          break;
        case "cron":
          config = cronConfig_1.CronConfigSerializer._toJsonObject(self.config);
          break;
        case "adobe-sign":
          config = adobeSignConfig_1.AdobeSignConfigSerializer._toJsonObject(self.config);
          break;
        case "beehiiv":
          config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
          break;
        case "brex":
          config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
          break;
        case "checkbook":
          config = checkbookConfig_1.CheckbookConfigSerializer._toJsonObject(self.config);
          break;
        case "clerk":
          config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
          break;
        case "docusign":
          config = docusignConfig_1.DocusignConfigSerializer._toJsonObject(self.config);
          break;
        case "easypost":
          config = easypostConfig_1.EasypostConfigSerializer._toJsonObject(self.config);
          break;
        case "github":
          config = githubConfig_1.GithubConfigSerializer._toJsonObject(self.config);
          break;
        case "guesty":
          config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
          break;
        case "hubspot":
          config = hubspotConfig_1.HubspotConfigSerializer._toJsonObject(self.config);
          break;
        case "incident-io":
          config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
          break;
        case "lithic":
          config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
          break;
        case "nash":
          config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
          break;
        case "orum-io":
          config = orumIoConfig_1.OrumIoConfigSerializer._toJsonObject(self.config);
          break;
        case "panda-doc":
          config = pandaDocConfig_1.PandaDocConfigSerializer._toJsonObject(self.config);
          break;
        case "port-io":
          config = portIoConfig_1.PortIoConfigSerializer._toJsonObject(self.config);
          break;
        case "pleo":
          config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
          break;
        case "replicate":
          config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
          break;
        case "resend":
          config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
          break;
        case "rutter":
          config = rutterConfig_1.RutterConfigSerializer._toJsonObject(self.config);
          break;
        case "safebase":
          config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
          break;
        case "sardine":
          config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
          break;
        case "segment":
          config = segmentConfig_1.SegmentConfigSerializer._toJsonObject(self.config);
          break;
        case "shopify":
          config = shopifyConfig_1.ShopifyConfigSerializer._toJsonObject(self.config);
          break;
        case "slack":
          config = slackConfig_1.SlackConfigSerializer._toJsonObject(self.config);
          break;
        case "stripe":
          config = stripeConfig_1.StripeConfigSerializer._toJsonObject(self.config);
          break;
        case "stych":
          config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
          break;
        case "svix":
          config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
          break;
        case "zoom":
          config = zoomConfig_1.ZoomConfigSerializer._toJsonObject(self.config);
          break;
        case "telnyx":
          config = telnyxConfig_1.TelnyxConfigSerializer._toJsonObject(self.config);
          break;
        case "vapi":
          config = vapiConfig_1.VapiConfigSerializer._toJsonObject(self.config);
          break;
        case "open-ai":
          config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
          break;
        case "render":
          config = svixConfig_1.SvixConfigSerializer._toJsonObject(self.config);
          break;
        case "veriff":
          config = veriffConfig_1.VeriffConfigSerializer._toJsonObject(self.config);
          break;
        case "airwallex":
          config = airwallexConfig_1.AirwallexConfigSerializer._toJsonObject(self.config);
          break;
      }
      return {
        type: self.type,
        config,
        metadata: self.metadata,
        name: self.name,
        uid: self.uid
      };
    }
  };
  return ingestSourceIn;
}
var ingestSourceOut = {};
var adobeSignConfigOut = {};
var hasRequiredAdobeSignConfigOut;
function requireAdobeSignConfigOut() {
  if (hasRequiredAdobeSignConfigOut) return adobeSignConfigOut;
  hasRequiredAdobeSignConfigOut = 1;
  Object.defineProperty(adobeSignConfigOut, "__esModule", { value: true });
  adobeSignConfigOut.AdobeSignConfigOutSerializer = void 0;
  adobeSignConfigOut.AdobeSignConfigOutSerializer = {
    _fromJsonObject(_object) {
      return {};
    },
    _toJsonObject(_self) {
      return {};
    }
  };
  return adobeSignConfigOut;
}
var airwallexConfigOut = {};
var hasRequiredAirwallexConfigOut;
function requireAirwallexConfigOut() {
  if (hasRequiredAirwallexConfigOut) return airwallexConfigOut;
  hasRequiredAirwallexConfigOut = 1;
  Object.defineProperty(airwallexConfigOut, "__esModule", { value: true });
  airwallexConfigOut.AirwallexConfigOutSerializer = void 0;
  airwallexConfigOut.AirwallexConfigOutSerializer = {
    _fromJsonObject(_object) {
      return {};
    },
    _toJsonObject(_self) {
      return {};
    }
  };
  return airwallexConfigOut;
}
var checkbookConfigOut = {};
var hasRequiredCheckbookConfigOut;
function requireCheckbookConfigOut() {
  if (hasRequiredCheckbookConfigOut) return checkbookConfigOut;
  hasRequiredCheckbookConfigOut = 1;
  Object.defineProperty(checkbookConfigOut, "__esModule", { value: true });
  checkbookConfigOut.CheckbookConfigOutSerializer = void 0;
  checkbookConfigOut.CheckbookConfigOutSerializer = {
    _fromJsonObject(_object) {
      return {};
    },
    _toJsonObject(_self) {
      return {};
    }
  };
  return checkbookConfigOut;
}
var docusignConfigOut = {};
var hasRequiredDocusignConfigOut;
function requireDocusignConfigOut() {
  if (hasRequiredDocusignConfigOut) return docusignConfigOut;
  hasRequiredDocusignConfigOut = 1;
  Object.defineProperty(docusignConfigOut, "__esModule", { value: true });
  docusignConfigOut.DocusignConfigOutSerializer = void 0;
  docusignConfigOut.DocusignConfigOutSerializer = {
    _fromJsonObject(_object) {
      return {};
    },
    _toJsonObject(_self) {
      return {};
    }
  };
  return docusignConfigOut;
}
var easypostConfigOut = {};
var hasRequiredEasypostConfigOut;
function requireEasypostConfigOut() {
  if (hasRequiredEasypostConfigOut) return easypostConfigOut;
  hasRequiredEasypostConfigOut = 1;
  Object.defineProperty(easypostConfigOut, "__esModule", { value: true });
  easypostConfigOut.EasypostConfigOutSerializer = void 0;
  easypostConfigOut.EasypostConfigOutSerializer = {
    _fromJsonObject(_object) {
      return {};
    },
    _toJsonObject(_self) {
      return {};
    }
  };
  return easypostConfigOut;
}
var githubConfigOut = {};
var hasRequiredGithubConfigOut;
function requireGithubConfigOut() {
  if (hasRequiredGithubConfigOut) return githubConfigOut;
  hasRequiredGithubConfigOut = 1;
  Object.defineProperty(githubConfigOut, "__esModule", { value: true });
  githubConfigOut.GithubConfigOutSerializer = void 0;
  githubConfigOut.GithubConfigOutSerializer = {
    _fromJsonObject(_object) {
      return {};
    },
    _toJsonObject(_self) {
      return {};
    }
  };
  return githubConfigOut;
}
var hubspotConfigOut = {};
var hasRequiredHubspotConfigOut;
function requireHubspotConfigOut() {
  if (hasRequiredHubspotConfigOut) return hubspotConfigOut;
  hasRequiredHubspotConfigOut = 1;
  Object.defineProperty(hubspotConfigOut, "__esModule", { value: true });
  hubspotConfigOut.HubspotConfigOutSerializer = void 0;
  hubspotConfigOut.HubspotConfigOutSerializer = {
    _fromJsonObject(_object) {
      return {};
    },
    _toJsonObject(_self) {
      return {};
    }
  };
  return hubspotConfigOut;
}
var orumIoConfigOut = {};
var hasRequiredOrumIoConfigOut;
function requireOrumIoConfigOut() {
  if (hasRequiredOrumIoConfigOut) return orumIoConfigOut;
  hasRequiredOrumIoConfigOut = 1;
  Object.defineProperty(orumIoConfigOut, "__esModule", { value: true });
  orumIoConfigOut.OrumIoConfigOutSerializer = void 0;
  orumIoConfigOut.OrumIoConfigOutSerializer = {
    _fromJsonObject(object) {
      return {
        publicKey: object["publicKey"]
      };
    },
    _toJsonObject(self) {
      return {
        publicKey: self.publicKey
      };
    }
  };
  return orumIoConfigOut;
}
var pandaDocConfigOut = {};
var hasRequiredPandaDocConfigOut;
function requirePandaDocConfigOut() {
  if (hasRequiredPandaDocConfigOut) return pandaDocConfigOut;
  hasRequiredPandaDocConfigOut = 1;
  Object.defineProperty(pandaDocConfigOut, "__esModule", { value: true });
  pandaDocConfigOut.PandaDocConfigOutSerializer = void 0;
  pandaDocConfigOut.PandaDocConfigOutSerializer = {
    _fromJsonObject(_object) {
      return {};
    },
    _toJsonObject(_self) {
      return {};
    }
  };
  return pandaDocConfigOut;
}
var portIoConfigOut = {};
var hasRequiredPortIoConfigOut;
function requirePortIoConfigOut() {
  if (hasRequiredPortIoConfigOut) return portIoConfigOut;
  hasRequiredPortIoConfigOut = 1;
  Object.defineProperty(portIoConfigOut, "__esModule", { value: true });
  portIoConfigOut.PortIoConfigOutSerializer = void 0;
  portIoConfigOut.PortIoConfigOutSerializer = {
    _fromJsonObject(_object) {
      return {};
    },
    _toJsonObject(_self) {
      return {};
    }
  };
  return portIoConfigOut;
}
var rutterConfigOut = {};
var hasRequiredRutterConfigOut;
function requireRutterConfigOut() {
  if (hasRequiredRutterConfigOut) return rutterConfigOut;
  hasRequiredRutterConfigOut = 1;
  Object.defineProperty(rutterConfigOut, "__esModule", { value: true });
  rutterConfigOut.RutterConfigOutSerializer = void 0;
  rutterConfigOut.RutterConfigOutSerializer = {
    _fromJsonObject(_object) {
      return {};
    },
    _toJsonObject(_self) {
      return {};
    }
  };
  return rutterConfigOut;
}
var segmentConfigOut = {};
var hasRequiredSegmentConfigOut;
function requireSegmentConfigOut() {
  if (hasRequiredSegmentConfigOut) return segmentConfigOut;
  hasRequiredSegmentConfigOut = 1;
  Object.defineProperty(segmentConfigOut, "__esModule", { value: true });
  segmentConfigOut.SegmentConfigOutSerializer = void 0;
  segmentConfigOut.SegmentConfigOutSerializer = {
    _fromJsonObject(_object) {
      return {};
    },
    _toJsonObject(_self) {
      return {};
    }
  };
  return segmentConfigOut;
}
var shopifyConfigOut = {};
var hasRequiredShopifyConfigOut;
function requireShopifyConfigOut() {
  if (hasRequiredShopifyConfigOut) return shopifyConfigOut;
  hasRequiredShopifyConfigOut = 1;
  Object.defineProperty(shopifyConfigOut, "__esModule", { value: true });
  shopifyConfigOut.ShopifyConfigOutSerializer = void 0;
  shopifyConfigOut.ShopifyConfigOutSerializer = {
    _fromJsonObject(_object) {
      return {};
    },
    _toJsonObject(_self) {
      return {};
    }
  };
  return shopifyConfigOut;
}
var slackConfigOut = {};
var hasRequiredSlackConfigOut;
function requireSlackConfigOut() {
  if (hasRequiredSlackConfigOut) return slackConfigOut;
  hasRequiredSlackConfigOut = 1;
  Object.defineProperty(slackConfigOut, "__esModule", { value: true });
  slackConfigOut.SlackConfigOutSerializer = void 0;
  slackConfigOut.SlackConfigOutSerializer = {
    _fromJsonObject(_object) {
      return {};
    },
    _toJsonObject(_self) {
      return {};
    }
  };
  return slackConfigOut;
}
var stripeConfigOut = {};
var hasRequiredStripeConfigOut;
function requireStripeConfigOut() {
  if (hasRequiredStripeConfigOut) return stripeConfigOut;
  hasRequiredStripeConfigOut = 1;
  Object.defineProperty(stripeConfigOut, "__esModule", { value: true });
  stripeConfigOut.StripeConfigOutSerializer = void 0;
  stripeConfigOut.StripeConfigOutSerializer = {
    _fromJsonObject(_object) {
      return {};
    },
    _toJsonObject(_self) {
      return {};
    }
  };
  return stripeConfigOut;
}
var svixConfigOut = {};
var hasRequiredSvixConfigOut;
function requireSvixConfigOut() {
  if (hasRequiredSvixConfigOut) return svixConfigOut;
  hasRequiredSvixConfigOut = 1;
  Object.defineProperty(svixConfigOut, "__esModule", { value: true });
  svixConfigOut.SvixConfigOutSerializer = void 0;
  svixConfigOut.SvixConfigOutSerializer = {
    _fromJsonObject(_object) {
      return {};
    },
    _toJsonObject(_self) {
      return {};
    }
  };
  return svixConfigOut;
}
var telnyxConfigOut = {};
var hasRequiredTelnyxConfigOut;
function requireTelnyxConfigOut() {
  if (hasRequiredTelnyxConfigOut) return telnyxConfigOut;
  hasRequiredTelnyxConfigOut = 1;
  Object.defineProperty(telnyxConfigOut, "__esModule", { value: true });
  telnyxConfigOut.TelnyxConfigOutSerializer = void 0;
  telnyxConfigOut.TelnyxConfigOutSerializer = {
    _fromJsonObject(object) {
      return {
        publicKey: object["publicKey"]
      };
    },
    _toJsonObject(self) {
      return {
        publicKey: self.publicKey
      };
    }
  };
  return telnyxConfigOut;
}
var vapiConfigOut = {};
var hasRequiredVapiConfigOut;
function requireVapiConfigOut() {
  if (hasRequiredVapiConfigOut) return vapiConfigOut;
  hasRequiredVapiConfigOut = 1;
  Object.defineProperty(vapiConfigOut, "__esModule", { value: true });
  vapiConfigOut.VapiConfigOutSerializer = void 0;
  vapiConfigOut.VapiConfigOutSerializer = {
    _fromJsonObject(_object) {
      return {};
    },
    _toJsonObject(_self) {
      return {};
    }
  };
  return vapiConfigOut;
}
var veriffConfigOut = {};
var hasRequiredVeriffConfigOut;
function requireVeriffConfigOut() {
  if (hasRequiredVeriffConfigOut) return veriffConfigOut;
  hasRequiredVeriffConfigOut = 1;
  Object.defineProperty(veriffConfigOut, "__esModule", { value: true });
  veriffConfigOut.VeriffConfigOutSerializer = void 0;
  veriffConfigOut.VeriffConfigOutSerializer = {
    _fromJsonObject(_object) {
      return {};
    },
    _toJsonObject(_self) {
      return {};
    }
  };
  return veriffConfigOut;
}
var zoomConfigOut = {};
var hasRequiredZoomConfigOut;
function requireZoomConfigOut() {
  if (hasRequiredZoomConfigOut) return zoomConfigOut;
  hasRequiredZoomConfigOut = 1;
  Object.defineProperty(zoomConfigOut, "__esModule", { value: true });
  zoomConfigOut.ZoomConfigOutSerializer = void 0;
  zoomConfigOut.ZoomConfigOutSerializer = {
    _fromJsonObject(_object) {
      return {};
    },
    _toJsonObject(_self) {
      return {};
    }
  };
  return zoomConfigOut;
}
var hasRequiredIngestSourceOut;
function requireIngestSourceOut() {
  if (hasRequiredIngestSourceOut) return ingestSourceOut;
  hasRequiredIngestSourceOut = 1;
  Object.defineProperty(ingestSourceOut, "__esModule", { value: true });
  ingestSourceOut.IngestSourceOutSerializer = void 0;
  const adobeSignConfigOut_1 = requireAdobeSignConfigOut();
  const airwallexConfigOut_1 = requireAirwallexConfigOut();
  const checkbookConfigOut_1 = requireCheckbookConfigOut();
  const cronConfig_1 = requireCronConfig();
  const docusignConfigOut_1 = requireDocusignConfigOut();
  const easypostConfigOut_1 = requireEasypostConfigOut();
  const githubConfigOut_1 = requireGithubConfigOut();
  const hubspotConfigOut_1 = requireHubspotConfigOut();
  const orumIoConfigOut_1 = requireOrumIoConfigOut();
  const pandaDocConfigOut_1 = requirePandaDocConfigOut();
  const portIoConfigOut_1 = requirePortIoConfigOut();
  const rutterConfigOut_1 = requireRutterConfigOut();
  const segmentConfigOut_1 = requireSegmentConfigOut();
  const shopifyConfigOut_1 = requireShopifyConfigOut();
  const slackConfigOut_1 = requireSlackConfigOut();
  const stripeConfigOut_1 = requireStripeConfigOut();
  const svixConfigOut_1 = requireSvixConfigOut();
  const telnyxConfigOut_1 = requireTelnyxConfigOut();
  const vapiConfigOut_1 = requireVapiConfigOut();
  const veriffConfigOut_1 = requireVeriffConfigOut();
  const zoomConfigOut_1 = requireZoomConfigOut();
  ingestSourceOut.IngestSourceOutSerializer = {
    _fromJsonObject(object) {
      const type = object["type"];
      function getConfig(type2) {
        switch (type2) {
          case "generic-webhook":
            return {};
          case "cron":
            return cronConfig_1.CronConfigSerializer._fromJsonObject(object["config"]);
          case "adobe-sign":
            return adobeSignConfigOut_1.AdobeSignConfigOutSerializer._fromJsonObject(object["config"]);
          case "beehiiv":
            return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
          case "brex":
            return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
          case "checkbook":
            return checkbookConfigOut_1.CheckbookConfigOutSerializer._fromJsonObject(object["config"]);
          case "clerk":
            return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
          case "docusign":
            return docusignConfigOut_1.DocusignConfigOutSerializer._fromJsonObject(object["config"]);
          case "easypost":
            return easypostConfigOut_1.EasypostConfigOutSerializer._fromJsonObject(object["config"]);
          case "github":
            return githubConfigOut_1.GithubConfigOutSerializer._fromJsonObject(object["config"]);
          case "guesty":
            return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
          case "hubspot":
            return hubspotConfigOut_1.HubspotConfigOutSerializer._fromJsonObject(object["config"]);
          case "incident-io":
            return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
          case "lithic":
            return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
          case "nash":
            return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
          case "orum-io":
            return orumIoConfigOut_1.OrumIoConfigOutSerializer._fromJsonObject(object["config"]);
          case "panda-doc":
            return pandaDocConfigOut_1.PandaDocConfigOutSerializer._fromJsonObject(object["config"]);
          case "port-io":
            return portIoConfigOut_1.PortIoConfigOutSerializer._fromJsonObject(object["config"]);
          case "pleo":
            return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
          case "replicate":
            return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
          case "resend":
            return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
          case "rutter":
            return rutterConfigOut_1.RutterConfigOutSerializer._fromJsonObject(object["config"]);
          case "safebase":
            return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
          case "sardine":
            return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
          case "segment":
            return segmentConfigOut_1.SegmentConfigOutSerializer._fromJsonObject(object["config"]);
          case "shopify":
            return shopifyConfigOut_1.ShopifyConfigOutSerializer._fromJsonObject(object["config"]);
          case "slack":
            return slackConfigOut_1.SlackConfigOutSerializer._fromJsonObject(object["config"]);
          case "stripe":
            return stripeConfigOut_1.StripeConfigOutSerializer._fromJsonObject(object["config"]);
          case "stych":
            return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
          case "svix":
            return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
          case "zoom":
            return zoomConfigOut_1.ZoomConfigOutSerializer._fromJsonObject(object["config"]);
          case "telnyx":
            return telnyxConfigOut_1.TelnyxConfigOutSerializer._fromJsonObject(object["config"]);
          case "vapi":
            return vapiConfigOut_1.VapiConfigOutSerializer._fromJsonObject(object["config"]);
          case "open-ai":
            return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
          case "render":
            return svixConfigOut_1.SvixConfigOutSerializer._fromJsonObject(object["config"]);
          case "veriff":
            return veriffConfigOut_1.VeriffConfigOutSerializer._fromJsonObject(object["config"]);
          case "airwallex":
            return airwallexConfigOut_1.AirwallexConfigOutSerializer._fromJsonObject(object["config"]);
          default:
            throw new Error(`Unexpected type: ${type2}`);
        }
      }
      return {
        type,
        config: getConfig(type),
        createdAt: new Date(object["createdAt"]),
        id: object["id"],
        ingestUrl: object["ingestUrl"],
        metadata: object["metadata"],
        name: object["name"],
        uid: object["uid"],
        updatedAt: new Date(object["updatedAt"])
      };
    },
    _toJsonObject(self) {
      let config;
      switch (self.type) {
        case "generic-webhook":
          config = {};
          break;
        case "cron":
          config = cronConfig_1.CronConfigSerializer._toJsonObject(self.config);
          break;
        case "adobe-sign":
          config = adobeSignConfigOut_1.AdobeSignConfigOutSerializer._toJsonObject(self.config);
          break;
        case "beehiiv":
          config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
          break;
        case "brex":
          config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
          break;
        case "checkbook":
          config = checkbookConfigOut_1.CheckbookConfigOutSerializer._toJsonObject(self.config);
          break;
        case "clerk":
          config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
          break;
        case "docusign":
          config = docusignConfigOut_1.DocusignConfigOutSerializer._toJsonObject(self.config);
          break;
        case "easypost":
          config = easypostConfigOut_1.EasypostConfigOutSerializer._toJsonObject(self.config);
          break;
        case "github":
          config = githubConfigOut_1.GithubConfigOutSerializer._toJsonObject(self.config);
          break;
        case "guesty":
          config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
          break;
        case "hubspot":
          config = hubspotConfigOut_1.HubspotConfigOutSerializer._toJsonObject(self.config);
          break;
        case "incident-io":
          config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
          break;
        case "lithic":
          config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
          break;
        case "nash":
          config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
          break;
        case "orum-io":
          config = orumIoConfigOut_1.OrumIoConfigOutSerializer._toJsonObject(self.config);
          break;
        case "panda-doc":
          config = pandaDocConfigOut_1.PandaDocConfigOutSerializer._toJsonObject(self.config);
          break;
        case "port-io":
          config = portIoConfigOut_1.PortIoConfigOutSerializer._toJsonObject(self.config);
          break;
        case "pleo":
          config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
          break;
        case "replicate":
          config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
          break;
        case "resend":
          config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
          break;
        case "rutter":
          config = rutterConfigOut_1.RutterConfigOutSerializer._toJsonObject(self.config);
          break;
        case "safebase":
          config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
          break;
        case "sardine":
          config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
          break;
        case "segment":
          config = segmentConfigOut_1.SegmentConfigOutSerializer._toJsonObject(self.config);
          break;
        case "shopify":
          config = shopifyConfigOut_1.ShopifyConfigOutSerializer._toJsonObject(self.config);
          break;
        case "slack":
          config = slackConfigOut_1.SlackConfigOutSerializer._toJsonObject(self.config);
          break;
        case "stripe":
          config = stripeConfigOut_1.StripeConfigOutSerializer._toJsonObject(self.config);
          break;
        case "stych":
          config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
          break;
        case "svix":
          config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
          break;
        case "zoom":
          config = zoomConfigOut_1.ZoomConfigOutSerializer._toJsonObject(self.config);
          break;
        case "telnyx":
          config = telnyxConfigOut_1.TelnyxConfigOutSerializer._toJsonObject(self.config);
          break;
        case "vapi":
          config = vapiConfigOut_1.VapiConfigOutSerializer._toJsonObject(self.config);
          break;
        case "open-ai":
          config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
          break;
        case "render":
          config = svixConfigOut_1.SvixConfigOutSerializer._toJsonObject(self.config);
          break;
        case "veriff":
          config = veriffConfigOut_1.VeriffConfigOutSerializer._toJsonObject(self.config);
          break;
        case "airwallex":
          config = airwallexConfigOut_1.AirwallexConfigOutSerializer._toJsonObject(self.config);
          break;
      }
      return {
        type: self.type,
        config,
        createdAt: self.createdAt,
        id: self.id,
        ingestUrl: self.ingestUrl,
        metadata: self.metadata,
        name: self.name,
        uid: self.uid,
        updatedAt: self.updatedAt
      };
    }
  };
  return ingestSourceOut;
}
var listResponseIngestSourceOut = {};
var hasRequiredListResponseIngestSourceOut;
function requireListResponseIngestSourceOut() {
  if (hasRequiredListResponseIngestSourceOut) return listResponseIngestSourceOut;
  hasRequiredListResponseIngestSourceOut = 1;
  Object.defineProperty(listResponseIngestSourceOut, "__esModule", { value: true });
  listResponseIngestSourceOut.ListResponseIngestSourceOutSerializer = void 0;
  const ingestSourceOut_1 = requireIngestSourceOut();
  listResponseIngestSourceOut.ListResponseIngestSourceOutSerializer = {
    _fromJsonObject(object) {
      return {
        data: object["data"].map((item) => ingestSourceOut_1.IngestSourceOutSerializer._fromJsonObject(item)),
        done: object["done"],
        iterator: object["iterator"],
        prevIterator: object["prevIterator"]
      };
    },
    _toJsonObject(self) {
      return {
        data: self.data.map((item) => ingestSourceOut_1.IngestSourceOutSerializer._toJsonObject(item)),
        done: self.done,
        iterator: self.iterator,
        prevIterator: self.prevIterator
      };
    }
  };
  return listResponseIngestSourceOut;
}
var rotateTokenOut = {};
var hasRequiredRotateTokenOut;
function requireRotateTokenOut() {
  if (hasRequiredRotateTokenOut) return rotateTokenOut;
  hasRequiredRotateTokenOut = 1;
  Object.defineProperty(rotateTokenOut, "__esModule", { value: true });
  rotateTokenOut.RotateTokenOutSerializer = void 0;
  rotateTokenOut.RotateTokenOutSerializer = {
    _fromJsonObject(object) {
      return {
        ingestUrl: object["ingestUrl"]
      };
    },
    _toJsonObject(self) {
      return {
        ingestUrl: self.ingestUrl
      };
    }
  };
  return rotateTokenOut;
}
var hasRequiredIngestSource;
function requireIngestSource() {
  if (hasRequiredIngestSource) return ingestSource;
  hasRequiredIngestSource = 1;
  Object.defineProperty(ingestSource, "__esModule", { value: true });
  ingestSource.IngestSource = void 0;
  const ingestSourceIn_1 = requireIngestSourceIn();
  const ingestSourceOut_1 = requireIngestSourceOut();
  const listResponseIngestSourceOut_1 = requireListResponseIngestSourceOut();
  const rotateTokenOut_1 = requireRotateTokenOut();
  const request_1 = requireRequest();
  class IngestSource {
    constructor(requestCtx) {
      this.requestCtx = requestCtx;
    }
    list(options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source");
      request2.setQueryParams({
        limit: options === null || options === void 0 ? void 0 : options.limit,
        iterator: options === null || options === void 0 ? void 0 : options.iterator,
        order: options === null || options === void 0 ? void 0 : options.order
      });
      return request2.send(this.requestCtx, listResponseIngestSourceOut_1.ListResponseIngestSourceOutSerializer._fromJsonObject);
    }
    create(ingestSourceIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/ingest/api/v1/source");
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(ingestSourceIn_1.IngestSourceInSerializer._toJsonObject(ingestSourceIn2));
      return request2.send(this.requestCtx, ingestSourceOut_1.IngestSourceOutSerializer._fromJsonObject);
    }
    get(sourceId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/ingest/api/v1/source/{source_id}");
      request2.setPathParam("source_id", sourceId);
      return request2.send(this.requestCtx, ingestSourceOut_1.IngestSourceOutSerializer._fromJsonObject);
    }
    update(sourceId, ingestSourceIn2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/ingest/api/v1/source/{source_id}");
      request2.setPathParam("source_id", sourceId);
      request2.setBody(ingestSourceIn_1.IngestSourceInSerializer._toJsonObject(ingestSourceIn2));
      return request2.send(this.requestCtx, ingestSourceOut_1.IngestSourceOutSerializer._fromJsonObject);
    }
    delete(sourceId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/ingest/api/v1/source/{source_id}");
      request2.setPathParam("source_id", sourceId);
      return request2.sendNoResponseBody(this.requestCtx);
    }
    rotateToken(sourceId, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/ingest/api/v1/source/{source_id}/token/rotate");
      request2.setPathParam("source_id", sourceId);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      return request2.send(this.requestCtx, rotateTokenOut_1.RotateTokenOutSerializer._fromJsonObject);
    }
  }
  ingestSource.IngestSource = IngestSource;
  return ingestSource;
}
var hasRequiredIngest;
function requireIngest() {
  if (hasRequiredIngest) return ingest;
  hasRequiredIngest = 1;
  Object.defineProperty(ingest, "__esModule", { value: true });
  ingest.Ingest = void 0;
  const dashboardAccessOut_1 = requireDashboardAccessOut();
  const ingestSourceConsumerPortalAccessIn_1 = requireIngestSourceConsumerPortalAccessIn();
  const ingestEndpoint_1 = requireIngestEndpoint();
  const ingestSource_1 = requireIngestSource();
  const request_1 = requireRequest();
  class Ingest {
    constructor(requestCtx) {
      this.requestCtx = requestCtx;
    }
    get endpoint() {
      return new ingestEndpoint_1.IngestEndpoint(this.requestCtx);
    }
    get source() {
      return new ingestSource_1.IngestSource(this.requestCtx);
    }
    dashboard(sourceId, ingestSourceConsumerPortalAccessIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/ingest/api/v1/source/{source_id}/dashboard");
      request2.setPathParam("source_id", sourceId);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(ingestSourceConsumerPortalAccessIn_1.IngestSourceConsumerPortalAccessInSerializer._toJsonObject(ingestSourceConsumerPortalAccessIn2));
      return request2.send(this.requestCtx, dashboardAccessOut_1.DashboardAccessOutSerializer._fromJsonObject);
    }
  }
  ingest.Ingest = Ingest;
  return ingest;
}
var integration = {};
var integrationIn = {};
var hasRequiredIntegrationIn;
function requireIntegrationIn() {
  if (hasRequiredIntegrationIn) return integrationIn;
  hasRequiredIntegrationIn = 1;
  Object.defineProperty(integrationIn, "__esModule", { value: true });
  integrationIn.IntegrationInSerializer = void 0;
  integrationIn.IntegrationInSerializer = {
    _fromJsonObject(object) {
      return {
        featureFlags: object["featureFlags"],
        name: object["name"]
      };
    },
    _toJsonObject(self) {
      return {
        featureFlags: self.featureFlags,
        name: self.name
      };
    }
  };
  return integrationIn;
}
var integrationKeyOut = {};
var hasRequiredIntegrationKeyOut;
function requireIntegrationKeyOut() {
  if (hasRequiredIntegrationKeyOut) return integrationKeyOut;
  hasRequiredIntegrationKeyOut = 1;
  Object.defineProperty(integrationKeyOut, "__esModule", { value: true });
  integrationKeyOut.IntegrationKeyOutSerializer = void 0;
  integrationKeyOut.IntegrationKeyOutSerializer = {
    _fromJsonObject(object) {
      return {
        key: object["key"]
      };
    },
    _toJsonObject(self) {
      return {
        key: self.key
      };
    }
  };
  return integrationKeyOut;
}
var integrationOut = {};
var hasRequiredIntegrationOut;
function requireIntegrationOut() {
  if (hasRequiredIntegrationOut) return integrationOut;
  hasRequiredIntegrationOut = 1;
  Object.defineProperty(integrationOut, "__esModule", { value: true });
  integrationOut.IntegrationOutSerializer = void 0;
  integrationOut.IntegrationOutSerializer = {
    _fromJsonObject(object) {
      return {
        createdAt: new Date(object["createdAt"]),
        featureFlags: object["featureFlags"],
        id: object["id"],
        name: object["name"],
        updatedAt: new Date(object["updatedAt"])
      };
    },
    _toJsonObject(self) {
      return {
        createdAt: self.createdAt,
        featureFlags: self.featureFlags,
        id: self.id,
        name: self.name,
        updatedAt: self.updatedAt
      };
    }
  };
  return integrationOut;
}
var integrationUpdate = {};
var hasRequiredIntegrationUpdate;
function requireIntegrationUpdate() {
  if (hasRequiredIntegrationUpdate) return integrationUpdate;
  hasRequiredIntegrationUpdate = 1;
  Object.defineProperty(integrationUpdate, "__esModule", { value: true });
  integrationUpdate.IntegrationUpdateSerializer = void 0;
  integrationUpdate.IntegrationUpdateSerializer = {
    _fromJsonObject(object) {
      return {
        featureFlags: object["featureFlags"],
        name: object["name"]
      };
    },
    _toJsonObject(self) {
      return {
        featureFlags: self.featureFlags,
        name: self.name
      };
    }
  };
  return integrationUpdate;
}
var listResponseIntegrationOut = {};
var hasRequiredListResponseIntegrationOut;
function requireListResponseIntegrationOut() {
  if (hasRequiredListResponseIntegrationOut) return listResponseIntegrationOut;
  hasRequiredListResponseIntegrationOut = 1;
  Object.defineProperty(listResponseIntegrationOut, "__esModule", { value: true });
  listResponseIntegrationOut.ListResponseIntegrationOutSerializer = void 0;
  const integrationOut_1 = requireIntegrationOut();
  listResponseIntegrationOut.ListResponseIntegrationOutSerializer = {
    _fromJsonObject(object) {
      return {
        data: object["data"].map((item) => integrationOut_1.IntegrationOutSerializer._fromJsonObject(item)),
        done: object["done"],
        iterator: object["iterator"],
        prevIterator: object["prevIterator"]
      };
    },
    _toJsonObject(self) {
      return {
        data: self.data.map((item) => integrationOut_1.IntegrationOutSerializer._toJsonObject(item)),
        done: self.done,
        iterator: self.iterator,
        prevIterator: self.prevIterator
      };
    }
  };
  return listResponseIntegrationOut;
}
var hasRequiredIntegration;
function requireIntegration() {
  if (hasRequiredIntegration) return integration;
  hasRequiredIntegration = 1;
  Object.defineProperty(integration, "__esModule", { value: true });
  integration.Integration = void 0;
  const integrationIn_1 = requireIntegrationIn();
  const integrationKeyOut_1 = requireIntegrationKeyOut();
  const integrationOut_1 = requireIntegrationOut();
  const integrationUpdate_1 = requireIntegrationUpdate();
  const listResponseIntegrationOut_1 = requireListResponseIntegrationOut();
  const request_1 = requireRequest();
  class Integration {
    constructor(requestCtx) {
      this.requestCtx = requestCtx;
    }
    list(appId, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/integration");
      request2.setPathParam("app_id", appId);
      request2.setQueryParams({
        limit: options === null || options === void 0 ? void 0 : options.limit,
        iterator: options === null || options === void 0 ? void 0 : options.iterator,
        order: options === null || options === void 0 ? void 0 : options.order
      });
      return request2.send(this.requestCtx, listResponseIntegrationOut_1.ListResponseIntegrationOutSerializer._fromJsonObject);
    }
    create(appId, integrationIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/integration");
      request2.setPathParam("app_id", appId);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(integrationIn_1.IntegrationInSerializer._toJsonObject(integrationIn2));
      return request2.send(this.requestCtx, integrationOut_1.IntegrationOutSerializer._fromJsonObject);
    }
    get(appId, integId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/integration/{integ_id}");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("integ_id", integId);
      return request2.send(this.requestCtx, integrationOut_1.IntegrationOutSerializer._fromJsonObject);
    }
    update(appId, integId, integrationUpdate2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/app/{app_id}/integration/{integ_id}");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("integ_id", integId);
      request2.setBody(integrationUpdate_1.IntegrationUpdateSerializer._toJsonObject(integrationUpdate2));
      return request2.send(this.requestCtx, integrationOut_1.IntegrationOutSerializer._fromJsonObject);
    }
    delete(appId, integId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/app/{app_id}/integration/{integ_id}");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("integ_id", integId);
      return request2.sendNoResponseBody(this.requestCtx);
    }
    getKey(appId, integId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/integration/{integ_id}/key");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("integ_id", integId);
      return request2.send(this.requestCtx, integrationKeyOut_1.IntegrationKeyOutSerializer._fromJsonObject);
    }
    rotateKey(appId, integId, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/integration/{integ_id}/key/rotate");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("integ_id", integId);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      return request2.send(this.requestCtx, integrationKeyOut_1.IntegrationKeyOutSerializer._fromJsonObject);
    }
  }
  integration.Integration = Integration;
  return integration;
}
var message = {};
var expungeAllContentsOut = {};
var hasRequiredExpungeAllContentsOut;
function requireExpungeAllContentsOut() {
  if (hasRequiredExpungeAllContentsOut) return expungeAllContentsOut;
  hasRequiredExpungeAllContentsOut = 1;
  Object.defineProperty(expungeAllContentsOut, "__esModule", { value: true });
  expungeAllContentsOut.ExpungeAllContentsOutSerializer = void 0;
  const backgroundTaskStatus_1 = requireBackgroundTaskStatus();
  const backgroundTaskType_1 = requireBackgroundTaskType();
  expungeAllContentsOut.ExpungeAllContentsOutSerializer = {
    _fromJsonObject(object) {
      return {
        id: object["id"],
        status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
        task: backgroundTaskType_1.BackgroundTaskTypeSerializer._fromJsonObject(object["task"])
      };
    },
    _toJsonObject(self) {
      return {
        id: self.id,
        status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._toJsonObject(self.status),
        task: backgroundTaskType_1.BackgroundTaskTypeSerializer._toJsonObject(self.task)
      };
    }
  };
  return expungeAllContentsOut;
}
var listResponseMessageOut = {};
var hasRequiredListResponseMessageOut;
function requireListResponseMessageOut() {
  if (hasRequiredListResponseMessageOut) return listResponseMessageOut;
  hasRequiredListResponseMessageOut = 1;
  Object.defineProperty(listResponseMessageOut, "__esModule", { value: true });
  listResponseMessageOut.ListResponseMessageOutSerializer = void 0;
  const messageOut_1 = requireMessageOut();
  listResponseMessageOut.ListResponseMessageOutSerializer = {
    _fromJsonObject(object) {
      return {
        data: object["data"].map((item) => messageOut_1.MessageOutSerializer._fromJsonObject(item)),
        done: object["done"],
        iterator: object["iterator"],
        prevIterator: object["prevIterator"]
      };
    },
    _toJsonObject(self) {
      return {
        data: self.data.map((item) => messageOut_1.MessageOutSerializer._toJsonObject(item)),
        done: self.done,
        iterator: self.iterator,
        prevIterator: self.prevIterator
      };
    }
  };
  return listResponseMessageOut;
}
var messagePrecheckIn = {};
var hasRequiredMessagePrecheckIn;
function requireMessagePrecheckIn() {
  if (hasRequiredMessagePrecheckIn) return messagePrecheckIn;
  hasRequiredMessagePrecheckIn = 1;
  Object.defineProperty(messagePrecheckIn, "__esModule", { value: true });
  messagePrecheckIn.MessagePrecheckInSerializer = void 0;
  messagePrecheckIn.MessagePrecheckInSerializer = {
    _fromJsonObject(object) {
      return {
        channels: object["channels"],
        eventType: object["eventType"]
      };
    },
    _toJsonObject(self) {
      return {
        channels: self.channels,
        eventType: self.eventType
      };
    }
  };
  return messagePrecheckIn;
}
var messagePrecheckOut = {};
var hasRequiredMessagePrecheckOut;
function requireMessagePrecheckOut() {
  if (hasRequiredMessagePrecheckOut) return messagePrecheckOut;
  hasRequiredMessagePrecheckOut = 1;
  Object.defineProperty(messagePrecheckOut, "__esModule", { value: true });
  messagePrecheckOut.MessagePrecheckOutSerializer = void 0;
  messagePrecheckOut.MessagePrecheckOutSerializer = {
    _fromJsonObject(object) {
      return {
        active: object["active"]
      };
    },
    _toJsonObject(self) {
      return {
        active: self.active
      };
    }
  };
  return messagePrecheckOut;
}
var messagePoller = {};
var pollingEndpointConsumerSeekIn = {};
var hasRequiredPollingEndpointConsumerSeekIn;
function requirePollingEndpointConsumerSeekIn() {
  if (hasRequiredPollingEndpointConsumerSeekIn) return pollingEndpointConsumerSeekIn;
  hasRequiredPollingEndpointConsumerSeekIn = 1;
  Object.defineProperty(pollingEndpointConsumerSeekIn, "__esModule", { value: true });
  pollingEndpointConsumerSeekIn.PollingEndpointConsumerSeekInSerializer = void 0;
  pollingEndpointConsumerSeekIn.PollingEndpointConsumerSeekInSerializer = {
    _fromJsonObject(object) {
      return {
        after: new Date(object["after"])
      };
    },
    _toJsonObject(self) {
      return {
        after: self.after
      };
    }
  };
  return pollingEndpointConsumerSeekIn;
}
var pollingEndpointConsumerSeekOut = {};
var hasRequiredPollingEndpointConsumerSeekOut;
function requirePollingEndpointConsumerSeekOut() {
  if (hasRequiredPollingEndpointConsumerSeekOut) return pollingEndpointConsumerSeekOut;
  hasRequiredPollingEndpointConsumerSeekOut = 1;
  Object.defineProperty(pollingEndpointConsumerSeekOut, "__esModule", { value: true });
  pollingEndpointConsumerSeekOut.PollingEndpointConsumerSeekOutSerializer = void 0;
  pollingEndpointConsumerSeekOut.PollingEndpointConsumerSeekOutSerializer = {
    _fromJsonObject(object) {
      return {
        iterator: object["iterator"]
      };
    },
    _toJsonObject(self) {
      return {
        iterator: self.iterator
      };
    }
  };
  return pollingEndpointConsumerSeekOut;
}
var pollingEndpointOut = {};
var pollingEndpointMessageOut = {};
var hasRequiredPollingEndpointMessageOut;
function requirePollingEndpointMessageOut() {
  if (hasRequiredPollingEndpointMessageOut) return pollingEndpointMessageOut;
  hasRequiredPollingEndpointMessageOut = 1;
  Object.defineProperty(pollingEndpointMessageOut, "__esModule", { value: true });
  pollingEndpointMessageOut.PollingEndpointMessageOutSerializer = void 0;
  pollingEndpointMessageOut.PollingEndpointMessageOutSerializer = {
    _fromJsonObject(object) {
      return {
        channels: object["channels"],
        deliverAt: object["deliverAt"] ? new Date(object["deliverAt"]) : null,
        eventId: object["eventId"],
        eventType: object["eventType"],
        headers: object["headers"],
        id: object["id"],
        payload: object["payload"],
        tags: object["tags"],
        timestamp: new Date(object["timestamp"])
      };
    },
    _toJsonObject(self) {
      return {
        channels: self.channels,
        deliverAt: self.deliverAt,
        eventId: self.eventId,
        eventType: self.eventType,
        headers: self.headers,
        id: self.id,
        payload: self.payload,
        tags: self.tags,
        timestamp: self.timestamp
      };
    }
  };
  return pollingEndpointMessageOut;
}
var hasRequiredPollingEndpointOut;
function requirePollingEndpointOut() {
  if (hasRequiredPollingEndpointOut) return pollingEndpointOut;
  hasRequiredPollingEndpointOut = 1;
  Object.defineProperty(pollingEndpointOut, "__esModule", { value: true });
  pollingEndpointOut.PollingEndpointOutSerializer = void 0;
  const pollingEndpointMessageOut_1 = requirePollingEndpointMessageOut();
  pollingEndpointOut.PollingEndpointOutSerializer = {
    _fromJsonObject(object) {
      return {
        data: object["data"].map((item) => pollingEndpointMessageOut_1.PollingEndpointMessageOutSerializer._fromJsonObject(item)),
        done: object["done"],
        iterator: object["iterator"]
      };
    },
    _toJsonObject(self) {
      return {
        data: self.data.map((item) => pollingEndpointMessageOut_1.PollingEndpointMessageOutSerializer._toJsonObject(item)),
        done: self.done,
        iterator: self.iterator
      };
    }
  };
  return pollingEndpointOut;
}
var hasRequiredMessagePoller;
function requireMessagePoller() {
  if (hasRequiredMessagePoller) return messagePoller;
  hasRequiredMessagePoller = 1;
  Object.defineProperty(messagePoller, "__esModule", { value: true });
  messagePoller.MessagePoller = void 0;
  const pollingEndpointConsumerSeekIn_1 = requirePollingEndpointConsumerSeekIn();
  const pollingEndpointConsumerSeekOut_1 = requirePollingEndpointConsumerSeekOut();
  const pollingEndpointOut_1 = requirePollingEndpointOut();
  const request_1 = requireRequest();
  class MessagePoller {
    constructor(requestCtx) {
      this.requestCtx = requestCtx;
    }
    poll(appId, sinkId, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/poller/{sink_id}");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("sink_id", sinkId);
      request2.setQueryParams({
        limit: options === null || options === void 0 ? void 0 : options.limit,
        iterator: options === null || options === void 0 ? void 0 : options.iterator,
        event_type: options === null || options === void 0 ? void 0 : options.eventType,
        channel: options === null || options === void 0 ? void 0 : options.channel,
        after: options === null || options === void 0 ? void 0 : options.after
      });
      return request2.send(this.requestCtx, pollingEndpointOut_1.PollingEndpointOutSerializer._fromJsonObject);
    }
    consumerPoll(appId, sinkId, consumerId, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/poller/{sink_id}/consumer/{consumer_id}");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("sink_id", sinkId);
      request2.setPathParam("consumer_id", consumerId);
      request2.setQueryParams({
        limit: options === null || options === void 0 ? void 0 : options.limit,
        iterator: options === null || options === void 0 ? void 0 : options.iterator
      });
      return request2.send(this.requestCtx, pollingEndpointOut_1.PollingEndpointOutSerializer._fromJsonObject);
    }
    consumerSeek(appId, sinkId, consumerId, pollingEndpointConsumerSeekIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/poller/{sink_id}/consumer/{consumer_id}/seek");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("sink_id", sinkId);
      request2.setPathParam("consumer_id", consumerId);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(pollingEndpointConsumerSeekIn_1.PollingEndpointConsumerSeekInSerializer._toJsonObject(pollingEndpointConsumerSeekIn2));
      return request2.send(this.requestCtx, pollingEndpointConsumerSeekOut_1.PollingEndpointConsumerSeekOutSerializer._fromJsonObject);
    }
  }
  messagePoller.MessagePoller = MessagePoller;
  return messagePoller;
}
var messageIn = {};
var hasRequiredMessageIn;
function requireMessageIn() {
  if (hasRequiredMessageIn) return messageIn;
  hasRequiredMessageIn = 1;
  Object.defineProperty(messageIn, "__esModule", { value: true });
  messageIn.MessageInSerializer = void 0;
  const applicationIn_1 = requireApplicationIn();
  messageIn.MessageInSerializer = {
    _fromJsonObject(object) {
      return {
        application: object["application"] != null ? applicationIn_1.ApplicationInSerializer._fromJsonObject(object["application"]) : void 0,
        channels: object["channels"],
        deliverAt: object["deliverAt"] ? new Date(object["deliverAt"]) : null,
        eventId: object["eventId"],
        eventType: object["eventType"],
        payload: object["payload"],
        payloadRetentionHours: object["payloadRetentionHours"],
        payloadRetentionPeriod: object["payloadRetentionPeriod"],
        tags: object["tags"],
        transformationsParams: object["transformationsParams"]
      };
    },
    _toJsonObject(self) {
      return {
        application: self.application != null ? applicationIn_1.ApplicationInSerializer._toJsonObject(self.application) : void 0,
        channels: self.channels,
        deliverAt: self.deliverAt,
        eventId: self.eventId,
        eventType: self.eventType,
        payload: self.payload,
        payloadRetentionHours: self.payloadRetentionHours,
        payloadRetentionPeriod: self.payloadRetentionPeriod,
        tags: self.tags,
        transformationsParams: self.transformationsParams
      };
    }
  };
  return messageIn;
}
var hasRequiredMessage;
function requireMessage() {
  if (hasRequiredMessage) return message;
  hasRequiredMessage = 1;
  Object.defineProperty(message, "__esModule", { value: true });
  message.messageInRaw = message.Message = void 0;
  const expungeAllContentsOut_1 = requireExpungeAllContentsOut();
  const listResponseMessageOut_1 = requireListResponseMessageOut();
  const messageOut_1 = requireMessageOut();
  const messagePrecheckIn_1 = requireMessagePrecheckIn();
  const messagePrecheckOut_1 = requireMessagePrecheckOut();
  const messagePoller_1 = requireMessagePoller();
  const request_1 = requireRequest();
  const messageIn_1 = requireMessageIn();
  class Message {
    constructor(requestCtx) {
      this.requestCtx = requestCtx;
    }
    get poller() {
      return new messagePoller_1.MessagePoller(this.requestCtx);
    }
    list(appId, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/msg");
      request2.setPathParam("app_id", appId);
      request2.setQueryParams({
        limit: options === null || options === void 0 ? void 0 : options.limit,
        iterator: options === null || options === void 0 ? void 0 : options.iterator,
        channel: options === null || options === void 0 ? void 0 : options.channel,
        before: options === null || options === void 0 ? void 0 : options.before,
        after: options === null || options === void 0 ? void 0 : options.after,
        with_content: options === null || options === void 0 ? void 0 : options.withContent,
        tag: options === null || options === void 0 ? void 0 : options.tag,
        event_types: options === null || options === void 0 ? void 0 : options.eventTypes
      });
      return request2.send(this.requestCtx, listResponseMessageOut_1.ListResponseMessageOutSerializer._fromJsonObject);
    }
    create(appId, messageIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/msg");
      request2.setPathParam("app_id", appId);
      request2.setQueryParams({
        with_content: options === null || options === void 0 ? void 0 : options.withContent
      });
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(messageIn_1.MessageInSerializer._toJsonObject(messageIn2));
      return request2.send(this.requestCtx, messageOut_1.MessageOutSerializer._fromJsonObject);
    }
    expungeAllContents(appId, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/msg/expunge-all-contents");
      request2.setPathParam("app_id", appId);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      return request2.send(this.requestCtx, expungeAllContentsOut_1.ExpungeAllContentsOutSerializer._fromJsonObject);
    }
    precheck(appId, messagePrecheckIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/msg/precheck/active");
      request2.setPathParam("app_id", appId);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(messagePrecheckIn_1.MessagePrecheckInSerializer._toJsonObject(messagePrecheckIn2));
      return request2.send(this.requestCtx, messagePrecheckOut_1.MessagePrecheckOutSerializer._fromJsonObject);
    }
    get(appId, msgId, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/msg/{msg_id}");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("msg_id", msgId);
      request2.setQueryParams({
        with_content: options === null || options === void 0 ? void 0 : options.withContent
      });
      return request2.send(this.requestCtx, messageOut_1.MessageOutSerializer._fromJsonObject);
    }
    expungeContent(appId, msgId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/app/{app_id}/msg/{msg_id}/content");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("msg_id", msgId);
      return request2.sendNoResponseBody(this.requestCtx);
    }
  }
  message.Message = Message;
  function messageInRaw(eventType2, payload, contentType) {
    const headers = contentType ? { "content-type": contentType } : void 0;
    return {
      eventType: eventType2,
      payload: {},
      transformationsParams: {
        rawPayload: payload,
        headers
      }
    };
  }
  message.messageInRaw = messageInRaw;
  return message;
}
var messageAttempt = {};
var emptyResponse = {};
var hasRequiredEmptyResponse;
function requireEmptyResponse() {
  if (hasRequiredEmptyResponse) return emptyResponse;
  hasRequiredEmptyResponse = 1;
  Object.defineProperty(emptyResponse, "__esModule", { value: true });
  emptyResponse.EmptyResponseSerializer = void 0;
  emptyResponse.EmptyResponseSerializer = {
    _fromJsonObject(_object) {
      return {};
    },
    _toJsonObject(_self) {
      return {};
    }
  };
  return emptyResponse;
}
var listResponseEndpointMessageOut = {};
var endpointMessageOut = {};
var messageStatus = {};
var hasRequiredMessageStatus;
function requireMessageStatus() {
  if (hasRequiredMessageStatus) return messageStatus;
  hasRequiredMessageStatus = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.MessageStatusSerializer = exports$1.MessageStatus = void 0;
    (function(MessageStatus) {
      MessageStatus[MessageStatus["Success"] = 0] = "Success";
      MessageStatus[MessageStatus["Pending"] = 1] = "Pending";
      MessageStatus[MessageStatus["Fail"] = 2] = "Fail";
      MessageStatus[MessageStatus["Sending"] = 3] = "Sending";
    })(exports$1.MessageStatus || (exports$1.MessageStatus = {}));
    exports$1.MessageStatusSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  })(messageStatus);
  return messageStatus;
}
var messageStatusText = {};
var hasRequiredMessageStatusText;
function requireMessageStatusText() {
  if (hasRequiredMessageStatusText) return messageStatusText;
  hasRequiredMessageStatusText = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.MessageStatusTextSerializer = exports$1.MessageStatusText = void 0;
    (function(MessageStatusText) {
      MessageStatusText["Success"] = "success";
      MessageStatusText["Pending"] = "pending";
      MessageStatusText["Fail"] = "fail";
      MessageStatusText["Sending"] = "sending";
    })(exports$1.MessageStatusText || (exports$1.MessageStatusText = {}));
    exports$1.MessageStatusTextSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  })(messageStatusText);
  return messageStatusText;
}
var hasRequiredEndpointMessageOut;
function requireEndpointMessageOut() {
  if (hasRequiredEndpointMessageOut) return endpointMessageOut;
  hasRequiredEndpointMessageOut = 1;
  Object.defineProperty(endpointMessageOut, "__esModule", { value: true });
  endpointMessageOut.EndpointMessageOutSerializer = void 0;
  const messageStatus_1 = requireMessageStatus();
  const messageStatusText_1 = requireMessageStatusText();
  endpointMessageOut.EndpointMessageOutSerializer = {
    _fromJsonObject(object) {
      return {
        channels: object["channels"],
        deliverAt: object["deliverAt"] ? new Date(object["deliverAt"]) : null,
        eventId: object["eventId"],
        eventType: object["eventType"],
        id: object["id"],
        nextAttempt: object["nextAttempt"] ? new Date(object["nextAttempt"]) : null,
        payload: object["payload"],
        status: messageStatus_1.MessageStatusSerializer._fromJsonObject(object["status"]),
        statusText: messageStatusText_1.MessageStatusTextSerializer._fromJsonObject(object["statusText"]),
        tags: object["tags"],
        timestamp: new Date(object["timestamp"])
      };
    },
    _toJsonObject(self) {
      return {
        channels: self.channels,
        deliverAt: self.deliverAt,
        eventId: self.eventId,
        eventType: self.eventType,
        id: self.id,
        nextAttempt: self.nextAttempt,
        payload: self.payload,
        status: messageStatus_1.MessageStatusSerializer._toJsonObject(self.status),
        statusText: messageStatusText_1.MessageStatusTextSerializer._toJsonObject(self.statusText),
        tags: self.tags,
        timestamp: self.timestamp
      };
    }
  };
  return endpointMessageOut;
}
var hasRequiredListResponseEndpointMessageOut;
function requireListResponseEndpointMessageOut() {
  if (hasRequiredListResponseEndpointMessageOut) return listResponseEndpointMessageOut;
  hasRequiredListResponseEndpointMessageOut = 1;
  Object.defineProperty(listResponseEndpointMessageOut, "__esModule", { value: true });
  listResponseEndpointMessageOut.ListResponseEndpointMessageOutSerializer = void 0;
  const endpointMessageOut_1 = requireEndpointMessageOut();
  listResponseEndpointMessageOut.ListResponseEndpointMessageOutSerializer = {
    _fromJsonObject(object) {
      return {
        data: object["data"].map((item) => endpointMessageOut_1.EndpointMessageOutSerializer._fromJsonObject(item)),
        done: object["done"],
        iterator: object["iterator"],
        prevIterator: object["prevIterator"]
      };
    },
    _toJsonObject(self) {
      return {
        data: self.data.map((item) => endpointMessageOut_1.EndpointMessageOutSerializer._toJsonObject(item)),
        done: self.done,
        iterator: self.iterator,
        prevIterator: self.prevIterator
      };
    }
  };
  return listResponseEndpointMessageOut;
}
var listResponseMessageAttemptOut = {};
var messageAttemptOut = {};
var messageAttemptTriggerType = {};
var hasRequiredMessageAttemptTriggerType;
function requireMessageAttemptTriggerType() {
  if (hasRequiredMessageAttemptTriggerType) return messageAttemptTriggerType;
  hasRequiredMessageAttemptTriggerType = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.MessageAttemptTriggerTypeSerializer = exports$1.MessageAttemptTriggerType = void 0;
    (function(MessageAttemptTriggerType) {
      MessageAttemptTriggerType[MessageAttemptTriggerType["Scheduled"] = 0] = "Scheduled";
      MessageAttemptTriggerType[MessageAttemptTriggerType["Manual"] = 1] = "Manual";
    })(exports$1.MessageAttemptTriggerType || (exports$1.MessageAttemptTriggerType = {}));
    exports$1.MessageAttemptTriggerTypeSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  })(messageAttemptTriggerType);
  return messageAttemptTriggerType;
}
var hasRequiredMessageAttemptOut;
function requireMessageAttemptOut() {
  if (hasRequiredMessageAttemptOut) return messageAttemptOut;
  hasRequiredMessageAttemptOut = 1;
  Object.defineProperty(messageAttemptOut, "__esModule", { value: true });
  messageAttemptOut.MessageAttemptOutSerializer = void 0;
  const messageAttemptTriggerType_1 = requireMessageAttemptTriggerType();
  const messageOut_1 = requireMessageOut();
  const messageStatus_1 = requireMessageStatus();
  const messageStatusText_1 = requireMessageStatusText();
  messageAttemptOut.MessageAttemptOutSerializer = {
    _fromJsonObject(object) {
      return {
        endpointId: object["endpointId"],
        id: object["id"],
        msg: object["msg"] != null ? messageOut_1.MessageOutSerializer._fromJsonObject(object["msg"]) : void 0,
        msgId: object["msgId"],
        response: object["response"],
        responseDurationMs: object["responseDurationMs"],
        responseStatusCode: object["responseStatusCode"],
        status: messageStatus_1.MessageStatusSerializer._fromJsonObject(object["status"]),
        statusText: messageStatusText_1.MessageStatusTextSerializer._fromJsonObject(object["statusText"]),
        timestamp: new Date(object["timestamp"]),
        triggerType: messageAttemptTriggerType_1.MessageAttemptTriggerTypeSerializer._fromJsonObject(object["triggerType"]),
        url: object["url"]
      };
    },
    _toJsonObject(self) {
      return {
        endpointId: self.endpointId,
        id: self.id,
        msg: self.msg != null ? messageOut_1.MessageOutSerializer._toJsonObject(self.msg) : void 0,
        msgId: self.msgId,
        response: self.response,
        responseDurationMs: self.responseDurationMs,
        responseStatusCode: self.responseStatusCode,
        status: messageStatus_1.MessageStatusSerializer._toJsonObject(self.status),
        statusText: messageStatusText_1.MessageStatusTextSerializer._toJsonObject(self.statusText),
        timestamp: self.timestamp,
        triggerType: messageAttemptTriggerType_1.MessageAttemptTriggerTypeSerializer._toJsonObject(self.triggerType),
        url: self.url
      };
    }
  };
  return messageAttemptOut;
}
var hasRequiredListResponseMessageAttemptOut;
function requireListResponseMessageAttemptOut() {
  if (hasRequiredListResponseMessageAttemptOut) return listResponseMessageAttemptOut;
  hasRequiredListResponseMessageAttemptOut = 1;
  Object.defineProperty(listResponseMessageAttemptOut, "__esModule", { value: true });
  listResponseMessageAttemptOut.ListResponseMessageAttemptOutSerializer = void 0;
  const messageAttemptOut_1 = requireMessageAttemptOut();
  listResponseMessageAttemptOut.ListResponseMessageAttemptOutSerializer = {
    _fromJsonObject(object) {
      return {
        data: object["data"].map((item) => messageAttemptOut_1.MessageAttemptOutSerializer._fromJsonObject(item)),
        done: object["done"],
        iterator: object["iterator"],
        prevIterator: object["prevIterator"]
      };
    },
    _toJsonObject(self) {
      return {
        data: self.data.map((item) => messageAttemptOut_1.MessageAttemptOutSerializer._toJsonObject(item)),
        done: self.done,
        iterator: self.iterator,
        prevIterator: self.prevIterator
      };
    }
  };
  return listResponseMessageAttemptOut;
}
var listResponseMessageEndpointOut = {};
var messageEndpointOut = {};
var hasRequiredMessageEndpointOut;
function requireMessageEndpointOut() {
  if (hasRequiredMessageEndpointOut) return messageEndpointOut;
  hasRequiredMessageEndpointOut = 1;
  Object.defineProperty(messageEndpointOut, "__esModule", { value: true });
  messageEndpointOut.MessageEndpointOutSerializer = void 0;
  const messageStatus_1 = requireMessageStatus();
  const messageStatusText_1 = requireMessageStatusText();
  messageEndpointOut.MessageEndpointOutSerializer = {
    _fromJsonObject(object) {
      return {
        channels: object["channels"],
        createdAt: new Date(object["createdAt"]),
        description: object["description"],
        disabled: object["disabled"],
        filterTypes: object["filterTypes"],
        id: object["id"],
        nextAttempt: object["nextAttempt"] ? new Date(object["nextAttempt"]) : null,
        rateLimit: object["rateLimit"],
        status: messageStatus_1.MessageStatusSerializer._fromJsonObject(object["status"]),
        statusText: messageStatusText_1.MessageStatusTextSerializer._fromJsonObject(object["statusText"]),
        uid: object["uid"],
        updatedAt: new Date(object["updatedAt"]),
        url: object["url"],
        version: object["version"]
      };
    },
    _toJsonObject(self) {
      return {
        channels: self.channels,
        createdAt: self.createdAt,
        description: self.description,
        disabled: self.disabled,
        filterTypes: self.filterTypes,
        id: self.id,
        nextAttempt: self.nextAttempt,
        rateLimit: self.rateLimit,
        status: messageStatus_1.MessageStatusSerializer._toJsonObject(self.status),
        statusText: messageStatusText_1.MessageStatusTextSerializer._toJsonObject(self.statusText),
        uid: self.uid,
        updatedAt: self.updatedAt,
        url: self.url,
        version: self.version
      };
    }
  };
  return messageEndpointOut;
}
var hasRequiredListResponseMessageEndpointOut;
function requireListResponseMessageEndpointOut() {
  if (hasRequiredListResponseMessageEndpointOut) return listResponseMessageEndpointOut;
  hasRequiredListResponseMessageEndpointOut = 1;
  Object.defineProperty(listResponseMessageEndpointOut, "__esModule", { value: true });
  listResponseMessageEndpointOut.ListResponseMessageEndpointOutSerializer = void 0;
  const messageEndpointOut_1 = requireMessageEndpointOut();
  listResponseMessageEndpointOut.ListResponseMessageEndpointOutSerializer = {
    _fromJsonObject(object) {
      return {
        data: object["data"].map((item) => messageEndpointOut_1.MessageEndpointOutSerializer._fromJsonObject(item)),
        done: object["done"],
        iterator: object["iterator"],
        prevIterator: object["prevIterator"]
      };
    },
    _toJsonObject(self) {
      return {
        data: self.data.map((item) => messageEndpointOut_1.MessageEndpointOutSerializer._toJsonObject(item)),
        done: self.done,
        iterator: self.iterator,
        prevIterator: self.prevIterator
      };
    }
  };
  return listResponseMessageEndpointOut;
}
var hasRequiredMessageAttempt;
function requireMessageAttempt() {
  if (hasRequiredMessageAttempt) return messageAttempt;
  hasRequiredMessageAttempt = 1;
  Object.defineProperty(messageAttempt, "__esModule", { value: true });
  messageAttempt.MessageAttempt = void 0;
  const emptyResponse_1 = requireEmptyResponse();
  const listResponseEndpointMessageOut_1 = requireListResponseEndpointMessageOut();
  const listResponseMessageAttemptOut_1 = requireListResponseMessageAttemptOut();
  const listResponseMessageEndpointOut_1 = requireListResponseMessageEndpointOut();
  const messageAttemptOut_1 = requireMessageAttemptOut();
  const request_1 = requireRequest();
  class MessageAttempt {
    constructor(requestCtx) {
      this.requestCtx = requestCtx;
    }
    listByEndpoint(appId, endpointId, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/attempt/endpoint/{endpoint_id}");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("endpoint_id", endpointId);
      request2.setQueryParams({
        limit: options === null || options === void 0 ? void 0 : options.limit,
        iterator: options === null || options === void 0 ? void 0 : options.iterator,
        status: options === null || options === void 0 ? void 0 : options.status,
        status_code_class: options === null || options === void 0 ? void 0 : options.statusCodeClass,
        channel: options === null || options === void 0 ? void 0 : options.channel,
        tag: options === null || options === void 0 ? void 0 : options.tag,
        before: options === null || options === void 0 ? void 0 : options.before,
        after: options === null || options === void 0 ? void 0 : options.after,
        with_content: options === null || options === void 0 ? void 0 : options.withContent,
        with_msg: options === null || options === void 0 ? void 0 : options.withMsg,
        event_types: options === null || options === void 0 ? void 0 : options.eventTypes
      });
      return request2.send(this.requestCtx, listResponseMessageAttemptOut_1.ListResponseMessageAttemptOutSerializer._fromJsonObject);
    }
    listByMsg(appId, msgId, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/attempt/msg/{msg_id}");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("msg_id", msgId);
      request2.setQueryParams({
        limit: options === null || options === void 0 ? void 0 : options.limit,
        iterator: options === null || options === void 0 ? void 0 : options.iterator,
        status: options === null || options === void 0 ? void 0 : options.status,
        status_code_class: options === null || options === void 0 ? void 0 : options.statusCodeClass,
        channel: options === null || options === void 0 ? void 0 : options.channel,
        tag: options === null || options === void 0 ? void 0 : options.tag,
        endpoint_id: options === null || options === void 0 ? void 0 : options.endpointId,
        before: options === null || options === void 0 ? void 0 : options.before,
        after: options === null || options === void 0 ? void 0 : options.after,
        with_content: options === null || options === void 0 ? void 0 : options.withContent,
        event_types: options === null || options === void 0 ? void 0 : options.eventTypes
      });
      return request2.send(this.requestCtx, listResponseMessageAttemptOut_1.ListResponseMessageAttemptOutSerializer._fromJsonObject);
    }
    listAttemptedMessages(appId, endpointId, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/endpoint/{endpoint_id}/msg");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("endpoint_id", endpointId);
      request2.setQueryParams({
        limit: options === null || options === void 0 ? void 0 : options.limit,
        iterator: options === null || options === void 0 ? void 0 : options.iterator,
        channel: options === null || options === void 0 ? void 0 : options.channel,
        tag: options === null || options === void 0 ? void 0 : options.tag,
        status: options === null || options === void 0 ? void 0 : options.status,
        before: options === null || options === void 0 ? void 0 : options.before,
        after: options === null || options === void 0 ? void 0 : options.after,
        with_content: options === null || options === void 0 ? void 0 : options.withContent,
        event_types: options === null || options === void 0 ? void 0 : options.eventTypes
      });
      return request2.send(this.requestCtx, listResponseEndpointMessageOut_1.ListResponseEndpointMessageOutSerializer._fromJsonObject);
    }
    get(appId, msgId, attemptId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/msg/{msg_id}/attempt/{attempt_id}");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("msg_id", msgId);
      request2.setPathParam("attempt_id", attemptId);
      return request2.send(this.requestCtx, messageAttemptOut_1.MessageAttemptOutSerializer._fromJsonObject);
    }
    expungeContent(appId, msgId, attemptId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/app/{app_id}/msg/{msg_id}/attempt/{attempt_id}/content");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("msg_id", msgId);
      request2.setPathParam("attempt_id", attemptId);
      return request2.sendNoResponseBody(this.requestCtx);
    }
    listAttemptedDestinations(appId, msgId, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/app/{app_id}/msg/{msg_id}/endpoint");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("msg_id", msgId);
      request2.setQueryParams({
        limit: options === null || options === void 0 ? void 0 : options.limit,
        iterator: options === null || options === void 0 ? void 0 : options.iterator
      });
      return request2.send(this.requestCtx, listResponseMessageEndpointOut_1.ListResponseMessageEndpointOutSerializer._fromJsonObject);
    }
    resend(appId, msgId, endpointId, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/app/{app_id}/msg/{msg_id}/endpoint/{endpoint_id}/resend");
      request2.setPathParam("app_id", appId);
      request2.setPathParam("msg_id", msgId);
      request2.setPathParam("endpoint_id", endpointId);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      return request2.send(this.requestCtx, emptyResponse_1.EmptyResponseSerializer._fromJsonObject);
    }
  }
  messageAttempt.MessageAttempt = MessageAttempt;
  return messageAttempt;
}
var operationalWebhook = {};
var operationalWebhookEndpoint = {};
var listResponseOperationalWebhookEndpointOut = {};
var operationalWebhookEndpointOut = {};
var hasRequiredOperationalWebhookEndpointOut;
function requireOperationalWebhookEndpointOut() {
  if (hasRequiredOperationalWebhookEndpointOut) return operationalWebhookEndpointOut;
  hasRequiredOperationalWebhookEndpointOut = 1;
  Object.defineProperty(operationalWebhookEndpointOut, "__esModule", { value: true });
  operationalWebhookEndpointOut.OperationalWebhookEndpointOutSerializer = void 0;
  operationalWebhookEndpointOut.OperationalWebhookEndpointOutSerializer = {
    _fromJsonObject(object) {
      return {
        createdAt: new Date(object["createdAt"]),
        description: object["description"],
        disabled: object["disabled"],
        filterTypes: object["filterTypes"],
        id: object["id"],
        metadata: object["metadata"],
        rateLimit: object["rateLimit"],
        uid: object["uid"],
        updatedAt: new Date(object["updatedAt"]),
        url: object["url"]
      };
    },
    _toJsonObject(self) {
      return {
        createdAt: self.createdAt,
        description: self.description,
        disabled: self.disabled,
        filterTypes: self.filterTypes,
        id: self.id,
        metadata: self.metadata,
        rateLimit: self.rateLimit,
        uid: self.uid,
        updatedAt: self.updatedAt,
        url: self.url
      };
    }
  };
  return operationalWebhookEndpointOut;
}
var hasRequiredListResponseOperationalWebhookEndpointOut;
function requireListResponseOperationalWebhookEndpointOut() {
  if (hasRequiredListResponseOperationalWebhookEndpointOut) return listResponseOperationalWebhookEndpointOut;
  hasRequiredListResponseOperationalWebhookEndpointOut = 1;
  Object.defineProperty(listResponseOperationalWebhookEndpointOut, "__esModule", { value: true });
  listResponseOperationalWebhookEndpointOut.ListResponseOperationalWebhookEndpointOutSerializer = void 0;
  const operationalWebhookEndpointOut_1 = requireOperationalWebhookEndpointOut();
  listResponseOperationalWebhookEndpointOut.ListResponseOperationalWebhookEndpointOutSerializer = {
    _fromJsonObject(object) {
      return {
        data: object["data"].map((item) => operationalWebhookEndpointOut_1.OperationalWebhookEndpointOutSerializer._fromJsonObject(item)),
        done: object["done"],
        iterator: object["iterator"],
        prevIterator: object["prevIterator"]
      };
    },
    _toJsonObject(self) {
      return {
        data: self.data.map((item) => operationalWebhookEndpointOut_1.OperationalWebhookEndpointOutSerializer._toJsonObject(item)),
        done: self.done,
        iterator: self.iterator,
        prevIterator: self.prevIterator
      };
    }
  };
  return listResponseOperationalWebhookEndpointOut;
}
var operationalWebhookEndpointHeadersIn = {};
var hasRequiredOperationalWebhookEndpointHeadersIn;
function requireOperationalWebhookEndpointHeadersIn() {
  if (hasRequiredOperationalWebhookEndpointHeadersIn) return operationalWebhookEndpointHeadersIn;
  hasRequiredOperationalWebhookEndpointHeadersIn = 1;
  Object.defineProperty(operationalWebhookEndpointHeadersIn, "__esModule", { value: true });
  operationalWebhookEndpointHeadersIn.OperationalWebhookEndpointHeadersInSerializer = void 0;
  operationalWebhookEndpointHeadersIn.OperationalWebhookEndpointHeadersInSerializer = {
    _fromJsonObject(object) {
      return {
        headers: object["headers"]
      };
    },
    _toJsonObject(self) {
      return {
        headers: self.headers
      };
    }
  };
  return operationalWebhookEndpointHeadersIn;
}
var operationalWebhookEndpointHeadersOut = {};
var hasRequiredOperationalWebhookEndpointHeadersOut;
function requireOperationalWebhookEndpointHeadersOut() {
  if (hasRequiredOperationalWebhookEndpointHeadersOut) return operationalWebhookEndpointHeadersOut;
  hasRequiredOperationalWebhookEndpointHeadersOut = 1;
  Object.defineProperty(operationalWebhookEndpointHeadersOut, "__esModule", { value: true });
  operationalWebhookEndpointHeadersOut.OperationalWebhookEndpointHeadersOutSerializer = void 0;
  operationalWebhookEndpointHeadersOut.OperationalWebhookEndpointHeadersOutSerializer = {
    _fromJsonObject(object) {
      return {
        headers: object["headers"],
        sensitive: object["sensitive"]
      };
    },
    _toJsonObject(self) {
      return {
        headers: self.headers,
        sensitive: self.sensitive
      };
    }
  };
  return operationalWebhookEndpointHeadersOut;
}
var operationalWebhookEndpointIn = {};
var hasRequiredOperationalWebhookEndpointIn;
function requireOperationalWebhookEndpointIn() {
  if (hasRequiredOperationalWebhookEndpointIn) return operationalWebhookEndpointIn;
  hasRequiredOperationalWebhookEndpointIn = 1;
  Object.defineProperty(operationalWebhookEndpointIn, "__esModule", { value: true });
  operationalWebhookEndpointIn.OperationalWebhookEndpointInSerializer = void 0;
  operationalWebhookEndpointIn.OperationalWebhookEndpointInSerializer = {
    _fromJsonObject(object) {
      return {
        description: object["description"],
        disabled: object["disabled"],
        filterTypes: object["filterTypes"],
        metadata: object["metadata"],
        rateLimit: object["rateLimit"],
        secret: object["secret"],
        uid: object["uid"],
        url: object["url"]
      };
    },
    _toJsonObject(self) {
      return {
        description: self.description,
        disabled: self.disabled,
        filterTypes: self.filterTypes,
        metadata: self.metadata,
        rateLimit: self.rateLimit,
        secret: self.secret,
        uid: self.uid,
        url: self.url
      };
    }
  };
  return operationalWebhookEndpointIn;
}
var operationalWebhookEndpointSecretIn = {};
var hasRequiredOperationalWebhookEndpointSecretIn;
function requireOperationalWebhookEndpointSecretIn() {
  if (hasRequiredOperationalWebhookEndpointSecretIn) return operationalWebhookEndpointSecretIn;
  hasRequiredOperationalWebhookEndpointSecretIn = 1;
  Object.defineProperty(operationalWebhookEndpointSecretIn, "__esModule", { value: true });
  operationalWebhookEndpointSecretIn.OperationalWebhookEndpointSecretInSerializer = void 0;
  operationalWebhookEndpointSecretIn.OperationalWebhookEndpointSecretInSerializer = {
    _fromJsonObject(object) {
      return {
        key: object["key"]
      };
    },
    _toJsonObject(self) {
      return {
        key: self.key
      };
    }
  };
  return operationalWebhookEndpointSecretIn;
}
var operationalWebhookEndpointSecretOut = {};
var hasRequiredOperationalWebhookEndpointSecretOut;
function requireOperationalWebhookEndpointSecretOut() {
  if (hasRequiredOperationalWebhookEndpointSecretOut) return operationalWebhookEndpointSecretOut;
  hasRequiredOperationalWebhookEndpointSecretOut = 1;
  Object.defineProperty(operationalWebhookEndpointSecretOut, "__esModule", { value: true });
  operationalWebhookEndpointSecretOut.OperationalWebhookEndpointSecretOutSerializer = void 0;
  operationalWebhookEndpointSecretOut.OperationalWebhookEndpointSecretOutSerializer = {
    _fromJsonObject(object) {
      return {
        key: object["key"]
      };
    },
    _toJsonObject(self) {
      return {
        key: self.key
      };
    }
  };
  return operationalWebhookEndpointSecretOut;
}
var operationalWebhookEndpointUpdate = {};
var hasRequiredOperationalWebhookEndpointUpdate;
function requireOperationalWebhookEndpointUpdate() {
  if (hasRequiredOperationalWebhookEndpointUpdate) return operationalWebhookEndpointUpdate;
  hasRequiredOperationalWebhookEndpointUpdate = 1;
  Object.defineProperty(operationalWebhookEndpointUpdate, "__esModule", { value: true });
  operationalWebhookEndpointUpdate.OperationalWebhookEndpointUpdateSerializer = void 0;
  operationalWebhookEndpointUpdate.OperationalWebhookEndpointUpdateSerializer = {
    _fromJsonObject(object) {
      return {
        description: object["description"],
        disabled: object["disabled"],
        filterTypes: object["filterTypes"],
        metadata: object["metadata"],
        rateLimit: object["rateLimit"],
        uid: object["uid"],
        url: object["url"]
      };
    },
    _toJsonObject(self) {
      return {
        description: self.description,
        disabled: self.disabled,
        filterTypes: self.filterTypes,
        metadata: self.metadata,
        rateLimit: self.rateLimit,
        uid: self.uid,
        url: self.url
      };
    }
  };
  return operationalWebhookEndpointUpdate;
}
var hasRequiredOperationalWebhookEndpoint;
function requireOperationalWebhookEndpoint() {
  if (hasRequiredOperationalWebhookEndpoint) return operationalWebhookEndpoint;
  hasRequiredOperationalWebhookEndpoint = 1;
  Object.defineProperty(operationalWebhookEndpoint, "__esModule", { value: true });
  operationalWebhookEndpoint.OperationalWebhookEndpoint = void 0;
  const listResponseOperationalWebhookEndpointOut_1 = requireListResponseOperationalWebhookEndpointOut();
  const operationalWebhookEndpointHeadersIn_1 = requireOperationalWebhookEndpointHeadersIn();
  const operationalWebhookEndpointHeadersOut_1 = requireOperationalWebhookEndpointHeadersOut();
  const operationalWebhookEndpointIn_1 = requireOperationalWebhookEndpointIn();
  const operationalWebhookEndpointOut_1 = requireOperationalWebhookEndpointOut();
  const operationalWebhookEndpointSecretIn_1 = requireOperationalWebhookEndpointSecretIn();
  const operationalWebhookEndpointSecretOut_1 = requireOperationalWebhookEndpointSecretOut();
  const operationalWebhookEndpointUpdate_1 = requireOperationalWebhookEndpointUpdate();
  const request_1 = requireRequest();
  class OperationalWebhookEndpoint {
    constructor(requestCtx) {
      this.requestCtx = requestCtx;
    }
    list(options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/operational-webhook/endpoint");
      request2.setQueryParams({
        limit: options === null || options === void 0 ? void 0 : options.limit,
        iterator: options === null || options === void 0 ? void 0 : options.iterator,
        order: options === null || options === void 0 ? void 0 : options.order
      });
      return request2.send(this.requestCtx, listResponseOperationalWebhookEndpointOut_1.ListResponseOperationalWebhookEndpointOutSerializer._fromJsonObject);
    }
    create(operationalWebhookEndpointIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/operational-webhook/endpoint");
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(operationalWebhookEndpointIn_1.OperationalWebhookEndpointInSerializer._toJsonObject(operationalWebhookEndpointIn2));
      return request2.send(this.requestCtx, operationalWebhookEndpointOut_1.OperationalWebhookEndpointOutSerializer._fromJsonObject);
    }
    get(endpointId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/operational-webhook/endpoint/{endpoint_id}");
      request2.setPathParam("endpoint_id", endpointId);
      return request2.send(this.requestCtx, operationalWebhookEndpointOut_1.OperationalWebhookEndpointOutSerializer._fromJsonObject);
    }
    update(endpointId, operationalWebhookEndpointUpdate2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/operational-webhook/endpoint/{endpoint_id}");
      request2.setPathParam("endpoint_id", endpointId);
      request2.setBody(operationalWebhookEndpointUpdate_1.OperationalWebhookEndpointUpdateSerializer._toJsonObject(operationalWebhookEndpointUpdate2));
      return request2.send(this.requestCtx, operationalWebhookEndpointOut_1.OperationalWebhookEndpointOutSerializer._fromJsonObject);
    }
    delete(endpointId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/operational-webhook/endpoint/{endpoint_id}");
      request2.setPathParam("endpoint_id", endpointId);
      return request2.sendNoResponseBody(this.requestCtx);
    }
    getHeaders(endpointId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/operational-webhook/endpoint/{endpoint_id}/headers");
      request2.setPathParam("endpoint_id", endpointId);
      return request2.send(this.requestCtx, operationalWebhookEndpointHeadersOut_1.OperationalWebhookEndpointHeadersOutSerializer._fromJsonObject);
    }
    updateHeaders(endpointId, operationalWebhookEndpointHeadersIn2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/operational-webhook/endpoint/{endpoint_id}/headers");
      request2.setPathParam("endpoint_id", endpointId);
      request2.setBody(operationalWebhookEndpointHeadersIn_1.OperationalWebhookEndpointHeadersInSerializer._toJsonObject(operationalWebhookEndpointHeadersIn2));
      return request2.sendNoResponseBody(this.requestCtx);
    }
    getSecret(endpointId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/operational-webhook/endpoint/{endpoint_id}/secret");
      request2.setPathParam("endpoint_id", endpointId);
      return request2.send(this.requestCtx, operationalWebhookEndpointSecretOut_1.OperationalWebhookEndpointSecretOutSerializer._fromJsonObject);
    }
    rotateSecret(endpointId, operationalWebhookEndpointSecretIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/operational-webhook/endpoint/{endpoint_id}/secret/rotate");
      request2.setPathParam("endpoint_id", endpointId);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(operationalWebhookEndpointSecretIn_1.OperationalWebhookEndpointSecretInSerializer._toJsonObject(operationalWebhookEndpointSecretIn2));
      return request2.sendNoResponseBody(this.requestCtx);
    }
  }
  operationalWebhookEndpoint.OperationalWebhookEndpoint = OperationalWebhookEndpoint;
  return operationalWebhookEndpoint;
}
var hasRequiredOperationalWebhook;
function requireOperationalWebhook() {
  if (hasRequiredOperationalWebhook) return operationalWebhook;
  hasRequiredOperationalWebhook = 1;
  Object.defineProperty(operationalWebhook, "__esModule", { value: true });
  operationalWebhook.OperationalWebhook = void 0;
  const operationalWebhookEndpoint_1 = requireOperationalWebhookEndpoint();
  class OperationalWebhook {
    constructor(requestCtx) {
      this.requestCtx = requestCtx;
    }
    get endpoint() {
      return new operationalWebhookEndpoint_1.OperationalWebhookEndpoint(this.requestCtx);
    }
  }
  operationalWebhook.OperationalWebhook = OperationalWebhook;
  return operationalWebhook;
}
var statistics = {};
var aggregateEventTypesOut = {};
var hasRequiredAggregateEventTypesOut;
function requireAggregateEventTypesOut() {
  if (hasRequiredAggregateEventTypesOut) return aggregateEventTypesOut;
  hasRequiredAggregateEventTypesOut = 1;
  Object.defineProperty(aggregateEventTypesOut, "__esModule", { value: true });
  aggregateEventTypesOut.AggregateEventTypesOutSerializer = void 0;
  const backgroundTaskStatus_1 = requireBackgroundTaskStatus();
  const backgroundTaskType_1 = requireBackgroundTaskType();
  aggregateEventTypesOut.AggregateEventTypesOutSerializer = {
    _fromJsonObject(object) {
      return {
        id: object["id"],
        status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
        task: backgroundTaskType_1.BackgroundTaskTypeSerializer._fromJsonObject(object["task"])
      };
    },
    _toJsonObject(self) {
      return {
        id: self.id,
        status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._toJsonObject(self.status),
        task: backgroundTaskType_1.BackgroundTaskTypeSerializer._toJsonObject(self.task)
      };
    }
  };
  return aggregateEventTypesOut;
}
var appUsageStatsIn = {};
var hasRequiredAppUsageStatsIn;
function requireAppUsageStatsIn() {
  if (hasRequiredAppUsageStatsIn) return appUsageStatsIn;
  hasRequiredAppUsageStatsIn = 1;
  Object.defineProperty(appUsageStatsIn, "__esModule", { value: true });
  appUsageStatsIn.AppUsageStatsInSerializer = void 0;
  appUsageStatsIn.AppUsageStatsInSerializer = {
    _fromJsonObject(object) {
      return {
        appIds: object["appIds"],
        since: new Date(object["since"]),
        until: new Date(object["until"])
      };
    },
    _toJsonObject(self) {
      return {
        appIds: self.appIds,
        since: self.since,
        until: self.until
      };
    }
  };
  return appUsageStatsIn;
}
var appUsageStatsOut = {};
var hasRequiredAppUsageStatsOut;
function requireAppUsageStatsOut() {
  if (hasRequiredAppUsageStatsOut) return appUsageStatsOut;
  hasRequiredAppUsageStatsOut = 1;
  Object.defineProperty(appUsageStatsOut, "__esModule", { value: true });
  appUsageStatsOut.AppUsageStatsOutSerializer = void 0;
  const backgroundTaskStatus_1 = requireBackgroundTaskStatus();
  const backgroundTaskType_1 = requireBackgroundTaskType();
  appUsageStatsOut.AppUsageStatsOutSerializer = {
    _fromJsonObject(object) {
      return {
        id: object["id"],
        status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._fromJsonObject(object["status"]),
        task: backgroundTaskType_1.BackgroundTaskTypeSerializer._fromJsonObject(object["task"]),
        unresolvedAppIds: object["unresolvedAppIds"]
      };
    },
    _toJsonObject(self) {
      return {
        id: self.id,
        status: backgroundTaskStatus_1.BackgroundTaskStatusSerializer._toJsonObject(self.status),
        task: backgroundTaskType_1.BackgroundTaskTypeSerializer._toJsonObject(self.task),
        unresolvedAppIds: self.unresolvedAppIds
      };
    }
  };
  return appUsageStatsOut;
}
var hasRequiredStatistics;
function requireStatistics() {
  if (hasRequiredStatistics) return statistics;
  hasRequiredStatistics = 1;
  Object.defineProperty(statistics, "__esModule", { value: true });
  statistics.Statistics = void 0;
  const aggregateEventTypesOut_1 = requireAggregateEventTypesOut();
  const appUsageStatsIn_1 = requireAppUsageStatsIn();
  const appUsageStatsOut_1 = requireAppUsageStatsOut();
  const request_1 = requireRequest();
  class Statistics {
    constructor(requestCtx) {
      this.requestCtx = requestCtx;
    }
    aggregateAppStats(appUsageStatsIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/stats/usage/app");
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(appUsageStatsIn_1.AppUsageStatsInSerializer._toJsonObject(appUsageStatsIn2));
      return request2.send(this.requestCtx, appUsageStatsOut_1.AppUsageStatsOutSerializer._fromJsonObject);
    }
    aggregateEventTypes() {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/stats/usage/event-types");
      return request2.send(this.requestCtx, aggregateEventTypesOut_1.AggregateEventTypesOutSerializer._fromJsonObject);
    }
  }
  statistics.Statistics = Statistics;
  return statistics;
}
var streaming = {};
var httpSinkHeadersPatchIn = {};
var hasRequiredHttpSinkHeadersPatchIn;
function requireHttpSinkHeadersPatchIn() {
  if (hasRequiredHttpSinkHeadersPatchIn) return httpSinkHeadersPatchIn;
  hasRequiredHttpSinkHeadersPatchIn = 1;
  Object.defineProperty(httpSinkHeadersPatchIn, "__esModule", { value: true });
  httpSinkHeadersPatchIn.HttpSinkHeadersPatchInSerializer = void 0;
  httpSinkHeadersPatchIn.HttpSinkHeadersPatchInSerializer = {
    _fromJsonObject(object) {
      return {
        headers: object["headers"]
      };
    },
    _toJsonObject(self) {
      return {
        headers: self.headers
      };
    }
  };
  return httpSinkHeadersPatchIn;
}
var sinkTransformationOut = {};
var hasRequiredSinkTransformationOut;
function requireSinkTransformationOut() {
  if (hasRequiredSinkTransformationOut) return sinkTransformationOut;
  hasRequiredSinkTransformationOut = 1;
  Object.defineProperty(sinkTransformationOut, "__esModule", { value: true });
  sinkTransformationOut.SinkTransformationOutSerializer = void 0;
  sinkTransformationOut.SinkTransformationOutSerializer = {
    _fromJsonObject(object) {
      return {
        code: object["code"],
        enabled: object["enabled"]
      };
    },
    _toJsonObject(self) {
      return {
        code: self.code,
        enabled: self.enabled
      };
    }
  };
  return sinkTransformationOut;
}
var streamingEventType = {};
var listResponseStreamEventTypeOut = {};
var streamEventTypeOut = {};
var hasRequiredStreamEventTypeOut;
function requireStreamEventTypeOut() {
  if (hasRequiredStreamEventTypeOut) return streamEventTypeOut;
  hasRequiredStreamEventTypeOut = 1;
  Object.defineProperty(streamEventTypeOut, "__esModule", { value: true });
  streamEventTypeOut.StreamEventTypeOutSerializer = void 0;
  streamEventTypeOut.StreamEventTypeOutSerializer = {
    _fromJsonObject(object) {
      return {
        archived: object["archived"],
        createdAt: new Date(object["createdAt"]),
        deprecated: object["deprecated"],
        description: object["description"],
        featureFlags: object["featureFlags"],
        name: object["name"],
        updatedAt: new Date(object["updatedAt"])
      };
    },
    _toJsonObject(self) {
      return {
        archived: self.archived,
        createdAt: self.createdAt,
        deprecated: self.deprecated,
        description: self.description,
        featureFlags: self.featureFlags,
        name: self.name,
        updatedAt: self.updatedAt
      };
    }
  };
  return streamEventTypeOut;
}
var hasRequiredListResponseStreamEventTypeOut;
function requireListResponseStreamEventTypeOut() {
  if (hasRequiredListResponseStreamEventTypeOut) return listResponseStreamEventTypeOut;
  hasRequiredListResponseStreamEventTypeOut = 1;
  Object.defineProperty(listResponseStreamEventTypeOut, "__esModule", { value: true });
  listResponseStreamEventTypeOut.ListResponseStreamEventTypeOutSerializer = void 0;
  const streamEventTypeOut_1 = requireStreamEventTypeOut();
  listResponseStreamEventTypeOut.ListResponseStreamEventTypeOutSerializer = {
    _fromJsonObject(object) {
      return {
        data: object["data"].map((item) => streamEventTypeOut_1.StreamEventTypeOutSerializer._fromJsonObject(item)),
        done: object["done"],
        iterator: object["iterator"],
        prevIterator: object["prevIterator"]
      };
    },
    _toJsonObject(self) {
      return {
        data: self.data.map((item) => streamEventTypeOut_1.StreamEventTypeOutSerializer._toJsonObject(item)),
        done: self.done,
        iterator: self.iterator,
        prevIterator: self.prevIterator
      };
    }
  };
  return listResponseStreamEventTypeOut;
}
var streamEventTypeIn = {};
var hasRequiredStreamEventTypeIn;
function requireStreamEventTypeIn() {
  if (hasRequiredStreamEventTypeIn) return streamEventTypeIn;
  hasRequiredStreamEventTypeIn = 1;
  Object.defineProperty(streamEventTypeIn, "__esModule", { value: true });
  streamEventTypeIn.StreamEventTypeInSerializer = void 0;
  streamEventTypeIn.StreamEventTypeInSerializer = {
    _fromJsonObject(object) {
      return {
        archived: object["archived"],
        deprecated: object["deprecated"],
        description: object["description"],
        featureFlags: object["featureFlags"],
        name: object["name"]
      };
    },
    _toJsonObject(self) {
      return {
        archived: self.archived,
        deprecated: self.deprecated,
        description: self.description,
        featureFlags: self.featureFlags,
        name: self.name
      };
    }
  };
  return streamEventTypeIn;
}
var streamEventTypePatch = {};
var hasRequiredStreamEventTypePatch;
function requireStreamEventTypePatch() {
  if (hasRequiredStreamEventTypePatch) return streamEventTypePatch;
  hasRequiredStreamEventTypePatch = 1;
  Object.defineProperty(streamEventTypePatch, "__esModule", { value: true });
  streamEventTypePatch.StreamEventTypePatchSerializer = void 0;
  streamEventTypePatch.StreamEventTypePatchSerializer = {
    _fromJsonObject(object) {
      return {
        archived: object["archived"],
        deprecated: object["deprecated"],
        description: object["description"],
        featureFlags: object["featureFlags"],
        name: object["name"]
      };
    },
    _toJsonObject(self) {
      return {
        archived: self.archived,
        deprecated: self.deprecated,
        description: self.description,
        featureFlags: self.featureFlags,
        name: self.name
      };
    }
  };
  return streamEventTypePatch;
}
var hasRequiredStreamingEventType;
function requireStreamingEventType() {
  if (hasRequiredStreamingEventType) return streamingEventType;
  hasRequiredStreamingEventType = 1;
  Object.defineProperty(streamingEventType, "__esModule", { value: true });
  streamingEventType.StreamingEventType = void 0;
  const listResponseStreamEventTypeOut_1 = requireListResponseStreamEventTypeOut();
  const streamEventTypeIn_1 = requireStreamEventTypeIn();
  const streamEventTypeOut_1 = requireStreamEventTypeOut();
  const streamEventTypePatch_1 = requireStreamEventTypePatch();
  const request_1 = requireRequest();
  class StreamingEventType {
    constructor(requestCtx) {
      this.requestCtx = requestCtx;
    }
    list(options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/event-type");
      request2.setQueryParams({
        limit: options === null || options === void 0 ? void 0 : options.limit,
        iterator: options === null || options === void 0 ? void 0 : options.iterator,
        order: options === null || options === void 0 ? void 0 : options.order,
        include_archived: options === null || options === void 0 ? void 0 : options.includeArchived
      });
      return request2.send(this.requestCtx, listResponseStreamEventTypeOut_1.ListResponseStreamEventTypeOutSerializer._fromJsonObject);
    }
    create(streamEventTypeIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/stream/event-type");
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(streamEventTypeIn_1.StreamEventTypeInSerializer._toJsonObject(streamEventTypeIn2));
      return request2.send(this.requestCtx, streamEventTypeOut_1.StreamEventTypeOutSerializer._fromJsonObject);
    }
    get(name) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/event-type/{name}");
      request2.setPathParam("name", name);
      return request2.send(this.requestCtx, streamEventTypeOut_1.StreamEventTypeOutSerializer._fromJsonObject);
    }
    update(name, streamEventTypeIn2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/stream/event-type/{name}");
      request2.setPathParam("name", name);
      request2.setBody(streamEventTypeIn_1.StreamEventTypeInSerializer._toJsonObject(streamEventTypeIn2));
      return request2.send(this.requestCtx, streamEventTypeOut_1.StreamEventTypeOutSerializer._fromJsonObject);
    }
    delete(name, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/stream/event-type/{name}");
      request2.setPathParam("name", name);
      request2.setQueryParams({
        expunge: options === null || options === void 0 ? void 0 : options.expunge
      });
      return request2.sendNoResponseBody(this.requestCtx);
    }
    patch(name, streamEventTypePatch2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/stream/event-type/{name}");
      request2.setPathParam("name", name);
      request2.setBody(streamEventTypePatch_1.StreamEventTypePatchSerializer._toJsonObject(streamEventTypePatch2));
      return request2.send(this.requestCtx, streamEventTypeOut_1.StreamEventTypeOutSerializer._fromJsonObject);
    }
  }
  streamingEventType.StreamingEventType = StreamingEventType;
  return streamingEventType;
}
var streamingEvents = {};
var createStreamEventsIn = {};
var eventIn = {};
var hasRequiredEventIn;
function requireEventIn() {
  if (hasRequiredEventIn) return eventIn;
  hasRequiredEventIn = 1;
  Object.defineProperty(eventIn, "__esModule", { value: true });
  eventIn.EventInSerializer = void 0;
  eventIn.EventInSerializer = {
    _fromJsonObject(object) {
      return {
        eventType: object["eventType"],
        payload: object["payload"]
      };
    },
    _toJsonObject(self) {
      return {
        eventType: self.eventType,
        payload: self.payload
      };
    }
  };
  return eventIn;
}
var streamIn = {};
var hasRequiredStreamIn;
function requireStreamIn() {
  if (hasRequiredStreamIn) return streamIn;
  hasRequiredStreamIn = 1;
  Object.defineProperty(streamIn, "__esModule", { value: true });
  streamIn.StreamInSerializer = void 0;
  streamIn.StreamInSerializer = {
    _fromJsonObject(object) {
      return {
        metadata: object["metadata"],
        name: object["name"],
        uid: object["uid"]
      };
    },
    _toJsonObject(self) {
      return {
        metadata: self.metadata,
        name: self.name,
        uid: self.uid
      };
    }
  };
  return streamIn;
}
var hasRequiredCreateStreamEventsIn;
function requireCreateStreamEventsIn() {
  if (hasRequiredCreateStreamEventsIn) return createStreamEventsIn;
  hasRequiredCreateStreamEventsIn = 1;
  Object.defineProperty(createStreamEventsIn, "__esModule", { value: true });
  createStreamEventsIn.CreateStreamEventsInSerializer = void 0;
  const eventIn_1 = requireEventIn();
  const streamIn_1 = requireStreamIn();
  createStreamEventsIn.CreateStreamEventsInSerializer = {
    _fromJsonObject(object) {
      return {
        events: object["events"].map((item) => eventIn_1.EventInSerializer._fromJsonObject(item)),
        stream: object["stream"] != null ? streamIn_1.StreamInSerializer._fromJsonObject(object["stream"]) : void 0
      };
    },
    _toJsonObject(self) {
      return {
        events: self.events.map((item) => eventIn_1.EventInSerializer._toJsonObject(item)),
        stream: self.stream != null ? streamIn_1.StreamInSerializer._toJsonObject(self.stream) : void 0
      };
    }
  };
  return createStreamEventsIn;
}
var createStreamEventsOut = {};
var hasRequiredCreateStreamEventsOut;
function requireCreateStreamEventsOut() {
  if (hasRequiredCreateStreamEventsOut) return createStreamEventsOut;
  hasRequiredCreateStreamEventsOut = 1;
  Object.defineProperty(createStreamEventsOut, "__esModule", { value: true });
  createStreamEventsOut.CreateStreamEventsOutSerializer = void 0;
  createStreamEventsOut.CreateStreamEventsOutSerializer = {
    _fromJsonObject(_object) {
      return {};
    },
    _toJsonObject(_self) {
      return {};
    }
  };
  return createStreamEventsOut;
}
var eventStreamOut = {};
var eventOut = {};
var hasRequiredEventOut;
function requireEventOut() {
  if (hasRequiredEventOut) return eventOut;
  hasRequiredEventOut = 1;
  Object.defineProperty(eventOut, "__esModule", { value: true });
  eventOut.EventOutSerializer = void 0;
  eventOut.EventOutSerializer = {
    _fromJsonObject(object) {
      return {
        eventType: object["eventType"],
        payload: object["payload"],
        timestamp: new Date(object["timestamp"])
      };
    },
    _toJsonObject(self) {
      return {
        eventType: self.eventType,
        payload: self.payload,
        timestamp: self.timestamp
      };
    }
  };
  return eventOut;
}
var hasRequiredEventStreamOut;
function requireEventStreamOut() {
  if (hasRequiredEventStreamOut) return eventStreamOut;
  hasRequiredEventStreamOut = 1;
  Object.defineProperty(eventStreamOut, "__esModule", { value: true });
  eventStreamOut.EventStreamOutSerializer = void 0;
  const eventOut_1 = requireEventOut();
  eventStreamOut.EventStreamOutSerializer = {
    _fromJsonObject(object) {
      return {
        data: object["data"].map((item) => eventOut_1.EventOutSerializer._fromJsonObject(item)),
        done: object["done"],
        iterator: object["iterator"]
      };
    },
    _toJsonObject(self) {
      return {
        data: self.data.map((item) => eventOut_1.EventOutSerializer._toJsonObject(item)),
        done: self.done,
        iterator: self.iterator
      };
    }
  };
  return eventStreamOut;
}
var hasRequiredStreamingEvents;
function requireStreamingEvents() {
  if (hasRequiredStreamingEvents) return streamingEvents;
  hasRequiredStreamingEvents = 1;
  Object.defineProperty(streamingEvents, "__esModule", { value: true });
  streamingEvents.StreamingEvents = void 0;
  const createStreamEventsIn_1 = requireCreateStreamEventsIn();
  const createStreamEventsOut_1 = requireCreateStreamEventsOut();
  const eventStreamOut_1 = requireEventStreamOut();
  const request_1 = requireRequest();
  class StreamingEvents {
    constructor(requestCtx) {
      this.requestCtx = requestCtx;
    }
    create(streamId, createStreamEventsIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/stream/{stream_id}/events");
      request2.setPathParam("stream_id", streamId);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(createStreamEventsIn_1.CreateStreamEventsInSerializer._toJsonObject(createStreamEventsIn2));
      return request2.send(this.requestCtx, createStreamEventsOut_1.CreateStreamEventsOutSerializer._fromJsonObject);
    }
    get(streamId, sinkId, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}/sink/{sink_id}/events");
      request2.setPathParam("stream_id", streamId);
      request2.setPathParam("sink_id", sinkId);
      request2.setQueryParams({
        limit: options === null || options === void 0 ? void 0 : options.limit,
        iterator: options === null || options === void 0 ? void 0 : options.iterator,
        after: options === null || options === void 0 ? void 0 : options.after
      });
      return request2.send(this.requestCtx, eventStreamOut_1.EventStreamOutSerializer._fromJsonObject);
    }
  }
  streamingEvents.StreamingEvents = StreamingEvents;
  return streamingEvents;
}
var streamingSink = {};
var listResponseStreamSinkOut = {};
var streamSinkOut = {};
var azureBlobStorageConfig = {};
var hasRequiredAzureBlobStorageConfig;
function requireAzureBlobStorageConfig() {
  if (hasRequiredAzureBlobStorageConfig) return azureBlobStorageConfig;
  hasRequiredAzureBlobStorageConfig = 1;
  Object.defineProperty(azureBlobStorageConfig, "__esModule", { value: true });
  azureBlobStorageConfig.AzureBlobStorageConfigSerializer = void 0;
  azureBlobStorageConfig.AzureBlobStorageConfigSerializer = {
    _fromJsonObject(object) {
      return {
        accessKey: object["accessKey"],
        account: object["account"],
        container: object["container"]
      };
    },
    _toJsonObject(self) {
      return {
        accessKey: self.accessKey,
        account: self.account,
        container: self.container
      };
    }
  };
  return azureBlobStorageConfig;
}
var googleCloudStorageConfig = {};
var hasRequiredGoogleCloudStorageConfig;
function requireGoogleCloudStorageConfig() {
  if (hasRequiredGoogleCloudStorageConfig) return googleCloudStorageConfig;
  hasRequiredGoogleCloudStorageConfig = 1;
  Object.defineProperty(googleCloudStorageConfig, "__esModule", { value: true });
  googleCloudStorageConfig.GoogleCloudStorageConfigSerializer = void 0;
  googleCloudStorageConfig.GoogleCloudStorageConfigSerializer = {
    _fromJsonObject(object) {
      return {
        bucket: object["bucket"],
        credentials: object["credentials"]
      };
    },
    _toJsonObject(self) {
      return {
        bucket: self.bucket,
        credentials: self.credentials
      };
    }
  };
  return googleCloudStorageConfig;
}
var s3Config = {};
var hasRequiredS3Config;
function requireS3Config() {
  if (hasRequiredS3Config) return s3Config;
  hasRequiredS3Config = 1;
  Object.defineProperty(s3Config, "__esModule", { value: true });
  s3Config.S3ConfigSerializer = void 0;
  s3Config.S3ConfigSerializer = {
    _fromJsonObject(object) {
      return {
        accessKeyId: object["accessKeyId"],
        bucket: object["bucket"],
        region: object["region"],
        secretAccessKey: object["secretAccessKey"]
      };
    },
    _toJsonObject(self) {
      return {
        accessKeyId: self.accessKeyId,
        bucket: self.bucket,
        region: self.region,
        secretAccessKey: self.secretAccessKey
      };
    }
  };
  return s3Config;
}
var sinkHttpConfig = {};
var hasRequiredSinkHttpConfig;
function requireSinkHttpConfig() {
  if (hasRequiredSinkHttpConfig) return sinkHttpConfig;
  hasRequiredSinkHttpConfig = 1;
  Object.defineProperty(sinkHttpConfig, "__esModule", { value: true });
  sinkHttpConfig.SinkHttpConfigSerializer = void 0;
  sinkHttpConfig.SinkHttpConfigSerializer = {
    _fromJsonObject(object) {
      return {
        headers: object["headers"],
        key: object["key"],
        url: object["url"]
      };
    },
    _toJsonObject(self) {
      return {
        headers: self.headers,
        key: self.key,
        url: self.url
      };
    }
  };
  return sinkHttpConfig;
}
var sinkOtelV1Config = {};
var hasRequiredSinkOtelV1Config;
function requireSinkOtelV1Config() {
  if (hasRequiredSinkOtelV1Config) return sinkOtelV1Config;
  hasRequiredSinkOtelV1Config = 1;
  Object.defineProperty(sinkOtelV1Config, "__esModule", { value: true });
  sinkOtelV1Config.SinkOtelV1ConfigSerializer = void 0;
  sinkOtelV1Config.SinkOtelV1ConfigSerializer = {
    _fromJsonObject(object) {
      return {
        headers: object["headers"],
        url: object["url"]
      };
    },
    _toJsonObject(self) {
      return {
        headers: self.headers,
        url: self.url
      };
    }
  };
  return sinkOtelV1Config;
}
var sinkStatus = {};
var hasRequiredSinkStatus;
function requireSinkStatus() {
  if (hasRequiredSinkStatus) return sinkStatus;
  hasRequiredSinkStatus = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.SinkStatusSerializer = exports$1.SinkStatus = void 0;
    (function(SinkStatus) {
      SinkStatus["Enabled"] = "enabled";
      SinkStatus["Paused"] = "paused";
      SinkStatus["Disabled"] = "disabled";
      SinkStatus["Retrying"] = "retrying";
    })(exports$1.SinkStatus || (exports$1.SinkStatus = {}));
    exports$1.SinkStatusSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  })(sinkStatus);
  return sinkStatus;
}
var hasRequiredStreamSinkOut;
function requireStreamSinkOut() {
  if (hasRequiredStreamSinkOut) return streamSinkOut;
  hasRequiredStreamSinkOut = 1;
  Object.defineProperty(streamSinkOut, "__esModule", { value: true });
  streamSinkOut.StreamSinkOutSerializer = void 0;
  const azureBlobStorageConfig_1 = requireAzureBlobStorageConfig();
  const googleCloudStorageConfig_1 = requireGoogleCloudStorageConfig();
  const s3Config_1 = requireS3Config();
  const sinkHttpConfig_1 = requireSinkHttpConfig();
  const sinkOtelV1Config_1 = requireSinkOtelV1Config();
  const sinkStatus_1 = requireSinkStatus();
  streamSinkOut.StreamSinkOutSerializer = {
    _fromJsonObject(object) {
      const type = object["type"];
      function getConfig(type2) {
        switch (type2) {
          case "poller":
            return {};
          case "azureBlobStorage":
            return azureBlobStorageConfig_1.AzureBlobStorageConfigSerializer._fromJsonObject(object["config"]);
          case "otelTracing":
            return sinkOtelV1Config_1.SinkOtelV1ConfigSerializer._fromJsonObject(object["config"]);
          case "http":
            return sinkHttpConfig_1.SinkHttpConfigSerializer._fromJsonObject(object["config"]);
          case "amazonS3":
            return s3Config_1.S3ConfigSerializer._fromJsonObject(object["config"]);
          case "googleCloudStorage":
            return googleCloudStorageConfig_1.GoogleCloudStorageConfigSerializer._fromJsonObject(object["config"]);
          default:
            throw new Error(`Unexpected type: ${type2}`);
        }
      }
      return {
        type,
        config: getConfig(type),
        batchSize: object["batchSize"],
        createdAt: new Date(object["createdAt"]),
        currentIterator: object["currentIterator"],
        eventTypes: object["eventTypes"],
        failureReason: object["failureReason"],
        id: object["id"],
        maxWaitSecs: object["maxWaitSecs"],
        metadata: object["metadata"],
        nextRetryAt: object["nextRetryAt"] ? new Date(object["nextRetryAt"]) : null,
        status: sinkStatus_1.SinkStatusSerializer._fromJsonObject(object["status"]),
        uid: object["uid"],
        updatedAt: new Date(object["updatedAt"])
      };
    },
    _toJsonObject(self) {
      let config;
      switch (self.type) {
        case "poller":
          config = {};
          break;
        case "azureBlobStorage":
          config = azureBlobStorageConfig_1.AzureBlobStorageConfigSerializer._toJsonObject(self.config);
          break;
        case "otelTracing":
          config = sinkOtelV1Config_1.SinkOtelV1ConfigSerializer._toJsonObject(self.config);
          break;
        case "http":
          config = sinkHttpConfig_1.SinkHttpConfigSerializer._toJsonObject(self.config);
          break;
        case "amazonS3":
          config = s3Config_1.S3ConfigSerializer._toJsonObject(self.config);
          break;
        case "googleCloudStorage":
          config = googleCloudStorageConfig_1.GoogleCloudStorageConfigSerializer._toJsonObject(self.config);
          break;
      }
      return {
        type: self.type,
        config,
        batchSize: self.batchSize,
        createdAt: self.createdAt,
        currentIterator: self.currentIterator,
        eventTypes: self.eventTypes,
        failureReason: self.failureReason,
        id: self.id,
        maxWaitSecs: self.maxWaitSecs,
        metadata: self.metadata,
        nextRetryAt: self.nextRetryAt,
        status: sinkStatus_1.SinkStatusSerializer._toJsonObject(self.status),
        uid: self.uid,
        updatedAt: self.updatedAt
      };
    }
  };
  return streamSinkOut;
}
var hasRequiredListResponseStreamSinkOut;
function requireListResponseStreamSinkOut() {
  if (hasRequiredListResponseStreamSinkOut) return listResponseStreamSinkOut;
  hasRequiredListResponseStreamSinkOut = 1;
  Object.defineProperty(listResponseStreamSinkOut, "__esModule", { value: true });
  listResponseStreamSinkOut.ListResponseStreamSinkOutSerializer = void 0;
  const streamSinkOut_1 = requireStreamSinkOut();
  listResponseStreamSinkOut.ListResponseStreamSinkOutSerializer = {
    _fromJsonObject(object) {
      return {
        data: object["data"].map((item) => streamSinkOut_1.StreamSinkOutSerializer._fromJsonObject(item)),
        done: object["done"],
        iterator: object["iterator"],
        prevIterator: object["prevIterator"]
      };
    },
    _toJsonObject(self) {
      return {
        data: self.data.map((item) => streamSinkOut_1.StreamSinkOutSerializer._toJsonObject(item)),
        done: self.done,
        iterator: self.iterator,
        prevIterator: self.prevIterator
      };
    }
  };
  return listResponseStreamSinkOut;
}
var sinkSecretOut = {};
var hasRequiredSinkSecretOut;
function requireSinkSecretOut() {
  if (hasRequiredSinkSecretOut) return sinkSecretOut;
  hasRequiredSinkSecretOut = 1;
  Object.defineProperty(sinkSecretOut, "__esModule", { value: true });
  sinkSecretOut.SinkSecretOutSerializer = void 0;
  sinkSecretOut.SinkSecretOutSerializer = {
    _fromJsonObject(object) {
      return {
        key: object["key"]
      };
    },
    _toJsonObject(self) {
      return {
        key: self.key
      };
    }
  };
  return sinkSecretOut;
}
var sinkTransformIn = {};
var hasRequiredSinkTransformIn;
function requireSinkTransformIn() {
  if (hasRequiredSinkTransformIn) return sinkTransformIn;
  hasRequiredSinkTransformIn = 1;
  Object.defineProperty(sinkTransformIn, "__esModule", { value: true });
  sinkTransformIn.SinkTransformInSerializer = void 0;
  sinkTransformIn.SinkTransformInSerializer = {
    _fromJsonObject(object) {
      return {
        code: object["code"]
      };
    },
    _toJsonObject(self) {
      return {
        code: self.code
      };
    }
  };
  return sinkTransformIn;
}
var streamSinkIn = {};
var sinkStatusIn = {};
var hasRequiredSinkStatusIn;
function requireSinkStatusIn() {
  if (hasRequiredSinkStatusIn) return sinkStatusIn;
  hasRequiredSinkStatusIn = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.SinkStatusInSerializer = exports$1.SinkStatusIn = void 0;
    (function(SinkStatusIn) {
      SinkStatusIn["Enabled"] = "enabled";
      SinkStatusIn["Disabled"] = "disabled";
    })(exports$1.SinkStatusIn || (exports$1.SinkStatusIn = {}));
    exports$1.SinkStatusInSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  })(sinkStatusIn);
  return sinkStatusIn;
}
var hasRequiredStreamSinkIn;
function requireStreamSinkIn() {
  if (hasRequiredStreamSinkIn) return streamSinkIn;
  hasRequiredStreamSinkIn = 1;
  Object.defineProperty(streamSinkIn, "__esModule", { value: true });
  streamSinkIn.StreamSinkInSerializer = void 0;
  const azureBlobStorageConfig_1 = requireAzureBlobStorageConfig();
  const googleCloudStorageConfig_1 = requireGoogleCloudStorageConfig();
  const s3Config_1 = requireS3Config();
  const sinkHttpConfig_1 = requireSinkHttpConfig();
  const sinkOtelV1Config_1 = requireSinkOtelV1Config();
  const sinkStatusIn_1 = requireSinkStatusIn();
  streamSinkIn.StreamSinkInSerializer = {
    _fromJsonObject(object) {
      const type = object["type"];
      function getConfig(type2) {
        switch (type2) {
          case "poller":
            return {};
          case "azureBlobStorage":
            return azureBlobStorageConfig_1.AzureBlobStorageConfigSerializer._fromJsonObject(object["config"]);
          case "otelTracing":
            return sinkOtelV1Config_1.SinkOtelV1ConfigSerializer._fromJsonObject(object["config"]);
          case "http":
            return sinkHttpConfig_1.SinkHttpConfigSerializer._fromJsonObject(object["config"]);
          case "amazonS3":
            return s3Config_1.S3ConfigSerializer._fromJsonObject(object["config"]);
          case "googleCloudStorage":
            return googleCloudStorageConfig_1.GoogleCloudStorageConfigSerializer._fromJsonObject(object["config"]);
          default:
            throw new Error(`Unexpected type: ${type2}`);
        }
      }
      return {
        type,
        config: getConfig(type),
        batchSize: object["batchSize"],
        eventTypes: object["eventTypes"],
        maxWaitSecs: object["maxWaitSecs"],
        metadata: object["metadata"],
        status: object["status"] != null ? sinkStatusIn_1.SinkStatusInSerializer._fromJsonObject(object["status"]) : void 0,
        uid: object["uid"]
      };
    },
    _toJsonObject(self) {
      let config;
      switch (self.type) {
        case "poller":
          config = {};
          break;
        case "azureBlobStorage":
          config = azureBlobStorageConfig_1.AzureBlobStorageConfigSerializer._toJsonObject(self.config);
          break;
        case "otelTracing":
          config = sinkOtelV1Config_1.SinkOtelV1ConfigSerializer._toJsonObject(self.config);
          break;
        case "http":
          config = sinkHttpConfig_1.SinkHttpConfigSerializer._toJsonObject(self.config);
          break;
        case "amazonS3":
          config = s3Config_1.S3ConfigSerializer._toJsonObject(self.config);
          break;
        case "googleCloudStorage":
          config = googleCloudStorageConfig_1.GoogleCloudStorageConfigSerializer._toJsonObject(self.config);
          break;
      }
      return {
        type: self.type,
        config,
        batchSize: self.batchSize,
        eventTypes: self.eventTypes,
        maxWaitSecs: self.maxWaitSecs,
        metadata: self.metadata,
        status: self.status != null ? sinkStatusIn_1.SinkStatusInSerializer._toJsonObject(self.status) : void 0,
        uid: self.uid
      };
    }
  };
  return streamSinkIn;
}
var streamSinkPatch = {};
var amazonS3PatchConfig = {};
var hasRequiredAmazonS3PatchConfig;
function requireAmazonS3PatchConfig() {
  if (hasRequiredAmazonS3PatchConfig) return amazonS3PatchConfig;
  hasRequiredAmazonS3PatchConfig = 1;
  Object.defineProperty(amazonS3PatchConfig, "__esModule", { value: true });
  amazonS3PatchConfig.AmazonS3PatchConfigSerializer = void 0;
  amazonS3PatchConfig.AmazonS3PatchConfigSerializer = {
    _fromJsonObject(object) {
      return {
        accessKeyId: object["accessKeyId"],
        bucket: object["bucket"],
        region: object["region"],
        secretAccessKey: object["secretAccessKey"]
      };
    },
    _toJsonObject(self) {
      return {
        accessKeyId: self.accessKeyId,
        bucket: self.bucket,
        region: self.region,
        secretAccessKey: self.secretAccessKey
      };
    }
  };
  return amazonS3PatchConfig;
}
var azureBlobStoragePatchConfig = {};
var hasRequiredAzureBlobStoragePatchConfig;
function requireAzureBlobStoragePatchConfig() {
  if (hasRequiredAzureBlobStoragePatchConfig) return azureBlobStoragePatchConfig;
  hasRequiredAzureBlobStoragePatchConfig = 1;
  Object.defineProperty(azureBlobStoragePatchConfig, "__esModule", { value: true });
  azureBlobStoragePatchConfig.AzureBlobStoragePatchConfigSerializer = void 0;
  azureBlobStoragePatchConfig.AzureBlobStoragePatchConfigSerializer = {
    _fromJsonObject(object) {
      return {
        accessKey: object["accessKey"],
        account: object["account"],
        container: object["container"]
      };
    },
    _toJsonObject(self) {
      return {
        accessKey: self.accessKey,
        account: self.account,
        container: self.container
      };
    }
  };
  return azureBlobStoragePatchConfig;
}
var googleCloudStoragePatchConfig = {};
var hasRequiredGoogleCloudStoragePatchConfig;
function requireGoogleCloudStoragePatchConfig() {
  if (hasRequiredGoogleCloudStoragePatchConfig) return googleCloudStoragePatchConfig;
  hasRequiredGoogleCloudStoragePatchConfig = 1;
  Object.defineProperty(googleCloudStoragePatchConfig, "__esModule", { value: true });
  googleCloudStoragePatchConfig.GoogleCloudStoragePatchConfigSerializer = void 0;
  googleCloudStoragePatchConfig.GoogleCloudStoragePatchConfigSerializer = {
    _fromJsonObject(object) {
      return {
        bucket: object["bucket"],
        credentials: object["credentials"]
      };
    },
    _toJsonObject(self) {
      return {
        bucket: self.bucket,
        credentials: self.credentials
      };
    }
  };
  return googleCloudStoragePatchConfig;
}
var httpPatchConfig = {};
var hasRequiredHttpPatchConfig;
function requireHttpPatchConfig() {
  if (hasRequiredHttpPatchConfig) return httpPatchConfig;
  hasRequiredHttpPatchConfig = 1;
  Object.defineProperty(httpPatchConfig, "__esModule", { value: true });
  httpPatchConfig.HttpPatchConfigSerializer = void 0;
  httpPatchConfig.HttpPatchConfigSerializer = {
    _fromJsonObject(object) {
      return {
        url: object["url"]
      };
    },
    _toJsonObject(self) {
      return {
        url: self.url
      };
    }
  };
  return httpPatchConfig;
}
var otelTracingPatchConfig = {};
var hasRequiredOtelTracingPatchConfig;
function requireOtelTracingPatchConfig() {
  if (hasRequiredOtelTracingPatchConfig) return otelTracingPatchConfig;
  hasRequiredOtelTracingPatchConfig = 1;
  Object.defineProperty(otelTracingPatchConfig, "__esModule", { value: true });
  otelTracingPatchConfig.OtelTracingPatchConfigSerializer = void 0;
  otelTracingPatchConfig.OtelTracingPatchConfigSerializer = {
    _fromJsonObject(object) {
      return {
        url: object["url"]
      };
    },
    _toJsonObject(self) {
      return {
        url: self.url
      };
    }
  };
  return otelTracingPatchConfig;
}
var hasRequiredStreamSinkPatch;
function requireStreamSinkPatch() {
  if (hasRequiredStreamSinkPatch) return streamSinkPatch;
  hasRequiredStreamSinkPatch = 1;
  Object.defineProperty(streamSinkPatch, "__esModule", { value: true });
  streamSinkPatch.StreamSinkPatchSerializer = void 0;
  const amazonS3PatchConfig_1 = requireAmazonS3PatchConfig();
  const azureBlobStoragePatchConfig_1 = requireAzureBlobStoragePatchConfig();
  const googleCloudStoragePatchConfig_1 = requireGoogleCloudStoragePatchConfig();
  const httpPatchConfig_1 = requireHttpPatchConfig();
  const otelTracingPatchConfig_1 = requireOtelTracingPatchConfig();
  const sinkStatusIn_1 = requireSinkStatusIn();
  streamSinkPatch.StreamSinkPatchSerializer = {
    _fromJsonObject(object) {
      const type = object["type"];
      function getConfig(type2) {
        switch (type2) {
          case "poller":
            return {};
          case "azureBlobStorage":
            return azureBlobStoragePatchConfig_1.AzureBlobStoragePatchConfigSerializer._fromJsonObject(object["config"]);
          case "otelTracing":
            return otelTracingPatchConfig_1.OtelTracingPatchConfigSerializer._fromJsonObject(object["config"]);
          case "http":
            return httpPatchConfig_1.HttpPatchConfigSerializer._fromJsonObject(object["config"]);
          case "amazonS3":
            return amazonS3PatchConfig_1.AmazonS3PatchConfigSerializer._fromJsonObject(object["config"]);
          case "googleCloudStorage":
            return googleCloudStoragePatchConfig_1.GoogleCloudStoragePatchConfigSerializer._fromJsonObject(object["config"]);
          default:
            throw new Error(`Unexpected type: ${type2}`);
        }
      }
      return {
        type,
        config: getConfig(type),
        batchSize: object["batchSize"],
        eventTypes: object["eventTypes"],
        maxWaitSecs: object["maxWaitSecs"],
        metadata: object["metadata"],
        status: object["status"] != null ? sinkStatusIn_1.SinkStatusInSerializer._fromJsonObject(object["status"]) : void 0,
        uid: object["uid"]
      };
    },
    _toJsonObject(self) {
      let config;
      switch (self.type) {
        case "poller":
          config = {};
          break;
        case "azureBlobStorage":
          config = azureBlobStoragePatchConfig_1.AzureBlobStoragePatchConfigSerializer._toJsonObject(self.config);
          break;
        case "otelTracing":
          config = otelTracingPatchConfig_1.OtelTracingPatchConfigSerializer._toJsonObject(self.config);
          break;
        case "http":
          config = httpPatchConfig_1.HttpPatchConfigSerializer._toJsonObject(self.config);
          break;
        case "amazonS3":
          config = amazonS3PatchConfig_1.AmazonS3PatchConfigSerializer._toJsonObject(self.config);
          break;
        case "googleCloudStorage":
          config = googleCloudStoragePatchConfig_1.GoogleCloudStoragePatchConfigSerializer._toJsonObject(self.config);
          break;
      }
      return {
        type: self.type,
        config,
        batchSize: self.batchSize,
        eventTypes: self.eventTypes,
        maxWaitSecs: self.maxWaitSecs,
        metadata: self.metadata,
        status: self.status != null ? sinkStatusIn_1.SinkStatusInSerializer._toJsonObject(self.status) : void 0,
        uid: self.uid
      };
    }
  };
  return streamSinkPatch;
}
var hasRequiredStreamingSink;
function requireStreamingSink() {
  if (hasRequiredStreamingSink) return streamingSink;
  hasRequiredStreamingSink = 1;
  Object.defineProperty(streamingSink, "__esModule", { value: true });
  streamingSink.StreamingSink = void 0;
  const emptyResponse_1 = requireEmptyResponse();
  const endpointSecretRotateIn_1 = requireEndpointSecretRotateIn();
  const listResponseStreamSinkOut_1 = requireListResponseStreamSinkOut();
  const sinkSecretOut_1 = requireSinkSecretOut();
  const sinkTransformIn_1 = requireSinkTransformIn();
  const streamSinkIn_1 = requireStreamSinkIn();
  const streamSinkOut_1 = requireStreamSinkOut();
  const streamSinkPatch_1 = requireStreamSinkPatch();
  const request_1 = requireRequest();
  class StreamingSink {
    constructor(requestCtx) {
      this.requestCtx = requestCtx;
    }
    list(streamId, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}/sink");
      request2.setPathParam("stream_id", streamId);
      request2.setQueryParams({
        limit: options === null || options === void 0 ? void 0 : options.limit,
        iterator: options === null || options === void 0 ? void 0 : options.iterator,
        order: options === null || options === void 0 ? void 0 : options.order
      });
      return request2.send(this.requestCtx, listResponseStreamSinkOut_1.ListResponseStreamSinkOutSerializer._fromJsonObject);
    }
    create(streamId, streamSinkIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/stream/{stream_id}/sink");
      request2.setPathParam("stream_id", streamId);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(streamSinkIn_1.StreamSinkInSerializer._toJsonObject(streamSinkIn2));
      return request2.send(this.requestCtx, streamSinkOut_1.StreamSinkOutSerializer._fromJsonObject);
    }
    get(streamId, sinkId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}/sink/{sink_id}");
      request2.setPathParam("stream_id", streamId);
      request2.setPathParam("sink_id", sinkId);
      return request2.send(this.requestCtx, streamSinkOut_1.StreamSinkOutSerializer._fromJsonObject);
    }
    update(streamId, sinkId, streamSinkIn2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/stream/{stream_id}/sink/{sink_id}");
      request2.setPathParam("stream_id", streamId);
      request2.setPathParam("sink_id", sinkId);
      request2.setBody(streamSinkIn_1.StreamSinkInSerializer._toJsonObject(streamSinkIn2));
      return request2.send(this.requestCtx, streamSinkOut_1.StreamSinkOutSerializer._fromJsonObject);
    }
    delete(streamId, sinkId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/stream/{stream_id}/sink/{sink_id}");
      request2.setPathParam("stream_id", streamId);
      request2.setPathParam("sink_id", sinkId);
      return request2.sendNoResponseBody(this.requestCtx);
    }
    patch(streamId, sinkId, streamSinkPatch2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/stream/{stream_id}/sink/{sink_id}");
      request2.setPathParam("stream_id", streamId);
      request2.setPathParam("sink_id", sinkId);
      request2.setBody(streamSinkPatch_1.StreamSinkPatchSerializer._toJsonObject(streamSinkPatch2));
      return request2.send(this.requestCtx, streamSinkOut_1.StreamSinkOutSerializer._fromJsonObject);
    }
    getSecret(streamId, sinkId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}/sink/{sink_id}/secret");
      request2.setPathParam("stream_id", streamId);
      request2.setPathParam("sink_id", sinkId);
      return request2.send(this.requestCtx, sinkSecretOut_1.SinkSecretOutSerializer._fromJsonObject);
    }
    rotateSecret(streamId, sinkId, endpointSecretRotateIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/stream/{stream_id}/sink/{sink_id}/secret/rotate");
      request2.setPathParam("stream_id", streamId);
      request2.setPathParam("sink_id", sinkId);
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(endpointSecretRotateIn_1.EndpointSecretRotateInSerializer._toJsonObject(endpointSecretRotateIn2));
      return request2.send(this.requestCtx, emptyResponse_1.EmptyResponseSerializer._fromJsonObject);
    }
    transformationPartialUpdate(streamId, sinkId, sinkTransformIn2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/stream/{stream_id}/sink/{sink_id}/transformation");
      request2.setPathParam("stream_id", streamId);
      request2.setPathParam("sink_id", sinkId);
      request2.setBody(sinkTransformIn_1.SinkTransformInSerializer._toJsonObject(sinkTransformIn2));
      return request2.send(this.requestCtx, emptyResponse_1.EmptyResponseSerializer._fromJsonObject);
    }
  }
  streamingSink.StreamingSink = StreamingSink;
  return streamingSink;
}
var streamingStream = {};
var listResponseStreamOut = {};
var streamOut = {};
var hasRequiredStreamOut;
function requireStreamOut() {
  if (hasRequiredStreamOut) return streamOut;
  hasRequiredStreamOut = 1;
  Object.defineProperty(streamOut, "__esModule", { value: true });
  streamOut.StreamOutSerializer = void 0;
  streamOut.StreamOutSerializer = {
    _fromJsonObject(object) {
      return {
        createdAt: new Date(object["createdAt"]),
        id: object["id"],
        metadata: object["metadata"],
        name: object["name"],
        uid: object["uid"],
        updatedAt: new Date(object["updatedAt"])
      };
    },
    _toJsonObject(self) {
      return {
        createdAt: self.createdAt,
        id: self.id,
        metadata: self.metadata,
        name: self.name,
        uid: self.uid,
        updatedAt: self.updatedAt
      };
    }
  };
  return streamOut;
}
var hasRequiredListResponseStreamOut;
function requireListResponseStreamOut() {
  if (hasRequiredListResponseStreamOut) return listResponseStreamOut;
  hasRequiredListResponseStreamOut = 1;
  Object.defineProperty(listResponseStreamOut, "__esModule", { value: true });
  listResponseStreamOut.ListResponseStreamOutSerializer = void 0;
  const streamOut_1 = requireStreamOut();
  listResponseStreamOut.ListResponseStreamOutSerializer = {
    _fromJsonObject(object) {
      return {
        data: object["data"].map((item) => streamOut_1.StreamOutSerializer._fromJsonObject(item)),
        done: object["done"],
        iterator: object["iterator"],
        prevIterator: object["prevIterator"]
      };
    },
    _toJsonObject(self) {
      return {
        data: self.data.map((item) => streamOut_1.StreamOutSerializer._toJsonObject(item)),
        done: self.done,
        iterator: self.iterator,
        prevIterator: self.prevIterator
      };
    }
  };
  return listResponseStreamOut;
}
var streamPatch = {};
var hasRequiredStreamPatch;
function requireStreamPatch() {
  if (hasRequiredStreamPatch) return streamPatch;
  hasRequiredStreamPatch = 1;
  Object.defineProperty(streamPatch, "__esModule", { value: true });
  streamPatch.StreamPatchSerializer = void 0;
  streamPatch.StreamPatchSerializer = {
    _fromJsonObject(object) {
      return {
        description: object["description"],
        metadata: object["metadata"],
        uid: object["uid"]
      };
    },
    _toJsonObject(self) {
      return {
        description: self.description,
        metadata: self.metadata,
        uid: self.uid
      };
    }
  };
  return streamPatch;
}
var hasRequiredStreamingStream;
function requireStreamingStream() {
  if (hasRequiredStreamingStream) return streamingStream;
  hasRequiredStreamingStream = 1;
  Object.defineProperty(streamingStream, "__esModule", { value: true });
  streamingStream.StreamingStream = void 0;
  const listResponseStreamOut_1 = requireListResponseStreamOut();
  const streamIn_1 = requireStreamIn();
  const streamOut_1 = requireStreamOut();
  const streamPatch_1 = requireStreamPatch();
  const request_1 = requireRequest();
  class StreamingStream {
    constructor(requestCtx) {
      this.requestCtx = requestCtx;
    }
    list(options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream");
      request2.setQueryParams({
        limit: options === null || options === void 0 ? void 0 : options.limit,
        iterator: options === null || options === void 0 ? void 0 : options.iterator,
        order: options === null || options === void 0 ? void 0 : options.order
      });
      return request2.send(this.requestCtx, listResponseStreamOut_1.ListResponseStreamOutSerializer._fromJsonObject);
    }
    create(streamIn2, options) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.POST, "/api/v1/stream");
      request2.setHeaderParam("idempotency-key", options === null || options === void 0 ? void 0 : options.idempotencyKey);
      request2.setBody(streamIn_1.StreamInSerializer._toJsonObject(streamIn2));
      return request2.send(this.requestCtx, streamOut_1.StreamOutSerializer._fromJsonObject);
    }
    get(streamId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}");
      request2.setPathParam("stream_id", streamId);
      return request2.send(this.requestCtx, streamOut_1.StreamOutSerializer._fromJsonObject);
    }
    update(streamId, streamIn2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PUT, "/api/v1/stream/{stream_id}");
      request2.setPathParam("stream_id", streamId);
      request2.setBody(streamIn_1.StreamInSerializer._toJsonObject(streamIn2));
      return request2.send(this.requestCtx, streamOut_1.StreamOutSerializer._fromJsonObject);
    }
    delete(streamId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.DELETE, "/api/v1/stream/{stream_id}");
      request2.setPathParam("stream_id", streamId);
      return request2.sendNoResponseBody(this.requestCtx);
    }
    patch(streamId, streamPatch2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/stream/{stream_id}");
      request2.setPathParam("stream_id", streamId);
      request2.setBody(streamPatch_1.StreamPatchSerializer._toJsonObject(streamPatch2));
      return request2.send(this.requestCtx, streamOut_1.StreamOutSerializer._fromJsonObject);
    }
  }
  streamingStream.StreamingStream = StreamingStream;
  return streamingStream;
}
var hasRequiredStreaming;
function requireStreaming() {
  if (hasRequiredStreaming) return streaming;
  hasRequiredStreaming = 1;
  Object.defineProperty(streaming, "__esModule", { value: true });
  streaming.Streaming = void 0;
  const endpointHeadersOut_1 = requireEndpointHeadersOut();
  const httpSinkHeadersPatchIn_1 = requireHttpSinkHeadersPatchIn();
  const sinkTransformationOut_1 = requireSinkTransformationOut();
  const streamingEventType_1 = requireStreamingEventType();
  const streamingEvents_1 = requireStreamingEvents();
  const streamingSink_1 = requireStreamingSink();
  const streamingStream_1 = requireStreamingStream();
  const request_1 = requireRequest();
  class Streaming {
    constructor(requestCtx) {
      this.requestCtx = requestCtx;
    }
    get event_type() {
      return new streamingEventType_1.StreamingEventType(this.requestCtx);
    }
    get events() {
      return new streamingEvents_1.StreamingEvents(this.requestCtx);
    }
    get sink() {
      return new streamingSink_1.StreamingSink(this.requestCtx);
    }
    get stream() {
      return new streamingStream_1.StreamingStream(this.requestCtx);
    }
    sinkHeadersGet(streamId, sinkId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}/sink/{sink_id}/headers");
      request2.setPathParam("stream_id", streamId);
      request2.setPathParam("sink_id", sinkId);
      return request2.send(this.requestCtx, endpointHeadersOut_1.EndpointHeadersOutSerializer._fromJsonObject);
    }
    sinkHeadersPatch(streamId, sinkId, httpSinkHeadersPatchIn2) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.PATCH, "/api/v1/stream/{stream_id}/sink/{sink_id}/headers");
      request2.setPathParam("stream_id", streamId);
      request2.setPathParam("sink_id", sinkId);
      request2.setBody(httpSinkHeadersPatchIn_1.HttpSinkHeadersPatchInSerializer._toJsonObject(httpSinkHeadersPatchIn2));
      return request2.send(this.requestCtx, endpointHeadersOut_1.EndpointHeadersOutSerializer._fromJsonObject);
    }
    sinkTransformationGet(streamId, sinkId) {
      const request2 = new request_1.SvixRequest(request_1.HttpMethod.GET, "/api/v1/stream/{stream_id}/sink/{sink_id}/transformation");
      request2.setPathParam("stream_id", streamId);
      request2.setPathParam("sink_id", sinkId);
      return request2.send(this.requestCtx, sinkTransformationOut_1.SinkTransformationOutSerializer._fromJsonObject);
    }
  }
  streaming.Streaming = Streaming;
  return streaming;
}
var HttpErrors = {};
var hasRequiredHttpErrors;
function requireHttpErrors() {
  if (hasRequiredHttpErrors) return HttpErrors;
  hasRequiredHttpErrors = 1;
  Object.defineProperty(HttpErrors, "__esModule", { value: true });
  HttpErrors.HTTPValidationError = HttpErrors.ValidationError = HttpErrors.HttpErrorOut = void 0;
  class HttpErrorOut {
    static getAttributeTypeMap() {
      return HttpErrorOut.attributeTypeMap;
    }
  }
  HttpErrors.HttpErrorOut = HttpErrorOut;
  HttpErrorOut.discriminator = void 0;
  HttpErrorOut.mapping = void 0;
  HttpErrorOut.attributeTypeMap = [
    {
      name: "code",
      baseName: "code",
      type: "string",
      format: ""
    },
    {
      name: "detail",
      baseName: "detail",
      type: "string",
      format: ""
    }
  ];
  class ValidationError {
    static getAttributeTypeMap() {
      return ValidationError.attributeTypeMap;
    }
  }
  HttpErrors.ValidationError = ValidationError;
  ValidationError.discriminator = void 0;
  ValidationError.mapping = void 0;
  ValidationError.attributeTypeMap = [
    {
      name: "loc",
      baseName: "loc",
      type: "Array<string>",
      format: ""
    },
    {
      name: "msg",
      baseName: "msg",
      type: "string",
      format: ""
    },
    {
      name: "type",
      baseName: "type",
      type: "string",
      format: ""
    }
  ];
  class HTTPValidationError {
    static getAttributeTypeMap() {
      return HTTPValidationError.attributeTypeMap;
    }
  }
  HttpErrors.HTTPValidationError = HTTPValidationError;
  HTTPValidationError.discriminator = void 0;
  HTTPValidationError.mapping = void 0;
  HTTPValidationError.attributeTypeMap = [
    {
      name: "detail",
      baseName: "detail",
      type: "Array<ValidationError>",
      format: ""
    }
  ];
  return HttpErrors;
}
var webhook = {};
var dist = {};
var timing_safe_equal = {};
var hasRequiredTiming_safe_equal;
function requireTiming_safe_equal() {
  if (hasRequiredTiming_safe_equal) return timing_safe_equal;
  hasRequiredTiming_safe_equal = 1;
  Object.defineProperty(timing_safe_equal, "__esModule", { value: true });
  timing_safe_equal.timingSafeEqual = void 0;
  function assert(expr, msg = "") {
    if (!expr) {
      throw new Error(msg);
    }
  }
  function timingSafeEqual(a, b) {
    if (a.byteLength !== b.byteLength) {
      return false;
    }
    if (!(a instanceof DataView)) {
      a = new DataView(ArrayBuffer.isView(a) ? a.buffer : a);
    }
    if (!(b instanceof DataView)) {
      b = new DataView(ArrayBuffer.isView(b) ? b.buffer : b);
    }
    assert(a instanceof DataView);
    assert(b instanceof DataView);
    const length = a.byteLength;
    let out = 0;
    let i = -1;
    while (++i < length) {
      out |= a.getUint8(i) ^ b.getUint8(i);
    }
    return out === 0;
  }
  timing_safe_equal.timingSafeEqual = timingSafeEqual;
  return timing_safe_equal;
}
var base64 = {};
var hasRequiredBase64;
function requireBase64() {
  if (hasRequiredBase64) return base64;
  hasRequiredBase64 = 1;
  var __extends = base64 && base64.__extends || /* @__PURE__ */ (function() {
    var extendStatics = function(d, b) {
      extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d2, b2) {
        d2.__proto__ = b2;
      } || function(d2, b2) {
        for (var p in b2) if (b2.hasOwnProperty(p)) d2[p] = b2[p];
      };
      return extendStatics(d, b);
    };
    return function(d, b) {
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
  })();
  Object.defineProperty(base64, "__esModule", { value: true });
  var INVALID_BYTE = 256;
  var Coder = (
    /** @class */
    (function() {
      function Coder2(_paddingCharacter) {
        if (_paddingCharacter === void 0) {
          _paddingCharacter = "=";
        }
        this._paddingCharacter = _paddingCharacter;
      }
      Coder2.prototype.encodedLength = function(length) {
        if (!this._paddingCharacter) {
          return (length * 8 + 5) / 6 | 0;
        }
        return (length + 2) / 3 * 4 | 0;
      };
      Coder2.prototype.encode = function(data) {
        var out = "";
        var i = 0;
        for (; i < data.length - 2; i += 3) {
          var c = data[i] << 16 | data[i + 1] << 8 | data[i + 2];
          out += this._encodeByte(c >>> 3 * 6 & 63);
          out += this._encodeByte(c >>> 2 * 6 & 63);
          out += this._encodeByte(c >>> 1 * 6 & 63);
          out += this._encodeByte(c >>> 0 * 6 & 63);
        }
        var left = data.length - i;
        if (left > 0) {
          var c = data[i] << 16 | (left === 2 ? data[i + 1] << 8 : 0);
          out += this._encodeByte(c >>> 3 * 6 & 63);
          out += this._encodeByte(c >>> 2 * 6 & 63);
          if (left === 2) {
            out += this._encodeByte(c >>> 1 * 6 & 63);
          } else {
            out += this._paddingCharacter || "";
          }
          out += this._paddingCharacter || "";
        }
        return out;
      };
      Coder2.prototype.maxDecodedLength = function(length) {
        if (!this._paddingCharacter) {
          return (length * 6 + 7) / 8 | 0;
        }
        return length / 4 * 3 | 0;
      };
      Coder2.prototype.decodedLength = function(s) {
        return this.maxDecodedLength(s.length - this._getPaddingLength(s));
      };
      Coder2.prototype.decode = function(s) {
        if (s.length === 0) {
          return new Uint8Array(0);
        }
        var paddingLength = this._getPaddingLength(s);
        var length = s.length - paddingLength;
        var out = new Uint8Array(this.maxDecodedLength(length));
        var op = 0;
        var i = 0;
        var haveBad = 0;
        var v0 = 0, v12 = 0, v2 = 0, v32 = 0;
        for (; i < length - 4; i += 4) {
          v0 = this._decodeChar(s.charCodeAt(i + 0));
          v12 = this._decodeChar(s.charCodeAt(i + 1));
          v2 = this._decodeChar(s.charCodeAt(i + 2));
          v32 = this._decodeChar(s.charCodeAt(i + 3));
          out[op++] = v0 << 2 | v12 >>> 4;
          out[op++] = v12 << 4 | v2 >>> 2;
          out[op++] = v2 << 6 | v32;
          haveBad |= v0 & INVALID_BYTE;
          haveBad |= v12 & INVALID_BYTE;
          haveBad |= v2 & INVALID_BYTE;
          haveBad |= v32 & INVALID_BYTE;
        }
        if (i < length - 1) {
          v0 = this._decodeChar(s.charCodeAt(i));
          v12 = this._decodeChar(s.charCodeAt(i + 1));
          out[op++] = v0 << 2 | v12 >>> 4;
          haveBad |= v0 & INVALID_BYTE;
          haveBad |= v12 & INVALID_BYTE;
        }
        if (i < length - 2) {
          v2 = this._decodeChar(s.charCodeAt(i + 2));
          out[op++] = v12 << 4 | v2 >>> 2;
          haveBad |= v2 & INVALID_BYTE;
        }
        if (i < length - 3) {
          v32 = this._decodeChar(s.charCodeAt(i + 3));
          out[op++] = v2 << 6 | v32;
          haveBad |= v32 & INVALID_BYTE;
        }
        if (haveBad !== 0) {
          throw new Error("Base64Coder: incorrect characters for decoding");
        }
        return out;
      };
      Coder2.prototype._encodeByte = function(b) {
        var result = b;
        result += 65;
        result += 25 - b >>> 8 & 0 - 65 - 26 + 97;
        result += 51 - b >>> 8 & 26 - 97 - 52 + 48;
        result += 61 - b >>> 8 & 52 - 48 - 62 + 43;
        result += 62 - b >>> 8 & 62 - 43 - 63 + 47;
        return String.fromCharCode(result);
      };
      Coder2.prototype._decodeChar = function(c) {
        var result = INVALID_BYTE;
        result += (42 - c & c - 44) >>> 8 & -INVALID_BYTE + c - 43 + 62;
        result += (46 - c & c - 48) >>> 8 & -INVALID_BYTE + c - 47 + 63;
        result += (47 - c & c - 58) >>> 8 & -INVALID_BYTE + c - 48 + 52;
        result += (64 - c & c - 91) >>> 8 & -INVALID_BYTE + c - 65 + 0;
        result += (96 - c & c - 123) >>> 8 & -INVALID_BYTE + c - 97 + 26;
        return result;
      };
      Coder2.prototype._getPaddingLength = function(s) {
        var paddingLength = 0;
        if (this._paddingCharacter) {
          for (var i = s.length - 1; i >= 0; i--) {
            if (s[i] !== this._paddingCharacter) {
              break;
            }
            paddingLength++;
          }
          if (s.length < 4 || paddingLength > 2) {
            throw new Error("Base64Coder: incorrect padding");
          }
        }
        return paddingLength;
      };
      return Coder2;
    })()
  );
  base64.Coder = Coder;
  var stdCoder = new Coder();
  function encode(data) {
    return stdCoder.encode(data);
  }
  base64.encode = encode;
  function decode(s) {
    return stdCoder.decode(s);
  }
  base64.decode = decode;
  var URLSafeCoder = (
    /** @class */
    (function(_super) {
      __extends(URLSafeCoder2, _super);
      function URLSafeCoder2() {
        return _super !== null && _super.apply(this, arguments) || this;
      }
      URLSafeCoder2.prototype._encodeByte = function(b) {
        var result = b;
        result += 65;
        result += 25 - b >>> 8 & 0 - 65 - 26 + 97;
        result += 51 - b >>> 8 & 26 - 97 - 52 + 48;
        result += 61 - b >>> 8 & 52 - 48 - 62 + 45;
        result += 62 - b >>> 8 & 62 - 45 - 63 + 95;
        return String.fromCharCode(result);
      };
      URLSafeCoder2.prototype._decodeChar = function(c) {
        var result = INVALID_BYTE;
        result += (44 - c & c - 46) >>> 8 & -INVALID_BYTE + c - 45 + 62;
        result += (94 - c & c - 96) >>> 8 & -INVALID_BYTE + c - 95 + 63;
        result += (47 - c & c - 58) >>> 8 & -INVALID_BYTE + c - 48 + 52;
        result += (64 - c & c - 91) >>> 8 & -INVALID_BYTE + c - 65 + 0;
        result += (96 - c & c - 123) >>> 8 & -INVALID_BYTE + c - 97 + 26;
        return result;
      };
      return URLSafeCoder2;
    })(Coder)
  );
  base64.URLSafeCoder = URLSafeCoder;
  var urlSafeCoder = new URLSafeCoder();
  function encodeURLSafe(data) {
    return urlSafeCoder.encode(data);
  }
  base64.encodeURLSafe = encodeURLSafe;
  function decodeURLSafe(s) {
    return urlSafeCoder.decode(s);
  }
  base64.decodeURLSafe = decodeURLSafe;
  base64.encodedLength = function(length) {
    return stdCoder.encodedLength(length);
  };
  base64.maxDecodedLength = function(length) {
    return stdCoder.maxDecodedLength(length);
  };
  base64.decodedLength = function(s) {
    return stdCoder.decodedLength(s);
  };
  return base64;
}
var sha256$1 = { exports: {} };
var sha256 = sha256$1.exports;
var hasRequiredSha256;
function requireSha256() {
  if (hasRequiredSha256) return sha256$1.exports;
  hasRequiredSha256 = 1;
  (function(module) {
    (function(root, factory) {
      var exports$1 = {};
      factory(exports$1);
      var sha2562 = exports$1["default"];
      for (var k in exports$1) {
        sha2562[k] = exports$1[k];
      }
      {
        module.exports = sha2562;
      }
    })(sha256, function(exports$1) {
      exports$1.__esModule = true;
      exports$1.digestLength = 32;
      exports$1.blockSize = 64;
      var K = new Uint32Array([
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298
      ]);
      function hashBlocks(w, v, p, pos, len) {
        var a, b, c, d, e, f, g, h, u, i, j, t1, t2;
        while (len >= 64) {
          a = v[0];
          b = v[1];
          c = v[2];
          d = v[3];
          e = v[4];
          f = v[5];
          g = v[6];
          h = v[7];
          for (i = 0; i < 16; i++) {
            j = pos + i * 4;
            w[i] = (p[j] & 255) << 24 | (p[j + 1] & 255) << 16 | (p[j + 2] & 255) << 8 | p[j + 3] & 255;
          }
          for (i = 16; i < 64; i++) {
            u = w[i - 2];
            t1 = (u >>> 17 | u << 32 - 17) ^ (u >>> 19 | u << 32 - 19) ^ u >>> 10;
            u = w[i - 15];
            t2 = (u >>> 7 | u << 32 - 7) ^ (u >>> 18 | u << 32 - 18) ^ u >>> 3;
            w[i] = (t1 + w[i - 7] | 0) + (t2 + w[i - 16] | 0);
          }
          for (i = 0; i < 64; i++) {
            t1 = (((e >>> 6 | e << 32 - 6) ^ (e >>> 11 | e << 32 - 11) ^ (e >>> 25 | e << 32 - 25)) + (e & f ^ ~e & g) | 0) + (h + (K[i] + w[i] | 0) | 0) | 0;
            t2 = ((a >>> 2 | a << 32 - 2) ^ (a >>> 13 | a << 32 - 13) ^ (a >>> 22 | a << 32 - 22)) + (a & b ^ a & c ^ b & c) | 0;
            h = g;
            g = f;
            f = e;
            e = d + t1 | 0;
            d = c;
            c = b;
            b = a;
            a = t1 + t2 | 0;
          }
          v[0] += a;
          v[1] += b;
          v[2] += c;
          v[3] += d;
          v[4] += e;
          v[5] += f;
          v[6] += g;
          v[7] += h;
          pos += 64;
          len -= 64;
        }
        return pos;
      }
      var Hash = (
        /** @class */
        (function() {
          function Hash2() {
            this.digestLength = exports$1.digestLength;
            this.blockSize = exports$1.blockSize;
            this.state = new Int32Array(8);
            this.temp = new Int32Array(64);
            this.buffer = new Uint8Array(128);
            this.bufferLength = 0;
            this.bytesHashed = 0;
            this.finished = false;
            this.reset();
          }
          Hash2.prototype.reset = function() {
            this.state[0] = 1779033703;
            this.state[1] = 3144134277;
            this.state[2] = 1013904242;
            this.state[3] = 2773480762;
            this.state[4] = 1359893119;
            this.state[5] = 2600822924;
            this.state[6] = 528734635;
            this.state[7] = 1541459225;
            this.bufferLength = 0;
            this.bytesHashed = 0;
            this.finished = false;
            return this;
          };
          Hash2.prototype.clean = function() {
            for (var i = 0; i < this.buffer.length; i++) {
              this.buffer[i] = 0;
            }
            for (var i = 0; i < this.temp.length; i++) {
              this.temp[i] = 0;
            }
            this.reset();
          };
          Hash2.prototype.update = function(data, dataLength) {
            if (dataLength === void 0) {
              dataLength = data.length;
            }
            if (this.finished) {
              throw new Error("SHA256: can't update because hash was finished.");
            }
            var dataPos = 0;
            this.bytesHashed += dataLength;
            if (this.bufferLength > 0) {
              while (this.bufferLength < 64 && dataLength > 0) {
                this.buffer[this.bufferLength++] = data[dataPos++];
                dataLength--;
              }
              if (this.bufferLength === 64) {
                hashBlocks(this.temp, this.state, this.buffer, 0, 64);
                this.bufferLength = 0;
              }
            }
            if (dataLength >= 64) {
              dataPos = hashBlocks(this.temp, this.state, data, dataPos, dataLength);
              dataLength %= 64;
            }
            while (dataLength > 0) {
              this.buffer[this.bufferLength++] = data[dataPos++];
              dataLength--;
            }
            return this;
          };
          Hash2.prototype.finish = function(out) {
            if (!this.finished) {
              var bytesHashed = this.bytesHashed;
              var left = this.bufferLength;
              var bitLenHi = bytesHashed / 536870912 | 0;
              var bitLenLo = bytesHashed << 3;
              var padLength = bytesHashed % 64 < 56 ? 64 : 128;
              this.buffer[left] = 128;
              for (var i = left + 1; i < padLength - 8; i++) {
                this.buffer[i] = 0;
              }
              this.buffer[padLength - 8] = bitLenHi >>> 24 & 255;
              this.buffer[padLength - 7] = bitLenHi >>> 16 & 255;
              this.buffer[padLength - 6] = bitLenHi >>> 8 & 255;
              this.buffer[padLength - 5] = bitLenHi >>> 0 & 255;
              this.buffer[padLength - 4] = bitLenLo >>> 24 & 255;
              this.buffer[padLength - 3] = bitLenLo >>> 16 & 255;
              this.buffer[padLength - 2] = bitLenLo >>> 8 & 255;
              this.buffer[padLength - 1] = bitLenLo >>> 0 & 255;
              hashBlocks(this.temp, this.state, this.buffer, 0, padLength);
              this.finished = true;
            }
            for (var i = 0; i < 8; i++) {
              out[i * 4 + 0] = this.state[i] >>> 24 & 255;
              out[i * 4 + 1] = this.state[i] >>> 16 & 255;
              out[i * 4 + 2] = this.state[i] >>> 8 & 255;
              out[i * 4 + 3] = this.state[i] >>> 0 & 255;
            }
            return this;
          };
          Hash2.prototype.digest = function() {
            var out = new Uint8Array(this.digestLength);
            this.finish(out);
            return out;
          };
          Hash2.prototype._saveState = function(out) {
            for (var i = 0; i < this.state.length; i++) {
              out[i] = this.state[i];
            }
          };
          Hash2.prototype._restoreState = function(from, bytesHashed) {
            for (var i = 0; i < this.state.length; i++) {
              this.state[i] = from[i];
            }
            this.bytesHashed = bytesHashed;
            this.finished = false;
            this.bufferLength = 0;
          };
          return Hash2;
        })()
      );
      exports$1.Hash = Hash;
      var HMAC = (
        /** @class */
        (function() {
          function HMAC2(key) {
            this.inner = new Hash();
            this.outer = new Hash();
            this.blockSize = this.inner.blockSize;
            this.digestLength = this.inner.digestLength;
            var pad = new Uint8Array(this.blockSize);
            if (key.length > this.blockSize) {
              new Hash().update(key).finish(pad).clean();
            } else {
              for (var i = 0; i < key.length; i++) {
                pad[i] = key[i];
              }
            }
            for (var i = 0; i < pad.length; i++) {
              pad[i] ^= 54;
            }
            this.inner.update(pad);
            for (var i = 0; i < pad.length; i++) {
              pad[i] ^= 54 ^ 92;
            }
            this.outer.update(pad);
            this.istate = new Uint32Array(8);
            this.ostate = new Uint32Array(8);
            this.inner._saveState(this.istate);
            this.outer._saveState(this.ostate);
            for (var i = 0; i < pad.length; i++) {
              pad[i] = 0;
            }
          }
          HMAC2.prototype.reset = function() {
            this.inner._restoreState(this.istate, this.inner.blockSize);
            this.outer._restoreState(this.ostate, this.outer.blockSize);
            return this;
          };
          HMAC2.prototype.clean = function() {
            for (var i = 0; i < this.istate.length; i++) {
              this.ostate[i] = this.istate[i] = 0;
            }
            this.inner.clean();
            this.outer.clean();
          };
          HMAC2.prototype.update = function(data) {
            this.inner.update(data);
            return this;
          };
          HMAC2.prototype.finish = function(out) {
            if (this.outer.finished) {
              this.outer.finish(out);
            } else {
              this.inner.finish(out);
              this.outer.update(out, this.digestLength).finish(out);
            }
            return this;
          };
          HMAC2.prototype.digest = function() {
            var out = new Uint8Array(this.digestLength);
            this.finish(out);
            return out;
          };
          return HMAC2;
        })()
      );
      exports$1.HMAC = HMAC;
      function hash(data) {
        var h = new Hash().update(data);
        var digest = h.digest();
        h.clean();
        return digest;
      }
      exports$1.hash = hash;
      exports$1["default"] = hash;
      function hmac(key, data) {
        var h = new HMAC(key).update(data);
        var digest = h.digest();
        h.clean();
        return digest;
      }
      exports$1.hmac = hmac;
      function fillBuffer(buffer, hmac2, info, counter) {
        var num = counter[0];
        if (num === 0) {
          throw new Error("hkdf: cannot expand more");
        }
        hmac2.reset();
        if (num > 1) {
          hmac2.update(buffer);
        }
        if (info) {
          hmac2.update(info);
        }
        hmac2.update(counter);
        hmac2.finish(buffer);
        counter[0]++;
      }
      var hkdfSalt = new Uint8Array(exports$1.digestLength);
      function hkdf(key, salt, info, length) {
        if (salt === void 0) {
          salt = hkdfSalt;
        }
        if (length === void 0) {
          length = 32;
        }
        var counter = new Uint8Array([1]);
        var okm = hmac(salt, key);
        var hmac_ = new HMAC(okm);
        var buffer = new Uint8Array(hmac_.digestLength);
        var bufpos = buffer.length;
        var out = new Uint8Array(length);
        for (var i = 0; i < length; i++) {
          if (bufpos === buffer.length) {
            fillBuffer(buffer, hmac_, info, counter);
            bufpos = 0;
          }
          out[i] = buffer[bufpos++];
        }
        hmac_.clean();
        buffer.fill(0);
        counter.fill(0);
        return out;
      }
      exports$1.hkdf = hkdf;
      function pbkdf2(password, salt, iterations, dkLen) {
        var prf = new HMAC(password);
        var len = prf.digestLength;
        var ctr = new Uint8Array(4);
        var t = new Uint8Array(len);
        var u = new Uint8Array(len);
        var dk = new Uint8Array(dkLen);
        for (var i = 0; i * len < dkLen; i++) {
          var c = i + 1;
          ctr[0] = c >>> 24 & 255;
          ctr[1] = c >>> 16 & 255;
          ctr[2] = c >>> 8 & 255;
          ctr[3] = c >>> 0 & 255;
          prf.reset();
          prf.update(salt);
          prf.update(ctr);
          prf.finish(u);
          for (var j = 0; j < len; j++) {
            t[j] = u[j];
          }
          for (var j = 2; j <= iterations; j++) {
            prf.reset();
            prf.update(u).finish(u);
            for (var k = 0; k < len; k++) {
              t[k] ^= u[k];
            }
          }
          for (var j = 0; j < len && i * len + j < dkLen; j++) {
            dk[i * len + j] = t[j];
          }
        }
        for (var i = 0; i < len; i++) {
          t[i] = u[i] = 0;
        }
        for (var i = 0; i < 4; i++) {
          ctr[i] = 0;
        }
        prf.clean();
        return dk;
      }
      exports$1.pbkdf2 = pbkdf2;
    });
  })(sha256$1);
  return sha256$1.exports;
}
var hasRequiredDist$1;
function requireDist$1() {
  if (hasRequiredDist$1) return dist;
  hasRequiredDist$1 = 1;
  Object.defineProperty(dist, "__esModule", { value: true });
  dist.Webhook = dist.WebhookVerificationError = void 0;
  const timing_safe_equal_1 = requireTiming_safe_equal();
  const base642 = requireBase64();
  const sha2562 = requireSha256();
  const WEBHOOK_TOLERANCE_IN_SECONDS = 5 * 60;
  class ExtendableError extends Error {
    constructor(message2) {
      super(message2);
      Object.setPrototypeOf(this, ExtendableError.prototype);
      this.name = "ExtendableError";
      this.stack = new Error(message2).stack;
    }
  }
  class WebhookVerificationError extends ExtendableError {
    constructor(message2) {
      super(message2);
      Object.setPrototypeOf(this, WebhookVerificationError.prototype);
      this.name = "WebhookVerificationError";
    }
  }
  dist.WebhookVerificationError = WebhookVerificationError;
  class Webhook {
    constructor(secret, options) {
      if (!secret) {
        throw new Error("Secret can't be empty.");
      }
      if ((options === null || options === void 0 ? void 0 : options.format) === "raw") {
        if (secret instanceof Uint8Array) {
          this.key = secret;
        } else {
          this.key = Uint8Array.from(secret, (c) => c.charCodeAt(0));
        }
      } else {
        if (typeof secret !== "string") {
          throw new Error("Expected secret to be of type string");
        }
        if (secret.startsWith(Webhook.prefix)) {
          secret = secret.substring(Webhook.prefix.length);
        }
        this.key = base642.decode(secret);
      }
    }
    verify(payload, headers_) {
      const headers = {};
      for (const key of Object.keys(headers_)) {
        headers[key.toLowerCase()] = headers_[key];
      }
      const msgId = headers["webhook-id"];
      const msgSignature = headers["webhook-signature"];
      const msgTimestamp = headers["webhook-timestamp"];
      if (!msgSignature || !msgId || !msgTimestamp) {
        throw new WebhookVerificationError("Missing required headers");
      }
      const timestamp = this.verifyTimestamp(msgTimestamp);
      const computedSignature = this.sign(msgId, timestamp, payload);
      const expectedSignature = computedSignature.split(",")[1];
      const passedSignatures = msgSignature.split(" ");
      const encoder = new globalThis.TextEncoder();
      for (const versionedSignature of passedSignatures) {
        const [version2, signature] = versionedSignature.split(",");
        if (version2 !== "v1") {
          continue;
        }
        if ((0, timing_safe_equal_1.timingSafeEqual)(encoder.encode(signature), encoder.encode(expectedSignature))) {
          return JSON.parse(payload.toString());
        }
      }
      throw new WebhookVerificationError("No matching signature found");
    }
    sign(msgId, timestamp, payload) {
      if (typeof payload === "string") ;
      else if (payload.constructor.name === "Buffer") {
        payload = payload.toString();
      } else {
        throw new Error("Expected payload to be of type string or Buffer.");
      }
      const encoder = new TextEncoder();
      const timestampNumber = Math.floor(timestamp.getTime() / 1e3);
      const toSign = encoder.encode(`${msgId}.${timestampNumber}.${payload}`);
      const expectedSignature = base642.encode(sha2562.hmac(this.key, toSign));
      return `v1,${expectedSignature}`;
    }
    verifyTimestamp(timestampHeader) {
      const now = Math.floor(Date.now() / 1e3);
      const timestamp = parseInt(timestampHeader, 10);
      if (isNaN(timestamp)) {
        throw new WebhookVerificationError("Invalid Signature Headers");
      }
      if (now - timestamp > WEBHOOK_TOLERANCE_IN_SECONDS) {
        throw new WebhookVerificationError("Message timestamp too old");
      }
      if (timestamp > now + WEBHOOK_TOLERANCE_IN_SECONDS) {
        throw new WebhookVerificationError("Message timestamp too new");
      }
      return new Date(timestamp * 1e3);
    }
  }
  dist.Webhook = Webhook;
  Webhook.prefix = "whsec_";
  return dist;
}
var hasRequiredWebhook;
function requireWebhook() {
  if (hasRequiredWebhook) return webhook;
  hasRequiredWebhook = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.Webhook = exports$1.WebhookVerificationError = void 0;
    const standardwebhooks_1 = requireDist$1();
    var standardwebhooks_2 = requireDist$1();
    Object.defineProperty(exports$1, "WebhookVerificationError", { enumerable: true, get: function() {
      return standardwebhooks_2.WebhookVerificationError;
    } });
    class Webhook {
      constructor(secret, options) {
        this.inner = new standardwebhooks_1.Webhook(secret, options);
      }
      verify(payload, headers_) {
        var _a, _b, _c, _d, _e, _f;
        const headers = {};
        for (const key of Object.keys(headers_)) {
          headers[key.toLowerCase()] = headers_[key];
        }
        headers["webhook-id"] = (_b = (_a = headers["svix-id"]) !== null && _a !== void 0 ? _a : headers["webhook-id"]) !== null && _b !== void 0 ? _b : "";
        headers["webhook-signature"] = (_d = (_c = headers["svix-signature"]) !== null && _c !== void 0 ? _c : headers["webhook-signature"]) !== null && _d !== void 0 ? _d : "";
        headers["webhook-timestamp"] = (_f = (_e = headers["svix-timestamp"]) !== null && _e !== void 0 ? _e : headers["webhook-timestamp"]) !== null && _f !== void 0 ? _f : "";
        return this.inner.verify(payload, headers);
      }
      sign(msgId, timestamp, payload) {
        return this.inner.sign(msgId, timestamp, payload);
      }
    }
    exports$1.Webhook = Webhook;
  })(webhook);
  return webhook;
}
var models = {};
var endpointDisabledTrigger = {};
var hasRequiredEndpointDisabledTrigger;
function requireEndpointDisabledTrigger() {
  if (hasRequiredEndpointDisabledTrigger) return endpointDisabledTrigger;
  hasRequiredEndpointDisabledTrigger = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.EndpointDisabledTriggerSerializer = exports$1.EndpointDisabledTrigger = void 0;
    (function(EndpointDisabledTrigger) {
      EndpointDisabledTrigger["Manual"] = "manual";
      EndpointDisabledTrigger["Automatic"] = "automatic";
    })(exports$1.EndpointDisabledTrigger || (exports$1.EndpointDisabledTrigger = {}));
    exports$1.EndpointDisabledTriggerSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  })(endpointDisabledTrigger);
  return endpointDisabledTrigger;
}
var ordering = {};
var hasRequiredOrdering;
function requireOrdering() {
  if (hasRequiredOrdering) return ordering;
  hasRequiredOrdering = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.OrderingSerializer = exports$1.Ordering = void 0;
    (function(Ordering) {
      Ordering["Ascending"] = "ascending";
      Ordering["Descending"] = "descending";
    })(exports$1.Ordering || (exports$1.Ordering = {}));
    exports$1.OrderingSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  })(ordering);
  return ordering;
}
var statusCodeClass = {};
var hasRequiredStatusCodeClass;
function requireStatusCodeClass() {
  if (hasRequiredStatusCodeClass) return statusCodeClass;
  hasRequiredStatusCodeClass = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.StatusCodeClassSerializer = exports$1.StatusCodeClass = void 0;
    (function(StatusCodeClass) {
      StatusCodeClass[StatusCodeClass["CodeNone"] = 0] = "CodeNone";
      StatusCodeClass[StatusCodeClass["Code1xx"] = 100] = "Code1xx";
      StatusCodeClass[StatusCodeClass["Code2xx"] = 200] = "Code2xx";
      StatusCodeClass[StatusCodeClass["Code3xx"] = 300] = "Code3xx";
      StatusCodeClass[StatusCodeClass["Code4xx"] = 400] = "Code4xx";
      StatusCodeClass[StatusCodeClass["Code5xx"] = 500] = "Code5xx";
    })(exports$1.StatusCodeClass || (exports$1.StatusCodeClass = {}));
    exports$1.StatusCodeClassSerializer = {
      _fromJsonObject(object) {
        return object;
      },
      _toJsonObject(self) {
        return self;
      }
    };
  })(statusCodeClass);
  return statusCodeClass;
}
var hasRequiredModels;
function requireModels() {
  if (hasRequiredModels) return models;
  hasRequiredModels = 1;
  (function(exports$1) {
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.StatusCodeClass = exports$1.SinkStatusIn = exports$1.SinkStatus = exports$1.Ordering = exports$1.MessageStatusText = exports$1.MessageStatus = exports$1.MessageAttemptTriggerType = exports$1.EndpointDisabledTrigger = exports$1.ConnectorProduct = exports$1.ConnectorKind = exports$1.BackgroundTaskType = exports$1.BackgroundTaskStatus = exports$1.AppPortalCapability = void 0;
    var appPortalCapability_1 = requireAppPortalCapability();
    Object.defineProperty(exports$1, "AppPortalCapability", { enumerable: true, get: function() {
      return appPortalCapability_1.AppPortalCapability;
    } });
    var backgroundTaskStatus_1 = requireBackgroundTaskStatus();
    Object.defineProperty(exports$1, "BackgroundTaskStatus", { enumerable: true, get: function() {
      return backgroundTaskStatus_1.BackgroundTaskStatus;
    } });
    var backgroundTaskType_1 = requireBackgroundTaskType();
    Object.defineProperty(exports$1, "BackgroundTaskType", { enumerable: true, get: function() {
      return backgroundTaskType_1.BackgroundTaskType;
    } });
    var connectorKind_1 = requireConnectorKind();
    Object.defineProperty(exports$1, "ConnectorKind", { enumerable: true, get: function() {
      return connectorKind_1.ConnectorKind;
    } });
    var connectorProduct_1 = requireConnectorProduct();
    Object.defineProperty(exports$1, "ConnectorProduct", { enumerable: true, get: function() {
      return connectorProduct_1.ConnectorProduct;
    } });
    var endpointDisabledTrigger_1 = requireEndpointDisabledTrigger();
    Object.defineProperty(exports$1, "EndpointDisabledTrigger", { enumerable: true, get: function() {
      return endpointDisabledTrigger_1.EndpointDisabledTrigger;
    } });
    var messageAttemptTriggerType_1 = requireMessageAttemptTriggerType();
    Object.defineProperty(exports$1, "MessageAttemptTriggerType", { enumerable: true, get: function() {
      return messageAttemptTriggerType_1.MessageAttemptTriggerType;
    } });
    var messageStatus_1 = requireMessageStatus();
    Object.defineProperty(exports$1, "MessageStatus", { enumerable: true, get: function() {
      return messageStatus_1.MessageStatus;
    } });
    var messageStatusText_1 = requireMessageStatusText();
    Object.defineProperty(exports$1, "MessageStatusText", { enumerable: true, get: function() {
      return messageStatusText_1.MessageStatusText;
    } });
    var ordering_1 = requireOrdering();
    Object.defineProperty(exports$1, "Ordering", { enumerable: true, get: function() {
      return ordering_1.Ordering;
    } });
    var sinkStatus_1 = requireSinkStatus();
    Object.defineProperty(exports$1, "SinkStatus", { enumerable: true, get: function() {
      return sinkStatus_1.SinkStatus;
    } });
    var sinkStatusIn_1 = requireSinkStatusIn();
    Object.defineProperty(exports$1, "SinkStatusIn", { enumerable: true, get: function() {
      return sinkStatusIn_1.SinkStatusIn;
    } });
    var statusCodeClass_1 = requireStatusCodeClass();
    Object.defineProperty(exports$1, "StatusCodeClass", { enumerable: true, get: function() {
      return statusCodeClass_1.StatusCodeClass;
    } });
  })(models);
  return models;
}
var hasRequiredDist;
function requireDist() {
  if (hasRequiredDist) return dist$1;
  hasRequiredDist = 1;
  (function(exports$1) {
    var __createBinding = dist$1 && dist$1.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = dist$1 && dist$1.__exportStar || function(m, exports$12) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$12, p)) __createBinding(exports$12, m, p);
    };
    Object.defineProperty(exports$1, "__esModule", { value: true });
    exports$1.Svix = exports$1.messageInRaw = exports$1.ValidationError = exports$1.HttpErrorOut = exports$1.HTTPValidationError = exports$1.ApiException = void 0;
    const application_1 = requireApplication();
    const authentication_1 = requireAuthentication();
    const backgroundTask_1 = requireBackgroundTask();
    const connector_1 = requireConnector();
    const endpoint_1 = requireEndpoint();
    const environment_1 = requireEnvironment();
    const eventType_1 = requireEventType();
    const health_1 = requireHealth();
    const ingest_1 = requireIngest();
    const integration_1 = requireIntegration();
    const message_1 = requireMessage();
    const messageAttempt_1 = requireMessageAttempt();
    const operationalWebhook_1 = requireOperationalWebhook();
    const statistics_1 = requireStatistics();
    const streaming_1 = requireStreaming();
    const operationalWebhookEndpoint_1 = requireOperationalWebhookEndpoint();
    var util_1 = requireUtil();
    Object.defineProperty(exports$1, "ApiException", { enumerable: true, get: function() {
      return util_1.ApiException;
    } });
    var HttpErrors_1 = requireHttpErrors();
    Object.defineProperty(exports$1, "HTTPValidationError", { enumerable: true, get: function() {
      return HttpErrors_1.HTTPValidationError;
    } });
    Object.defineProperty(exports$1, "HttpErrorOut", { enumerable: true, get: function() {
      return HttpErrors_1.HttpErrorOut;
    } });
    Object.defineProperty(exports$1, "ValidationError", { enumerable: true, get: function() {
      return HttpErrors_1.ValidationError;
    } });
    __exportStar(requireWebhook(), exports$1);
    __exportStar(requireModels(), exports$1);
    var message_2 = requireMessage();
    Object.defineProperty(exports$1, "messageInRaw", { enumerable: true, get: function() {
      return message_2.messageInRaw;
    } });
    const REGIONS = [
      { region: "us", url: "https://api.us.svix.com" },
      { region: "eu", url: "https://api.eu.svix.com" },
      { region: "in", url: "https://api.in.svix.com" },
      { region: "ca", url: "https://api.ca.svix.com" },
      { region: "au", url: "https://api.au.svix.com" }
    ];
    class Svix {
      constructor(token, options = {}) {
        var _a, _b, _c;
        const regionalUrl = (_a = REGIONS.find((x) => x.region === token.split(".")[1])) === null || _a === void 0 ? void 0 : _a.url;
        const baseUrl2 = (_c = (_b = options.serverUrl) !== null && _b !== void 0 ? _b : regionalUrl) !== null && _c !== void 0 ? _c : "https://api.svix.com";
        if (options.retryScheduleInMs) {
          this.requestCtx = {
            baseUrl: baseUrl2,
            token,
            timeout: options.requestTimeout,
            retryScheduleInMs: options.retryScheduleInMs,
            fetch: options.fetch
          };
          return;
        }
        if (options.numRetries) {
          this.requestCtx = {
            baseUrl: baseUrl2,
            token,
            timeout: options.requestTimeout,
            numRetries: options.numRetries,
            fetch: options.fetch
          };
          return;
        }
        this.requestCtx = {
          baseUrl: baseUrl2,
          token,
          timeout: options.requestTimeout,
          fetch: options.fetch
        };
      }
      get application() {
        return new application_1.Application(this.requestCtx);
      }
      get authentication() {
        return new authentication_1.Authentication(this.requestCtx);
      }
      get backgroundTask() {
        return new backgroundTask_1.BackgroundTask(this.requestCtx);
      }
      get connector() {
        return new connector_1.Connector(this.requestCtx);
      }
      get endpoint() {
        return new endpoint_1.Endpoint(this.requestCtx);
      }
      get environment() {
        return new environment_1.Environment(this.requestCtx);
      }
      get eventType() {
        return new eventType_1.EventType(this.requestCtx);
      }
      get health() {
        return new health_1.Health(this.requestCtx);
      }
      get ingest() {
        return new ingest_1.Ingest(this.requestCtx);
      }
      get integration() {
        return new integration_1.Integration(this.requestCtx);
      }
      get message() {
        return new message_1.Message(this.requestCtx);
      }
      get messageAttempt() {
        return new messageAttempt_1.MessageAttempt(this.requestCtx);
      }
      get operationalWebhook() {
        return new operationalWebhook_1.OperationalWebhook(this.requestCtx);
      }
      get statistics() {
        return new statistics_1.Statistics(this.requestCtx);
      }
      get streaming() {
        return new streaming_1.Streaming(this.requestCtx);
      }
      get operationalWebhookEndpoint() {
        return new operationalWebhookEndpoint_1.OperationalWebhookEndpoint(this.requestCtx);
      }
    }
    exports$1.Svix = Svix;
  })(dist$1);
  return dist$1;
}
var distExports = requireDist();
var version = "6.10.0";
function buildPaginationQuery(options) {
  const searchParams = new URLSearchParams();
  if (options.limit !== void 0) searchParams.set("limit", options.limit.toString());
  if ("after" in options && options.after !== void 0) searchParams.set("after", options.after);
  if ("before" in options && options.before !== void 0) searchParams.set("before", options.before);
  return searchParams.toString();
}
var ApiKeys = class {
  constructor(resend) {
    this.resend = resend;
  }
  async create(payload, options = {}) {
    return await this.resend.post("/api-keys", payload, options);
  }
  async list(options = {}) {
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/api-keys?${queryString}` : "/api-keys";
    return await this.resend.get(url);
  }
  async remove(id) {
    return await this.resend.delete(`/api-keys/${id}`);
  }
};
function parseAttachments(attachments) {
  return attachments?.map((attachment) => ({
    content: attachment.content,
    filename: attachment.filename,
    path: attachment.path,
    content_type: attachment.contentType,
    content_id: attachment.contentId
  }));
}
function parseEmailToApiOptions(email) {
  return {
    attachments: parseAttachments(email.attachments),
    bcc: email.bcc,
    cc: email.cc,
    from: email.from,
    headers: email.headers,
    html: email.html,
    reply_to: email.replyTo,
    scheduled_at: email.scheduledAt,
    subject: email.subject,
    tags: email.tags,
    text: email.text,
    to: email.to,
    template: email.template ? {
      id: email.template.id,
      variables: email.template.variables
    } : void 0,
    topic_id: email.topicId
  };
}
async function render(node) {
  let render2;
  try {
    ({ render: render2 } = await import("./render_resend_false_VXizwFaD.mjs"));
  } catch {
    throw new Error("Failed to render React component. Make sure to install `@react-email/render` or `@react-email/components`.");
  }
  return render2(node);
}
var Batch = class {
  constructor(resend) {
    this.resend = resend;
  }
  async send(payload, options) {
    return this.create(payload, options);
  }
  async create(payload, options) {
    const emails = [];
    for (const email of payload) {
      if (email.react) {
        email.html = await render(email.react);
        email.react = void 0;
      }
      emails.push(parseEmailToApiOptions(email));
    }
    return await this.resend.post("/emails/batch", emails, {
      ...options,
      headers: {
        "x-batch-validation": options?.batchValidation ?? "strict",
        ...options?.headers
      }
    });
  }
};
var Broadcasts = class {
  constructor(resend) {
    this.resend = resend;
  }
  async create(payload, options = {}) {
    if (payload.react) payload.html = await render(payload.react);
    return await this.resend.post("/broadcasts", {
      name: payload.name,
      segment_id: payload.segmentId,
      audience_id: payload.audienceId,
      preview_text: payload.previewText,
      from: payload.from,
      html: payload.html,
      reply_to: payload.replyTo,
      subject: payload.subject,
      text: payload.text,
      topic_id: payload.topicId,
      send: payload.send,
      scheduled_at: payload.scheduledAt
    }, options);
  }
  async send(id, payload) {
    return await this.resend.post(`/broadcasts/${id}/send`, { scheduled_at: payload?.scheduledAt });
  }
  async list(options = {}) {
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/broadcasts?${queryString}` : "/broadcasts";
    return await this.resend.get(url);
  }
  async get(id) {
    return await this.resend.get(`/broadcasts/${id}`);
  }
  async remove(id) {
    return await this.resend.delete(`/broadcasts/${id}`);
  }
  async update(id, payload) {
    if (payload.react) payload.html = await render(payload.react);
    return await this.resend.patch(`/broadcasts/${id}`, {
      name: payload.name,
      segment_id: payload.segmentId,
      audience_id: payload.audienceId,
      from: payload.from,
      html: payload.html,
      text: payload.text,
      subject: payload.subject,
      reply_to: payload.replyTo,
      preview_text: payload.previewText,
      topic_id: payload.topicId
    });
  }
};
function parseContactPropertyFromApi(contactProperty) {
  return {
    id: contactProperty.id,
    key: contactProperty.key,
    createdAt: contactProperty.created_at,
    type: contactProperty.type,
    fallbackValue: contactProperty.fallback_value
  };
}
function parseContactPropertyToApiOptions(contactProperty) {
  if ("key" in contactProperty) return {
    key: contactProperty.key,
    type: contactProperty.type,
    fallback_value: contactProperty.fallbackValue
  };
  return { fallback_value: contactProperty.fallbackValue };
}
var ContactProperties = class {
  constructor(resend) {
    this.resend = resend;
  }
  async create(options) {
    const apiOptions = parseContactPropertyToApiOptions(options);
    return await this.resend.post("/contact-properties", apiOptions);
  }
  async list(options = {}) {
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/contact-properties?${queryString}` : "/contact-properties";
    const response = await this.resend.get(url);
    if (response.data) return {
      data: {
        ...response.data,
        data: response.data.data.map((apiContactProperty) => parseContactPropertyFromApi(apiContactProperty))
      },
      headers: response.headers,
      error: null
    };
    return response;
  }
  async get(id) {
    if (!id) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    const response = await this.resend.get(`/contact-properties/${id}`);
    if (response.data) return {
      data: {
        object: "contact_property",
        ...parseContactPropertyFromApi(response.data)
      },
      headers: response.headers,
      error: null
    };
    return response;
  }
  async update(payload) {
    if (!payload.id) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    const apiOptions = parseContactPropertyToApiOptions(payload);
    return await this.resend.patch(`/contact-properties/${payload.id}`, apiOptions);
  }
  async remove(id) {
    if (!id) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    return await this.resend.delete(`/contact-properties/${id}`);
  }
};
var ContactSegments = class {
  constructor(resend) {
    this.resend = resend;
  }
  async list(options) {
    if (!options.contactId && !options.email) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` or `email` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    const identifier = options.email ? options.email : options.contactId;
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/contacts/${identifier}/segments?${queryString}` : `/contacts/${identifier}/segments`;
    return await this.resend.get(url);
  }
  async add(options) {
    if (!options.contactId && !options.email) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` or `email` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    const identifier = options.email ? options.email : options.contactId;
    return this.resend.post(`/contacts/${identifier}/segments/${options.segmentId}`);
  }
  async remove(options) {
    if (!options.contactId && !options.email) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` or `email` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    const identifier = options.email ? options.email : options.contactId;
    return this.resend.delete(`/contacts/${identifier}/segments/${options.segmentId}`);
  }
};
var ContactTopics = class {
  constructor(resend) {
    this.resend = resend;
  }
  async update(payload) {
    if (!payload.id && !payload.email) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` or `email` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    const identifier = payload.email ? payload.email : payload.id;
    return this.resend.patch(`/contacts/${identifier}/topics`, payload.topics);
  }
  async list(options) {
    if (!options.id && !options.email) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` or `email` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    const identifier = options.email ? options.email : options.id;
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/contacts/${identifier}/topics?${queryString}` : `/contacts/${identifier}/topics`;
    return this.resend.get(url);
  }
};
var Contacts = class {
  constructor(resend) {
    this.resend = resend;
    this.topics = new ContactTopics(this.resend);
    this.segments = new ContactSegments(this.resend);
  }
  async create(payload, options = {}) {
    if ("audienceId" in payload) {
      if ("segments" in payload || "topics" in payload) return {
        data: null,
        headers: null,
        error: {
          message: "`audienceId` is deprecated, and cannot be used together with `segments` or `topics`. Use `segments` instead to add one or more segments to the new contact.",
          statusCode: null,
          name: "invalid_parameter"
        }
      };
      return await this.resend.post(`/audiences/${payload.audienceId}/contacts`, {
        unsubscribed: payload.unsubscribed,
        email: payload.email,
        first_name: payload.firstName,
        last_name: payload.lastName,
        properties: payload.properties
      }, options);
    }
    return await this.resend.post("/contacts", {
      unsubscribed: payload.unsubscribed,
      email: payload.email,
      first_name: payload.firstName,
      last_name: payload.lastName,
      properties: payload.properties,
      segments: payload.segments,
      topics: payload.topics
    }, options);
  }
  async list(options = {}) {
    const segmentId = options.segmentId ?? options.audienceId;
    if (!segmentId) {
      const queryString2 = buildPaginationQuery(options);
      const url2 = queryString2 ? `/contacts?${queryString2}` : "/contacts";
      return await this.resend.get(url2);
    }
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/segments/${segmentId}/contacts?${queryString}` : `/segments/${segmentId}/contacts`;
    return await this.resend.get(url);
  }
  async get(options) {
    if (typeof options === "string") return this.resend.get(`/contacts/${options}`);
    if (!options.id && !options.email) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` or `email` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    if (!options.audienceId) return this.resend.get(`/contacts/${options?.email ? options?.email : options?.id}`);
    return this.resend.get(`/audiences/${options.audienceId}/contacts/${options?.email ? options?.email : options?.id}`);
  }
  async update(options) {
    if (!options.id && !options.email) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` or `email` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    if (!options.audienceId) return await this.resend.patch(`/contacts/${options?.email ? options?.email : options?.id}`, {
      unsubscribed: options.unsubscribed,
      first_name: options.firstName,
      last_name: options.lastName,
      properties: options.properties
    });
    return await this.resend.patch(`/audiences/${options.audienceId}/contacts/${options?.email ? options?.email : options?.id}`, {
      unsubscribed: options.unsubscribed,
      first_name: options.firstName,
      last_name: options.lastName,
      properties: options.properties
    });
  }
  async remove(payload) {
    if (typeof payload === "string") return this.resend.delete(`/contacts/${payload}`);
    if (!payload.id && !payload.email) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` or `email` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    if (!payload.audienceId) return this.resend.delete(`/contacts/${payload?.email ? payload?.email : payload?.id}`);
    return this.resend.delete(`/audiences/${payload.audienceId}/contacts/${payload?.email ? payload?.email : payload?.id}`);
  }
};
function parseDomainToApiOptions(domain) {
  return {
    name: domain.name,
    region: domain.region,
    custom_return_path: domain.customReturnPath,
    capabilities: domain.capabilities,
    open_tracking: domain.openTracking,
    click_tracking: domain.clickTracking,
    tls: domain.tls
  };
}
var Domains = class {
  constructor(resend) {
    this.resend = resend;
  }
  async create(payload, options = {}) {
    return await this.resend.post("/domains", parseDomainToApiOptions(payload), options);
  }
  async list(options = {}) {
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/domains?${queryString}` : "/domains";
    return await this.resend.get(url);
  }
  async get(id) {
    return await this.resend.get(`/domains/${id}`);
  }
  async update(payload) {
    return await this.resend.patch(`/domains/${payload.id}`, {
      click_tracking: payload.clickTracking,
      open_tracking: payload.openTracking,
      tls: payload.tls,
      capabilities: payload.capabilities
    });
  }
  async remove(id) {
    return await this.resend.delete(`/domains/${id}`);
  }
  async verify(id) {
    return await this.resend.post(`/domains/${id}/verify`);
  }
};
var Attachments$1 = class {
  constructor(resend) {
    this.resend = resend;
  }
  async get(options) {
    const { emailId, id } = options;
    return await this.resend.get(`/emails/${emailId}/attachments/${id}`);
  }
  async list(options) {
    const { emailId } = options;
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/emails/${emailId}/attachments?${queryString}` : `/emails/${emailId}/attachments`;
    return await this.resend.get(url);
  }
};
var Attachments = class {
  constructor(resend) {
    this.resend = resend;
  }
  async get(options) {
    const { emailId, id } = options;
    return await this.resend.get(`/emails/receiving/${emailId}/attachments/${id}`);
  }
  async list(options) {
    const { emailId } = options;
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/emails/receiving/${emailId}/attachments?${queryString}` : `/emails/receiving/${emailId}/attachments`;
    return await this.resend.get(url);
  }
};
var Receiving = class {
  constructor(resend) {
    this.resend = resend;
    this.attachments = new Attachments(resend);
  }
  async get(id) {
    return await this.resend.get(`/emails/receiving/${id}`);
  }
  async list(options = {}) {
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/emails/receiving?${queryString}` : "/emails/receiving";
    return await this.resend.get(url);
  }
  async forward(options) {
    const { emailId, to, from } = options;
    const passthrough = options.passthrough !== false;
    const emailResponse = await this.get(emailId);
    if (emailResponse.error) return {
      data: null,
      error: emailResponse.error,
      headers: emailResponse.headers
    };
    const email = emailResponse.data;
    const originalSubject = email.subject || "(no subject)";
    if (passthrough) return this.forwardPassthrough(email, {
      to,
      from,
      subject: originalSubject
    });
    const forwardSubject = originalSubject.startsWith("Fwd:") ? originalSubject : `Fwd: ${originalSubject}`;
    return this.forwardWrapped(email, {
      to,
      from,
      subject: forwardSubject,
      text: "text" in options ? options.text : void 0,
      html: "html" in options ? options.html : void 0
    });
  }
  async forwardPassthrough(email, options) {
    const { to, from, subject } = options;
    if (!email.raw?.download_url) return {
      data: null,
      error: {
        name: "validation_error",
        message: "Raw email content is not available for this email",
        statusCode: 400
      },
      headers: null
    };
    const rawResponse = await fetch(email.raw.download_url);
    if (!rawResponse.ok) return {
      data: null,
      error: {
        name: "application_error",
        message: "Failed to download raw email content",
        statusCode: rawResponse.status
      },
      headers: null
    };
    const rawEmailContent = await rawResponse.text();
    const parsed = await PostalMime.parse(rawEmailContent, { attachmentEncoding: "base64" });
    const attachments = parsed.attachments.map((attachment) => {
      const contentId = attachment.contentId ? attachment.contentId.replace(/^<|>$/g, "") : void 0;
      return {
        filename: attachment.filename,
        content: attachment.content.toString(),
        content_type: attachment.mimeType,
        content_id: contentId || void 0
      };
    });
    return await this.resend.post("/emails", {
      from,
      to,
      subject,
      text: parsed.text || void 0,
      html: parsed.html || void 0,
      attachments: attachments.length > 0 ? attachments : void 0
    });
  }
  async forwardWrapped(email, options) {
    const { to, from, subject, text, html } = options;
    if (!email.raw?.download_url) return {
      data: null,
      error: {
        name: "validation_error",
        message: "Raw email content is not available for this email",
        statusCode: 400
      },
      headers: null
    };
    const rawResponse = await fetch(email.raw.download_url);
    if (!rawResponse.ok) return {
      data: null,
      error: {
        name: "application_error",
        message: "Failed to download raw email content",
        statusCode: rawResponse.status
      },
      headers: null
    };
    const rawEmailContent = await rawResponse.text();
    return await this.resend.post("/emails", {
      from,
      to,
      subject,
      text,
      html,
      attachments: [{
        filename: "forwarded_message.eml",
        content: Buffer.from(rawEmailContent).toString("base64"),
        content_type: "message/rfc822"
      }]
    });
  }
};
var Emails = class {
  constructor(resend) {
    this.resend = resend;
    this.attachments = new Attachments$1(resend);
    this.receiving = new Receiving(resend);
  }
  async send(payload, options = {}) {
    return this.create(payload, options);
  }
  async create(payload, options = {}) {
    if (payload.react) payload.html = await render(payload.react);
    return await this.resend.post("/emails", parseEmailToApiOptions(payload), options);
  }
  async get(id) {
    return await this.resend.get(`/emails/${id}`);
  }
  async list(options = {}) {
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/emails?${queryString}` : "/emails";
    return await this.resend.get(url);
  }
  async update(payload) {
    return await this.resend.patch(`/emails/${payload.id}`, { scheduled_at: payload.scheduledAt });
  }
  async cancel(id) {
    return await this.resend.post(`/emails/${id}/cancel`);
  }
};
var Logs = class {
  constructor(resend) {
    this.resend = resend;
  }
  async list(options = {}) {
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/logs?${queryString}` : "/logs";
    return await this.resend.get(url);
  }
  async get(id) {
    return await this.resend.get(`/logs/${id}`);
  }
};
var Segments = class {
  constructor(resend) {
    this.resend = resend;
  }
  async create(payload, options = {}) {
    return await this.resend.post("/segments", payload, options);
  }
  async list(options = {}) {
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/segments?${queryString}` : "/segments";
    return await this.resend.get(url);
  }
  async get(id) {
    return await this.resend.get(`/segments/${id}`);
  }
  async remove(id) {
    return await this.resend.delete(`/segments/${id}`);
  }
};
function getPaginationQueryProperties(options = {}) {
  const query = new URLSearchParams();
  if (options.before) query.set("before", options.before);
  if (options.after) query.set("after", options.after);
  if (options.limit) query.set("limit", options.limit.toString());
  return query.size > 0 ? `?${query.toString()}` : "";
}
function parseVariables(variables) {
  return variables?.map((variable) => ({
    key: variable.key,
    type: variable.type,
    fallback_value: variable.fallbackValue
  }));
}
function parseTemplateToApiOptions(template) {
  return {
    name: "name" in template ? template.name : void 0,
    subject: template.subject,
    html: template.html,
    text: template.text,
    alias: template.alias,
    from: template.from,
    reply_to: template.replyTo,
    variables: parseVariables(template.variables)
  };
}
var ChainableTemplateResult = class {
  constructor(promise, publishFn) {
    this.promise = promise;
    this.publishFn = publishFn;
  }
  then(onfulfilled, onrejected) {
    return this.promise.then(onfulfilled, onrejected);
  }
  async publish() {
    const { data, error } = await this.promise;
    if (error) return {
      data: null,
      headers: null,
      error
    };
    return this.publishFn(data.id);
  }
};
var Templates = class {
  constructor(resend) {
    this.resend = resend;
  }
  create(payload) {
    return new ChainableTemplateResult(this.performCreate(payload), this.publish.bind(this));
  }
  async performCreate(payload) {
    if (payload.react) {
      if (!this.renderAsync) try {
        const { renderAsync } = await import("./render_resend_false_VXizwFaD.mjs");
        this.renderAsync = renderAsync;
      } catch {
        throw new Error("Failed to render React component. Make sure to install `@react-email/render`");
      }
      payload.html = await this.renderAsync(payload.react);
    }
    return this.resend.post("/templates", parseTemplateToApiOptions(payload));
  }
  async remove(identifier) {
    return await this.resend.delete(`/templates/${identifier}`);
  }
  async get(identifier) {
    return await this.resend.get(`/templates/${identifier}`);
  }
  async list(options = {}) {
    return this.resend.get(`/templates${getPaginationQueryProperties(options)}`);
  }
  duplicate(identifier) {
    return new ChainableTemplateResult(this.resend.post(`/templates/${identifier}/duplicate`), this.publish.bind(this));
  }
  async publish(identifier) {
    return await this.resend.post(`/templates/${identifier}/publish`);
  }
  async update(identifier, payload) {
    return await this.resend.patch(`/templates/${identifier}`, parseTemplateToApiOptions(payload));
  }
};
var Topics = class {
  constructor(resend) {
    this.resend = resend;
  }
  async create(payload) {
    const { defaultSubscription, ...body } = payload;
    return await this.resend.post("/topics", {
      ...body,
      default_subscription: defaultSubscription
    });
  }
  async list() {
    return await this.resend.get("/topics");
  }
  async get(id) {
    if (!id) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    return await this.resend.get(`/topics/${id}`);
  }
  async update(payload) {
    if (!payload.id) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    return await this.resend.patch(`/topics/${payload.id}`, payload);
  }
  async remove(id) {
    if (!id) return {
      data: null,
      headers: null,
      error: {
        message: "Missing `id` field.",
        statusCode: null,
        name: "missing_required_field"
      }
    };
    return await this.resend.delete(`/topics/${id}`);
  }
};
var Webhooks = class {
  constructor(resend) {
    this.resend = resend;
  }
  async create(payload, options = {}) {
    return await this.resend.post("/webhooks", payload, options);
  }
  async get(id) {
    return await this.resend.get(`/webhooks/${id}`);
  }
  async list(options = {}) {
    const queryString = buildPaginationQuery(options);
    const url = queryString ? `/webhooks?${queryString}` : "/webhooks";
    return await this.resend.get(url);
  }
  async update(id, payload) {
    return await this.resend.patch(`/webhooks/${id}`, payload);
  }
  async remove(id) {
    return await this.resend.delete(`/webhooks/${id}`);
  }
  verify(payload) {
    return new distExports.Webhook(payload.webhookSecret).verify(payload.payload, {
      "svix-id": payload.headers.id,
      "svix-timestamp": payload.headers.timestamp,
      "svix-signature": payload.headers.signature
    });
  }
};
const defaultBaseUrl = "https://api.resend.com";
const defaultUserAgent = `resend-node:${version}`;
const baseUrl = typeof process !== "undefined" && process.env ? process.env.RESEND_BASE_URL || defaultBaseUrl : defaultBaseUrl;
const userAgent = typeof process !== "undefined" && process.env ? process.env.RESEND_USER_AGENT || defaultUserAgent : defaultUserAgent;
var Resend = class {
  constructor(key) {
    this.key = key;
    this.apiKeys = new ApiKeys(this);
    this.segments = new Segments(this);
    this.audiences = this.segments;
    this.batch = new Batch(this);
    this.broadcasts = new Broadcasts(this);
    this.contacts = new Contacts(this);
    this.contactProperties = new ContactProperties(this);
    this.domains = new Domains(this);
    this.emails = new Emails(this);
    this.logs = new Logs(this);
    this.webhooks = new Webhooks(this);
    this.templates = new Templates(this);
    this.topics = new Topics(this);
    if (!key) {
      if (typeof process !== "undefined" && process.env) this.key = process.env.RESEND_API_KEY;
      if (!this.key) throw new Error('Missing API key. Pass it to the constructor `new Resend("re_123")`');
    }
    this.headers = new Headers({
      Authorization: `Bearer ${this.key}`,
      "User-Agent": userAgent,
      "Content-Type": "application/json"
    });
  }
  async fetchRequest(path, options = {}) {
    try {
      const response = await fetch(`${baseUrl}${path}`, options);
      if (!response.ok) try {
        const rawError = await response.text();
        return {
          data: null,
          error: JSON.parse(rawError),
          headers: Object.fromEntries(response.headers.entries())
        };
      } catch (err) {
        if (err instanceof SyntaxError) return {
          data: null,
          error: {
            name: "application_error",
            statusCode: response.status,
            message: "Internal server error. We are unable to process your request right now, please try again later."
          },
          headers: Object.fromEntries(response.headers.entries())
        };
        const error = {
          message: response.statusText,
          statusCode: response.status,
          name: "application_error"
        };
        if (err instanceof Error) return {
          data: null,
          error: {
            ...error,
            message: err.message
          },
          headers: Object.fromEntries(response.headers.entries())
        };
        return {
          data: null,
          error,
          headers: Object.fromEntries(response.headers.entries())
        };
      }
      return {
        data: await response.json(),
        error: null,
        headers: Object.fromEntries(response.headers.entries())
      };
    } catch {
      return {
        data: null,
        error: {
          name: "application_error",
          statusCode: null,
          message: "Unable to fetch data. The request could not be resolved."
        },
        headers: null
      };
    }
  }
  async post(path, entity, options = {}) {
    const headers = new Headers(this.headers);
    if (options.headers) for (const [key, value] of new Headers(options.headers).entries()) headers.set(key, value);
    if (options.idempotencyKey) headers.set("Idempotency-Key", options.idempotencyKey);
    const requestOptions = {
      method: "POST",
      body: JSON.stringify(entity),
      ...options,
      headers
    };
    return this.fetchRequest(path, requestOptions);
  }
  async get(path, options = {}) {
    const headers = new Headers(this.headers);
    if (options.headers) for (const [key, value] of new Headers(options.headers).entries()) headers.set(key, value);
    const requestOptions = {
      method: "GET",
      ...options,
      headers
    };
    return this.fetchRequest(path, requestOptions);
  }
  async put(path, entity, options = {}) {
    const headers = new Headers(this.headers);
    if (options.headers) for (const [key, value] of new Headers(options.headers).entries()) headers.set(key, value);
    const requestOptions = {
      method: "PUT",
      body: JSON.stringify(entity),
      ...options,
      headers
    };
    return this.fetchRequest(path, requestOptions);
  }
  async patch(path, entity, options = {}) {
    const headers = new Headers(this.headers);
    if (options.headers) for (const [key, value] of new Headers(options.headers).entries()) headers.set(key, value);
    const requestOptions = {
      method: "PATCH",
      body: JSON.stringify(entity),
      ...options,
      headers
    };
    return this.fetchRequest(path, requestOptions);
  }
  async delete(path, query) {
    const requestOptions = {
      method: "DELETE",
      body: JSON.stringify(query),
      headers: this.headers
    };
    return this.fetchRequest(path, requestOptions);
  }
};
function emailLayout(content) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <!-- Header -->
          <tr>
            <td style="background-color:#065f46;padding:24px 32px;">
              <h1 style="margin:0;font-size:18px;font-weight:600;color:#ffffff;">B2B Website</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                This is an automated notification from B2B Website.
                If you did not expect this email, you can safely ignore it.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
function mapEventToEmail(event) {
  const data = event.data;
  switch (event.type) {
    case NOTIFICATION_EVENTS.QUOTE_CREATED:
      return {
        to: data.to,
        subject: `[New Inquiry] from ${escapeHtml$1(String(data.customerName ?? ""))}`,
        html: emailLayout(`
          <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">New Inquiry Received</h2>
          <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;width:100px;">Name</td><td style="padding:8px 0;font-size:14px;color:#111827;font-weight:500;">${escapeHtml$1(String(data.customerName ?? ""))}</td></tr>
            <tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Email</td><td style="padding:8px 0;font-size:14px;color:#111827;font-weight:500;">${escapeHtml$1(String(data.customerEmail ?? ""))}</td></tr>
            ${data.company ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Company</td><td style="padding:8px 0;font-size:14px;color:#111827;font-weight:500;">${escapeHtml$1(String(data.company))}</td></tr>` : ""}
            ${data.product ? `<tr><td style="padding:8px 0;color:#6b7280;font-size:14px;">Product</td><td style="padding:8px 0;font-size:14px;color:#111827;font-weight:500;">${escapeHtml$1(String(data.product))}</td></tr>` : ""}
          </table>
          <div style="background-color:#f9fafb;border-left:4px solid #065f46;padding:16px;border-radius:0 8px 8px 0;margin-bottom:20px;">
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;white-space:pre-wrap;">${escapeHtml$1(String(data.message ?? ""))}</p>
          </div>
          ${data.adminUrl ? `<a href="${escapeHtml$1(String(data.adminUrl))}" style="display:inline-block;padding:10px 20px;background-color:#065f46;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">View in Admin Panel</a>` : ""}
        `)
      };
    case NOTIFICATION_EVENTS.QUOTE_STATUS_CHANGED:
      return {
        to: data.to,
        subject: `[Update] Your inquiry status has changed`,
        html: emailLayout(`
          <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">Inquiry Status Update</h2>
          <p style="margin:0 0 16px;font-size:14px;color:#374151;">Dear ${escapeHtml$1(String(data.customerName ?? ""))},</p>
          <p style="margin:0 0 8px;font-size:14px;color:#374151;">Your inquiry <strong>#${escapeHtml$1(String(data.quoteId ?? ""))}</strong> status has been updated to:</p>
          <div style="display:inline-block;padding:6px 16px;background-color:#d1fae5;color:#065f46;border-radius:9999px;font-size:14px;font-weight:600;margin-bottom:20px;">${escapeHtml$1(String(data.newStatus ?? ""))}</div>
        `)
      };
    case NOTIFICATION_EVENTS.COMMENT_CREATED:
      return {
        to: data.to,
        subject: `[New Comment] on "${escapeHtml$1(String(data.postTitle ?? ""))}"`,
        html: emailLayout(`
          <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">New Comment</h2>
          <p style="margin:0 0 16px;font-size:14px;color:#374151;"><strong>${escapeHtml$1(String(data.authorName ?? ""))}</strong> commented on "${escapeHtml$1(String(data.postTitle ?? ""))}":</p>
          <div style="background-color:#f9fafb;border-left:4px solid #065f46;padding:16px;border-radius:0 8px 8px 0;margin-bottom:20px;">
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${escapeHtml$1(String(data.commentPreview ?? ""))}</p>
          </div>
          <a href="${escapeHtml$1(String(data.commentUrl ?? ""))}" style="display:inline-block;padding:10px 20px;background-color:#065f46;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">View Comment</a>
        `)
      };
    case NOTIFICATION_EVENTS.COMMENT_PENDING_REVIEW:
      return {
        to: data.to,
        subject: `[Review Required] New comment on "${escapeHtml$1(String(data.postTitle ?? ""))}"`,
        html: emailLayout(`
          <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">Comment Awaiting Review</h2>
          <p style="margin:0 0 16px;font-size:14px;color:#374151;"><strong>${escapeHtml$1(String(data.authorName ?? ""))}</strong> submitted a comment on "${escapeHtml$1(String(data.postTitle ?? ""))}":</p>
          <div style="background-color:#fef3c7;border-left:4px solid #f59e0b;padding:16px;border-radius:0 8px 8px 0;margin-bottom:20px;">
            <p style="margin:0;font-size:14px;color:#92400e;line-height:1.6;">${escapeHtml$1(String(data.commentPreview ?? ""))}</p>
          </div>
          <a href="${escapeHtml$1(String(data.reviewUrl ?? ""))}" style="display:inline-block;padding:10px 20px;background-color:#f59e0b;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">Review in Admin Panel</a>
        `)
      };
    case NOTIFICATION_EVENTS.COMMENT_REPLY_RECEIVED:
      return {
        to: data.to,
        subject: `[Reply] ${escapeHtml$1(String(data.replierName ?? ""))} replied to your comment on "${escapeHtml$1(String(data.postTitle ?? ""))}"`,
        html: emailLayout(`
          <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">New Reply to Your Comment</h2>
          <p style="margin:0 0 16px;font-size:14px;color:#374151;"><strong>${escapeHtml$1(String(data.replierName ?? ""))}</strong> replied:</p>
          <div style="background-color:#f9fafb;border-left:4px solid #065f46;padding:16px;border-radius:0 8px 8px 0;margin-bottom:20px;">
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${escapeHtml$1(String(data.replyPreview ?? ""))}</p>
          </div>
          <a href="${escapeHtml$1(String(data.commentUrl ?? ""))}" style="display:inline-block;padding:10px 20px;background-color:#065f46;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">View Reply</a>
        `)
      };
    case NOTIFICATION_EVENTS.NEWS_PUBLISHED:
      return {
        to: "",
        subject: `[News] ${escapeHtml$1(String(data.newsTitle ?? ""))}`,
        html: emailLayout(`
          <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">${escapeHtml$1(String(data.newsTitle ?? ""))}</h2>
          ${data.summary ? `<p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.6;">${escapeHtml$1(String(data.summary))}</p>` : ""}
          <a href="${escapeHtml$1(String(data.newsUrl ?? ""))}" style="display:inline-block;padding:10px 20px;background-color:#065f46;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">Read More</a>
        `)
      };
    case NOTIFICATION_EVENTS.PRODUCT_PUBLISHED:
      return {
        to: "",
        subject: `[Product] ${escapeHtml$1(String(data.productName ?? ""))}`,
        html: emailLayout(`
          <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">${escapeHtml$1(String(data.productName ?? ""))}</h2>
          ${data.summary ? `<p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.6;">${escapeHtml$1(String(data.summary))}</p>` : ""}
          <a href="${escapeHtml$1(String(data.productUrl ?? ""))}" style="display:inline-block;padding:10px 20px;background-color:#065f46;color:#ffffff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:500;">View Product</a>
        `)
      };
    default:
      return null;
  }
}
let resendClient = null;
function getResendClient(apiKey) {
  if (!resendClient || resendClient._apiKey !== apiKey) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}
async function sendEmailNotification(ctx, event, channelConfig, recipient, customTemplate) {
  const data = event.data;
  const defaultEmail = mapEventToEmail(event);
  let subject;
  let html;
  if (customTemplate?.subject || customTemplate?.body) {
    subject = customTemplate.subject ? renderTemplate(customTemplate.subject, data) : defaultEmail?.subject || event.type;
    const rawBody = customTemplate.body || "";
    html = rawBody ? emailLayout(renderTemplate(rawBody, data)) : defaultEmail?.html || "";
  } else if (defaultEmail) {
    subject = defaultEmail.subject;
    html = defaultEmail.html;
  } else {
    logger.info("No email template for event type", { eventType: event.type });
    return;
  }
  const to = recipient || defaultEmail?.to || "";
  if (!to) {
    logger.info("No email recipient specified, skipping");
    return;
  }
  const envApiKey = ctx.env?.RESEND_API_KEY || "";
  const config = channelConfig;
  const apiKey = envApiKey || config.apiKey || "";
  const envFrom = ctx.env?.EMAIL_FROM || "";
  const fromAddress = envFrom || config.senderAddress || "onboarding@resend.dev";
  const fromName = config.senderName || "B2B Website";
  const from = `${fromName} <${fromAddress}>`;
  if (!apiKey) {
    logger.info("Email dev mode (no API key)", { to, from, subject });
    return;
  }
  try {
    const resend = getResendClient(apiKey);
    const { data: data2, error } = await resend.emails.send({
      from,
      to: [to],
      subject,
      html
    });
    if (error) {
      throw new Error(`Resend error: ${error.name} — ${error.message}`);
    }
    logger.info("Email sent", { to, emailId: data2?.id });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to send email: ${errorMsg}`, { cause: error });
  }
}
const BLOCKED_RANGES = [
  [0, 0, 0, 0, 8],
  [10, 0, 0, 0, 8],
  [100, 64, 0, 0, 10],
  [127, 0, 0, 0, 8],
  [169, 254, 0, 0, 16],
  [172, 16, 0, 0, 12],
  [192, 0, 0, 0, 24],
  [192, 0, 2, 0, 24],
  [192, 168, 0, 0, 16],
  [198, 18, 0, 0, 15],
  [198, 51, 100, 0, 24],
  [203, 0, 113, 0, 24]
];
function ipInRange(ip) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((p) => isNaN(p))) return true;
  const ipNum = ipToInt(parts);
  for (const [r0, r1, r2, r3, cidr] of BLOCKED_RANGES) {
    const shift = 32 - cidr;
    const mask = shift === 32 ? 0 : 4294967295 << shift >>> 0;
    const rangeNum = ipToInt([r0, r1, r2, r3]);
    if ((ipNum & mask) >>> 0 === (rangeNum & mask) >>> 0) return true;
  }
  return false;
}
function ipToInt(parts) {
  return parts[0] * 16777216 + parts[1] * 65536 + parts[2] * 256 + parts[3] >>> 0;
}
function validateWebhookUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { valid: false, reason: "Invalid URL format" };
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    return { valid: false, reason: `Protocol "${parsed.protocol}" is not allowed.` };
  }
  const hostname = parsed.hostname;
  const bareHost = hostname.replace(/^\[|\]$/g, "");
  if (bareHost === "::1" || bareHost.startsWith("fc00:") || bareHost.startsWith("fe80:")) {
    return { valid: false, reason: "IPv6 loopback or unique-local addresses are not allowed" };
  }
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
    if (ipInRange(hostname)) return { valid: false, reason: "Private/loopback/link-local IP addresses are not allowed" };
  }
  const blockedHostnames = ["metadata.google.internal", "metadata.goog"];
  if (blockedHostnames.includes(hostname.toLowerCase())) {
    return { valid: false, reason: "Cloud metadata hostnames are not allowed" };
  }
  if (hostname.toLowerCase() === "localhost" || hostname.endsWith(".local")) {
    return { valid: false, reason: "Localhost addresses are not allowed" };
  }
  return { valid: true };
}
async function sendWebhook(ctx, event, channelConfig) {
  const config = channelConfig;
  const url = config.url;
  if (!url || typeof url !== "string") throw new Error("Webhook URL is not configured");
  const validation = validateWebhookUrl(url);
  if (!validation.valid) throw new Error(`Webhook URL rejected: ${validation.reason}`);
  const payload = { event: event.type, data: event.data, timestamp: (/* @__PURE__ */ new Date()).toISOString() };
  const headers = { "Content-Type": "application/json", ...config.headers };
  if (config.secret) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey("raw", encoder.encode(config.secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
    const bodyStr = JSON.stringify(payload);
    const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(bodyStr));
    headers["X-Webhook-Signature"] = btoa(String.fromCharCode(...new Uint8Array(sig)));
  }
  try {
    const response = await fetch(url, { method: "POST", headers, body: JSON.stringify(payload), signal: AbortSignal.timeout(1e4) });
    if (!response.ok) {
      const responseText = await response.text().catch(() => "[unreadable]");
      logger.error("Webhook target returned error", { status: response.status, eventType: event.type, url, response: responseText.slice(0, 500) });
      throw new Error(`Webhook target returned HTTP ${response.status}`);
    }
    logger.info("Webhook delivered", { eventType: event.type, url: maskUrl(url) });
  } catch (error) {
    if (error instanceof TypeError && error.message.includes("fetch")) throw new Error("Failed to connect to webhook target", { cause: error });
    if (error instanceof Error) throw error;
    throw new Error("Webhook delivery failed", { cause: error });
  }
}
function maskUrl(url) {
  try {
    const p = new URL(url);
    return `${p.protocol}//${p.hostname}${p.port ? ":" + p.port : ""}/...`;
  } catch {
    return "[invalid-url]";
  }
}
const DEFAULT_CONFIG = {
  windowSeconds: 300,
  enabled: true
};
async function getRateLimitConfig(ctx) {
  try {
    const config = await getNotificationSetting(ctx, "rate_limit");
    if (!config) return DEFAULT_CONFIG;
    return {
      windowSeconds: typeof config.windowSeconds === "number" ? config.windowSeconds : DEFAULT_CONFIG.windowSeconds,
      enabled: config.enabled !== false
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}
async function isRateLimited(ctx, params) {
  const config = await getRateLimitConfig(ctx);
  if (!config.enabled) return false;
  const cutoff = Math.floor(Date.now() / 1e3) - config.windowSeconds;
  const row = await ctx.db.prepare(
    `SELECT COUNT(*) as cnt FROM notification_logs
       WHERE event_type = ?
         AND channel_id = ?
         AND recipient = ?
         AND status = 'sent'
         AND created_at > ?`
  ).bind(
    params.eventType,
    params.channelId,
    params.recipient ?? "",
    cutoff
  ).first();
  return (row?.cnt ?? 0) > 0;
}
async function getSetting(ctx, key) {
  return await getNotificationSetting(ctx, key);
}
async function getSubscribedChannels(ctx, eventType2) {
  const rows = await ctx.db.prepare(
    `SELECT nc.* FROM notification_channels nc
       INNER JOIN notification_subscriptions ns ON nc.id = ns.channel_id
       WHERE ns.event_type = ? AND nc.enabled = 1`
  ).bind(eventType2).all();
  return rows.results.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    config: r.config ? JSON.parse(r.config) : {}
  }));
}
async function logNotification(ctx, params) {
  const id = crypto.randomUUID();
  await ctx.db.prepare(
    `INSERT INTO notification_logs (id, event_type, channel_id, channel_type, status, recipient, error_message, event_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    id,
    params.eventType,
    params.channelId ?? null,
    params.channelType,
    params.status,
    params.recipient ?? null,
    params.errorMessage ?? null,
    params.eventData ? JSON.stringify(params.eventData) : null
  ).run();
  notifySSEClients(ctx, {
    eventType: params.eventType,
    channelType: params.channelType,
    status: params.status,
    recipient: params.recipient,
    errorMessage: params.errorMessage,
    logId: id,
    eventData: params.eventData
  }).catch(() => {
  });
}
async function notifySSEClients(ctx, data) {
  try {
    const baseUrl2 = ctx.env?.NOTIFICATION_SSE_URL;
    const url = baseUrl2 || "http://localhost:8787/api/notifications/stream";
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
  } catch {
  }
}
async function sendAndLog(ctx, event, channel, recipient, customTemplate) {
  const limited = await isRateLimited(ctx, {
    eventType: event.type,
    channelId: channel.id,
    recipient
  });
  if (limited) {
    logger.info("Notification rate limited", { eventType: event.type, channel: channel.name, recipient });
    await logNotification(ctx, {
      eventType: event.type,
      channelId: channel.id,
      channelType: channel.type,
      status: "skipped",
      recipient,
      errorMessage: "Rate limited: duplicate notification within time window",
      eventData: event
    });
    return;
  }
  try {
    if (channel.type === "email") {
      await sendEmailNotification(ctx, event, channel.config, recipient, customTemplate);
    } else if (channel.type === "webhook") {
      await sendWebhook(ctx, event, channel.config);
    }
    await logNotification(ctx, {
      eventType: event.type,
      channelId: channel.id,
      channelType: channel.type,
      status: "sent",
      recipient,
      eventData: event
    });
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    logger.error("Notification send failed", { channelType: channel.type, channelName: channel.name, error: errorMsg });
    await logNotification(ctx, {
      eventType: event.type,
      channelId: channel.id,
      channelType: channel.type,
      status: "failed",
      recipient,
      errorMessage: errorMsg,
      eventData: event
    });
  }
}
async function processNotificationEvent(ctx, event) {
  const parsed = notificationEventSchema.safeParse(event);
  if (!parsed.success) {
    logger.error("Invalid notification event", { error: String(parsed.error) });
    return;
  }
  const validEvent = parsed.data;
  const adminChannels = await getSetting(ctx, "admin_channels");
  const userEmailSetting = await getSetting(ctx, "user_email");
  const adminEmailEnabled = adminChannels?.email ?? true;
  const adminWebhookEnabled = adminChannels?.webhook ?? true;
  const userEmailEnabled = userEmailSetting?.enabled ?? true;
  const channels = await getSubscribedChannels(ctx, validEvent.type);
  const deliveries = [];
  const templateSetting = await getSetting(ctx, templateKey(validEvent.type));
  const customTemplate = templateSetting;
  if (isUserNotificationEvent(validEvent)) {
    if (!userEmailEnabled) {
      await logNotification(ctx, {
        eventType: validEvent.type,
        channelType: "email",
        status: "skipped",
        eventData: validEvent
      });
      return;
    }
    const recipient = validEvent.data.to;
    if (!recipient) return;
    const emailChannels = channels.filter((c) => c.type === "email");
    if (emailChannels.length > 0) {
      for (const channel of emailChannels) {
        deliveries.push(sendAndLog(ctx, validEvent, channel, recipient, customTemplate));
      }
    } else {
      const defaultEmailChannel = channels.length === 0 ? { id: "default-email", name: "Default Email", type: "email", config: {} } : null;
      if (defaultEmailChannel) {
        deliveries.push(sendAndLog(ctx, validEvent, defaultEmailChannel, recipient, customTemplate));
      }
    }
  }
  if (isAdminNotificationEvent(validEvent)) {
    const recipient = validEvent.data.to;
    if (!recipient) return;
    if (adminEmailEnabled) {
      const emailChannels = channels.filter((c) => c.type === "email");
      if (emailChannels.length > 0) {
        for (const channel of emailChannels) {
          deliveries.push(sendAndLog(ctx, validEvent, channel, recipient, customTemplate));
        }
      } else {
        deliveries.push(
          sendAndLog(ctx, validEvent, { id: "default-email", name: "Default Email", type: "email", config: {} }, recipient, customTemplate)
        );
      }
    }
    if (adminWebhookEnabled) {
      const webhookChannels = channels.filter((c) => c.type === "webhook");
      for (const channel of webhookChannels) {
        deliveries.push(sendAndLog(ctx, validEvent, channel, recipient, customTemplate));
      }
    }
  }
  if (!isUserNotificationEvent(validEvent) && !isAdminNotificationEvent(validEvent)) {
    for (const channel of channels) {
      deliveries.push(sendAndLog(ctx, validEvent, channel, void 0, customTemplate));
    }
  }
  await Promise.allSettled(deliveries);
}
async function publishNotificationEvent(ctx, event) {
  const parsed = notificationEventSchema.safeParse(event);
  if (!parsed.success) {
    logger.error("Invalid notification event", { error: String(parsed.error) });
    return;
  }
  const queue = ctx.env?.NOTIFICATION_QUEUE;
  if (queue) {
    try {
      await queue.send(JSON.stringify(parsed.data), { contentType: "application/json" });
      return;
    } catch (error) {
      logger.warn("Queue send failed, falling back to sync", { error: String(error) });
    }
  }
  await processNotificationEvent(ctx, parsed.data);
}
export {
  publishNotificationEvent as p
};
