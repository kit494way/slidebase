chrome.tabs.getSelected(null, (tab) => {
  const parser = new URL(tab.url);

  let matches = /(.+)\.docbase\.io/g.exec(parser.hostname);
  if (!matches) {
    document.getElementById('message').innerHTML = parser.href + 'では実行できません。';
    return;
  }
  const team = matches[1];

  matches = /\/posts\/([0-9]+)/g.exec(parser.pathname);
  if (!matches) {
    document.getElementById('message').innerHTML = parser.href + 'では実行できません。';
    return;
  }
  const postId = matches[1];

  chrome.tabs.create({ url: './slidebase.html?team='+team+'&post_id='+postId });
});
