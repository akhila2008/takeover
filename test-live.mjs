import https from 'https';
https.get('https://takeover-e2p8ztf3g-akhila2008s-projects.vercel.app/', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    const match = data.match(/src=\"([^\"]+index-[^\"]+\.js)\"/);
    if (match) {
      console.log('JS URL:', match[1]);
      https.get('https://takeover-e2p8ztf3g-akhila2008s-projects.vercel.app' + match[1], (res2) => {
        let jsData = '';
        res2.on('data', (chunk) => { jsData += chunk; });
        res2.on('end', () => {
           console.log('Has ErrorBoundary?', jsData.includes('Something went wrong in React'));
        });
      });
    } else {
      console.log('No JS bundle found in HTML', data.substring(0, 500));
    }
  });
}).on('error', (err) => {
  console.log('Error: ' + err.message);
});
