import { createSign } from 'crypto';

const GOOGLE_OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';

type GoogleSheetsConfig = {
  spreadsheetId: string;
  serviceAccountEmail: string;
  privateKey: string;
};

function getGoogleSheetsConfig(): GoogleSheetsConfig | null {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID?.trim();
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL?.trim();
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.trim();

  if (!spreadsheetId || !serviceAccountEmail || !privateKey) {
    return null;
  }

  return {
    spreadsheetId,
    serviceAccountEmail,
    privateKey: privateKey.replace(/\\n/g, '\n'),
  };
}

async function getAccessToken(config: GoogleSheetsConfig) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: config.serviceAccountEmail,
    scope: GOOGLE_SHEETS_SCOPE,
    aud: GOOGLE_OAUTH_TOKEN_URL,
    iat: now,
    exp: now + 3600,
  };

  const base64Url = (value: string) =>
    Buffer.from(value)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const unsignedToken = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
  const signer = createSign('RSA-SHA256');
  signer.update(unsignedToken);
  signer.end();

  const signature = signer.sign(config.privateKey, 'base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const assertion = `${unsignedToken}.${signature}`;

  const response = await fetch(GOOGLE_OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Unable to obtain Google access token: ${errorText}`);
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) {
    throw new Error('Google access token response did not include an access token.');
  }

  return data.access_token;
}

async function getFirstSheetTitle(config: GoogleSheetsConfig, accessToken: string) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(config.spreadsheetId)}?fields=sheets.properties.title`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Unable to read spreadsheet metadata: ${errorText}`);
  }

  const data = (await response.json()) as {
    sheets?: Array<{ properties?: { title?: string } }>;
  };

  const title = data.sheets?.[0]?.properties?.title?.trim();
  if (!title) {
    throw new Error('The spreadsheet does not contain any sheets.');
  }

  return title;
}

export async function appendSubscriberEmail(email: string, pageLabel: string) {
  const config = getGoogleSheetsConfig();

  if (!config) {
    throw new Error('Google Sheets is not configured.');
  }

  const accessToken = await getAccessToken(config);
  const sheetTitle = await getFirstSheetTitle(config, accessToken);
  const timestamp = new Date().toISOString();
  const range = `${sheetTitle}!A:C`;

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(config.spreadsheetId)}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [[email, timestamp, pageLabel]],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Unable to append subscriber email: ${errorText}`);
  }

  return response.json();
}