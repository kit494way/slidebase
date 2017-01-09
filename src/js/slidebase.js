import marked from 'marked';
import axios from 'axios';
import 'remark';

function main() {
  const docBaseApiToken = localStorage.docBaseApiToken;
  if (!docBaseApiToken) {
    alert('APIトークンが設定されていません。\n拡張機能のオプションから設定してください。');
    return;
  }

  const config = {
    baseURL: 'https://api.docbase.io/',
    headers: {
      'X-DocBaseToken': docBaseApiToken
    }
  }

  const instance = axios.create(config);

  const matches = /^\?team=(.+)&post_id=([0-9]+)$/.exec(window.location.search);
  if (!matches) {
    alert('チーム名、ドキュメントidの取得に失敗');
    return;
  }
  const team = matches[1];
  const postId = matches[2];

  instance.get('/teams/'+team+'/posts/'+postId)
          .then(function (response) {
            const markdown = response.data.body;
            const title = response.data.title;
            const name = response.data.user.name;
            const slideMarkdown = createSlideMarkdown(title, name, markdown);
            remark.create({ source: slideMarkdown });
          }).catch(function (error) {
            alert(error);
          });
}

export function createSlideMarkdown(title, name, markdown) {
  const lexer = new marked.Lexer();
  const tokens = lexer.lex(markdown);
  const slideTokens = createSlideTokens(title, name, tokens);
  const renderer = createMarkdownRenderer();
  return marked.parser(slideTokens, { renderer: renderer });
}

function createSlideTokens(title, name, tokens) {
  const headerTokens = [
    { type: 'paragraph', text: 'class: center, middle' },
    { type: 'heading', depth: 1, text: title },
    { type: 'paragraph', text: name }
  ];

  let slideTokens = tokens.map((token) => {
    return convertToken(token);
  }).reduce((accumulator, token) => {
    return accumulator.concat(token);
  }, headerTokens);
  slideTokens = removeDuplicateHr(slideTokens);
  slideTokens.links = tokens.links;
  return slideTokens;
}

function convertToken(token) {
  if (token.type == 'heading') {
    const slidePageDelimiter = { type: 'hr' };
    return [ slidePageDelimiter, token ]
  } else if (token.type == 'table') {
    const separator = [];
    for (let i = 0, length = token.align.length; i < length; ++i) {
      switch (token.align[i]) {
        case 'left': {
          separator.push(':---');
          break;
        }
        case 'center': {
          separator.push(':---:');
          break;
        }
        case 'right': {
          separator.push('---:');
          break;
        }
        default: {
          separator.push('---');
          break;
        }
      }
    }
    token.cells.unshift(separator);
    return [ token ];
  }

  return [ token ];
}

function removeDuplicateHr(tokens) {
  let newTokens = [];
  let prevTokenIsHr = false;
  for (let i = 0, length = tokens.length; i < length; ++i) {
    const token = tokens[i];
    if (prevTokenIsHr) {
      if (token.type != 'hr') {
        newTokens.push(token);
      }
    } else {
      newTokens.push(token);
    }
    prevTokenIsHr = token.type == 'hr';
  }
  return newTokens;
}

function createMarkdownRenderer() {
  const renderer = new marked.Renderer();

  renderer.code = (code, lang, escaped) => {
    return '\n```' + lang + '\n'
      + code + '\n'
      + '```\n'
  }

  renderer.blockquote = (quote) => {
    return '\n>' + quote.trim() + '\n';
  }

  renderer.heading = (text, level) => {
    return '\n# ' + unescapeHtml(text) + '\n';
  }

  renderer.hr = (text) => {
    return '\n---\n';
  }

  renderer.list = (body, ordered) => {
    if (ordered) {
      body = body.replace(/^-/gm, '1.');
    }
    return '\n' + body.trim() + '\n';
  }

  renderer.listitem = (text) => {
    // indent nested list
    text = text.replace(/^( *)(-|1\.) /gm, '  $1$2 ');

    text = text.replace(/^(\S)/gm, '- $1');
    return unescapeHtml(text).trim() + '\n';
  }

  renderer.paragraph = (text) => {
    return '\n' + unescapeHtml(text) + '\n';
  }

  renderer.table = (header, body) => {
    return '\n' + header + body;
  }

  renderer.tablerow = (content) => {
    return unescapeHtml(content) + '|\n';
  }

  renderer.tablecell = (content, flags) => {
    return '|' + unescapeHtml(content);
  }

  // span level renderer
  renderer.strong = (text) => {
    return '**' + text + '**';
  }

  renderer.em = (text) => {
    return '*' + text + '*';
  }

  renderer.codespan = (text) => {
    return '`' + unescapeHtml(text) + '`';
  }

  renderer.br = () => {
    return '  \n';
  }

  renderer.del = (text) => {
    return '~~' + text + '~~';
  }

  renderer.link = (href, title, text) => {
    return '[' + text + '](' + href + ')';
  }

  renderer.image = (href, title, text) => {
    return '![' + text + '](' + href + ')';
  }

  return renderer;
}

function unescapeHtml(html) {
  return html.replace(/&amp;/g, '&')
             .replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&quot;/g, '"')
             .replace(/&#39;/g, "'");
}

main();
