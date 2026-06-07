import { db } from '../../../lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!db) {
    const diagnostic = {
      hasServiceAccount: !!process.env.FIREBASE_SERVICE_ACCOUNT,
      hasPrivateKey: !!process.env.FIREBASE_PRIVATE_KEY,
      hasClientEmail: !!process.env.FIREBASE_CLIENT_EMAIL,
      serviceAccountLength: process.env.FIREBASE_SERVICE_ACCOUNT ? process.env.FIREBASE_SERVICE_ACCOUNT.length : 0,
      envKeys: Object.keys(process.env).filter(k => k.includes('FIREBASE') || k.includes('ADMIN')),
    };
    return res.status(500).json({ 
      error: `Firebase Admin not initialized. Diagnostics: ${JSON.stringify(diagnostic)}`
    });
  }

  try {
    const qrsSnapshot = await db.collection('qrcodes').orderBy('createdAt', 'desc').get();
    const profilesSnapshot = await db.collection('profiles').get();
    
    const profilesMap = {};
    profilesSnapshot.forEach(doc => {
      profilesMap[doc.id] = doc.data();
    });

    const qrCodes = [];
    qrsSnapshot.forEach(doc => {
      const qrData = doc.data();
      const profile = profilesMap[qrData.id];
      qrCodes.push({
        ...qrData,
        ownerName: profile ? (profile.ownerName || 'Власник футболки') : (qrData.status === 'claimed' ? 'Власник футболки' : '-')
      });
    });

    return res.status(200).json({ qrCodes });
  } catch (error) {
    console.error('Error listing QR codes:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
