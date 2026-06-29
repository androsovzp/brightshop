import { db } from '../../../lib/firebase-admin';
import crypto from 'crypto';
import { generateStyledSVGDataUrl } from '../../../lib/qr-generator';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!db) {
    return res.status(500).json({ error: 'Firebase Admin not initialized properly' });
  }

  try {
    const uuid = crypto.randomUUID();
    const host = req.headers.host;
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const url = `${protocol}://${host}/p/${uuid}`;

    // Generate styled QR code Data URL
    const qrDataUrl = generateStyledSVGDataUrl(url);

    // Save to Firestore
    const qrRef = db.collection('qrcodes').doc(uuid);
    await qrRef.set({
      id: uuid,
      ownerId: null,
      createdAt: new Date().toISOString(),
      status: 'unclaimed',
    });

    return res.status(200).json({ uuid, url, qrDataUrl });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
