// noinspection RegExpRedundantEscape,RegExpDuplicateCharacterInClass

export function highlightStyleRules(rules) {
  return function customHighlightRules() {
    this.$rules = {
      start: rules
    };
  };
}

export function defaultRules() {
  return [{
    regex: /\b(Trace)\b:/,
    token: 'verbose' // verbose
  },{
    regex: /\b(DEBUG|Debug)\b|\b(debug)\:/,
    token: 'debug' // debug
  },{
    regex: /\b(HINT|INFO|INFORMATION|Info|NOTICE|II)\b|\b(info|information)\:/,
    token: 'info' // info
  },{
    regex: /\b(WARNING|WARN|Warn|WW)\b|\b(warning)\:/,
    token: 'warning' // warning
  },{
    regex: /\b(ALERT|CRITICAL|EMERGENCY|ERROR|FAILURE|FAIL|Fatal|FATAL|Error|EE)\b|\b(error)\:/,
    token: 'error' // error
  },{
    regex: /\b\d{4}-\d{2}-\d{2}(T|\b)/,
    token: 'date' // date
  },{
    regex: /(?<=(^|\s))\d{2}[^\w\s]\d{2}[^\w\s]\d{4}\b/,
    token: 'date' // date
  },{
    regex: /\d{1,2}:\d{2}(:\d{2}([.,]\d{1,})?)?(Z| ?[+-]\d{1,2}:\d{2})?\b/,
    token: 'date' // date
  },{
    regex: /\b([0-9a-fA-F]{40}|[0-9a-fA-F]{10}|[0-9a-fA-F]{7})\b/,
    token: 'language' // language Git commit hashes of length 40, 10 or 7
  },{
    regex: /\b[0-9a-fA-F]{8}[-]?([0-9a-fA-F]{4}[-]?){3}[0-9a-fA-F]{12}\b/,
    token: 'constant' // constant
  },{
    regex: /\b([0-9a-fA-F]{2,}[:-])+[0-9a-fA-F]{2,}\b/,
    token: 'constant' // constant
  },{
    regex: /\b([0-9]+|true|false|null)\b/,
    token: 'constant' // constant
  },{
    regex: /"[^"]*"/,
    token: 'string' // string
  },{
    regex: /(?<![\w])'[^']*'/,
    token: 'string' // string
  },{
    regex: /\b([a-zA-Z.]*Exception)\b/,
    token: 'regexp' // regexp
  },{
    regex: /(http:|https:)\/\/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/,
    token: 'url' // url
  },{
    regex: /(?<![\w/\\])([\w-]+\.)+([\w-])+(?![\w/\\])/,
    token: 'keyword' // constant
  }];
}

export function defaultTokens() {
  return [
    {
      token: 'error',
      color: '#ff0000'
    },
    {
      token: 'info',
      color: 'green'
    },
    {
      token: 'warning',
      color: 'yellow'
    }
  ];
}
