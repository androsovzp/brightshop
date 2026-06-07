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
  const { id, bioText, ownerName } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Missing profile ID' });
  }

  if (bioText === undefined || bioText === null) {
    return res.status(400).json({ error: 'Missing bioText' });
  }

  if (bioText.length > 500) {
    return res.status(400).json({ error: 'Bio text cannot exceed 500 characters' });
  }

  if (ownerName && ownerName.length > 50) {
    return res.status(400).json({ error: 'Ім\'я не може перевищувати 50 символів' });
  }

  if (!db || !adminAuth) {
    return res.status(500).json({ error: 'Firebase Admin not initialized properly' });
  }

  try {
    // Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const profileRef = db.collection('profiles').doc(id);
    const profileDoc = await profileRef.get();

    if (!profileDoc.exists) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const profileData = profileDoc.data();

    // Security check: only the owner can update the profile
    if (profileData.ownerId !== userId) {
      return res.status(403).json({ error: 'Forbidden: You do not own this profile' });
    }

    await profileRef.update({
      bioText: bioText,
      ownerName: ownerName || 'Власник футболки',
      updatedAt: new Date().toISOString()
    });

    return res.status(200).json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
