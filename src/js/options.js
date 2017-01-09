const docBaseApiToken = localStorage.docBaseApiToken;
if (docBaseApiToken) {
  document.getElementById('docbase-api-token').value = localStorage.docBaseApiToken;
}

document.getElementById('save')
        .addEventListener('click', function () {
          localStorage.docBaseApiToken = document.getElementById('docbase-api-token').value;
          window.close();
        });
