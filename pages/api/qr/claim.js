import { db, adminAuth } from '../../../lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization token' });
  }

  const token = authHeader.split('Bearer ')[1];
  const { id } = req.body; // QR code UUID

  if (!id) {
    return res.status(400).json({ error: 'Missing QR code ID' });
  }

  if (!db || !adminAuth) {
    return res.status(500).json({ error: 'Firebase Admin not initialized properly' });
  }

  try {
    // Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const qrRef = db.collection('qrcodes').doc(id);
    const qrDoc = await qrRef.get();

    if (!qrDoc.exists) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    const qrData = qrDoc.data();

    if (qrData.status === 'claimed' || qrData.ownerId) {
      return res.status(400).json({ error: 'QR code has already been claimed' });
    }

    // Begin batch write
    const batch = db.batch();

    // 1. Update QR code status
    batch.update(qrRef, {
      ownerId: userId,
      status: 'claimed',
      claimedAt: new Date().toISOString()
    });

    // 2. Create profile document
    const profileRef = db.collection('profiles').doc(id);
    batch.set(profileRef, {
      id: id,
      ownerId: userId,
      ownerName: 'Власник футболки',
      bioText: 'Привіт! Я власник цієї крутої футболки. Налаштуйте цей текст у своєму кабінеті.',
      updatedAt: new Date().toISOString()
    });

    await batch.commit();

    return res.status(200).json({ success: true, message: 'QR code claimed successfully' });
  } catch (error) {
    console.error('Error claiming QR code:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
