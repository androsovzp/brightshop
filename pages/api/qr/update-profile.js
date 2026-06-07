import { db } from '../../../lib/firebase-admin';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password, id, ownerName } = req.body;

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Неавторизовано: Невірний пароль адміна' });
  }

  if (!id) {
    return res.status(400).json({ error: 'Missing profile ID' });
  }

  if (ownerName === undefined || ownerName === null) {
    return res.status(400).json({ error: 'Missing ownerName' });
  }

  if (ownerName.length > 50) {
    return res.status(400).json({ error: 'Ім\'я не може перевищувати 50 символів' });
  }

  if (!db) {
    return res.status(500).json({ error: 'Firebase Admin not initialized properly' });
  }

  try {
    const profileRef = db.collection('profiles').doc(id);
    const profileDoc = await profileRef.get();

    if (!profileDoc.exists) {
      return res.status(404).json({ error: 'Профіль не знайдено. Можливо, футболка ще не активована.' });
    }

    await profileRef.update({
      ownerName: ownerName || 'Власник футболки',
      updatedAt: new Date().toISOString()
    });

    return res.status(200).json({ success: true, message: 'Ім\'я власника успішно оновлено' });
  } catch (error) {
    console.error('Error in admin profile update:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
