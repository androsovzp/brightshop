import { db, adminAuth } from '../../../lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization token' });
  }

  const token = authHeader.split('Bearer ')[1];

  if (!db || !adminAuth) {
    return res.status(500).json({ error: 'Firebase Admin not initialized properly' });
  }

  try {
    // Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Fetch owned QR codes
    const qrsSnapshot = await db.collection('qrcodes')
      .where('ownerId', '==', userId)
      .where('status', '==', 'claimed')
      .get();

    const qrCodes = [];
    const profilePromises = [];

    qrsSnapshot.forEach(doc => {
      const qrData = doc.data();
      qrCodes.push(qrData);
      // Fetch corresponding profiles in parallel
      profilePromises.push(db.collection('profiles').doc(qrData.id).get());
    });

    const profileDocs = await Promise.all(profilePromises);
    const profilesMap = {};
    profileDocs.forEach(doc => {
      if (doc.exists) {
        profilesMap[doc.id] = doc.data();
      }
    });

    // Merge QR code data and profile data
    const userMerch = qrCodes.map(qr => ({
      ...qr,
      bioText: profilesMap[qr.id]?.bioText || '',
      ownerName: profilesMap[qr.id]?.ownerName || 'Власник футболки'
    }));

    return res.status(200).json({ merch: userMerch });
  } catch (error) {
    console.error('Error fetching user QR codes:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
