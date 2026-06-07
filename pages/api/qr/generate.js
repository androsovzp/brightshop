import { db } from '../../../lib/firebase-admin';
import qrCode from 'qrcode';
import crypto from 'crypto';

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

    // Generate QR code as Base64 Data URL
    const qrDataUrl = await qrCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });

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
