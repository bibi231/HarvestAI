import 'dotenv/config';
const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT;
console.log('JSON Length:', json ? json.length : 0);
if (json) {
  try {
    console.log('First 20 chars:', json.substring(0, 20));
    console.log('Char at 13:', json[13], 'Code:', json.charCodeAt(13));
    JSON.parse(json);
    console.log('JSON is valid');
  } catch (err) {
    console.error('JSON Error:', err.message);
  }
} else {
  console.log('Env var missing');
}
