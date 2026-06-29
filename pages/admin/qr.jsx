import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { QrCode, Download, ExternalLink, Lock, Loader2, Check, Copy, Edit3, X, Eye } from 'lucide-react';
import { downloadStyledQRPNG, generateStyledSVGDataUrl } from '../../lib/qr-generator';

export default function AdminQR() {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [qrList, setQrList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Inline edit & preview state
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Check localStorage for saved password
  useEffect(() => {
    const savedPass = localStorage.getItem('bright_admin_pass');
    if (savedPass) {
      setPassword(savedPass);
      verifyAndFetch(savedPass);
    }
  }, []);

  const verifyAndFetch = async (passToVerify) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/qr/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passToVerify }),
      });
      
      if (res.ok) {
        const data = await res.json();
        setQrList(data.qrCodes || []);
        setIsAuthorized(true);
        localStorage.setItem('bright_admin_pass', passToVerify);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Невірний пароль');
        setIsAuthorized(false);
        localStorage.removeItem('bright_admin_pass');
      }
    } catch (err) {
      setError('Помилка з\'єднання з сервером');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!password) return;
    verifyAndFetch(password);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        await verifyAndFetch(password);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Не вдалося згенерувати код');
      }
    } catch (err) {
      setError('Помилка з\'єднання при генерації');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadQR = (dataUrl, filename) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogout = () => {
    localStorage.removeItem('bright_admin_pass');
    setPassword('');
    setIsAuthorized(false);
    setQrList([]);
  };

  const handleStartEditName = (id, currentName) => {
    setEditingId(id);
    setEditingName(currentName || '');
    setError('');
  };

  const handleSaveName = async (id) => {
    if (editingName.length > 50) {
      setError("Ім'я не може бути довшим за 50 символів");
      return;
    }
    setSavingName(true);
    setError('');
    try {
      const res = await fetch('/api/qr/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, id, ownerName: editingName }),
      });

      if (res.ok) {
        setQrList(prev => prev.map(qr => qr.id === id ? { ...qr, ownerName: editingName } : qr));
        setEditingId(null);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Не вдалося оновити ім\'я');
      }
    } catch (err) {
      setError('Помилка з\'єднання при оновленні імені');
    } finally {
      setSavingName(false);
    }
  };

  if (!isAuthorized) {
    return (
      <Layout title="Адмін-панель QR | BRIGHT SHOP">
        <div className="min-h-screen bg-gradient-to-br from-pink-600 via-rose-500 to-pink-850 text-white flex items-center justify-center px-4 pt-24 pb-12 relative overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-white rounded-full blur-[140px] opacity-15 pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-300 rounded-full blur-[140px] opacity-15 pointer-events-none"></div>

          <div className="w-full max-w-md bg-pink-950/40 border border-pink-400/20 p-8 rounded-[32px] shadow-2xl relative z-10 backdrop-blur-xl">
            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 bg-white/10 border border-white/20 text-white rounded-2xl flex items-center justify-center mb-4">
                <Lock size={28} />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tighter italic text-center">
                АДМІНІСТРУВАННЯ QR
              </h1>
              <p className="text-xs text-pink-200/70 font-bold uppercase tracking-wider mt-2 text-center">
                Введіть пароль доступу для керування кодами
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-6">
              <div>
                <input
                  type="password"
                  placeholder="Введіть пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-pink-950/40 border border-pink-500/20 rounded-2xl focus:border-white focus:outline-none text-white font-bold text-sm transition-all text-center tracking-widest placeholder-pink-200/30"
                  required
                />
              </div>

              {error && (
                <p className="text-red-300 text-xs font-bold text-center bg-red-950/30 border border-red-900/40 py-3 rounded-2xl">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white text-black hover:bg-pink-900 hover:text-white disabled:bg-pink-950/40 disabled:text-pink-300/40 py-4.5 font-black uppercase text-base tracking-wider rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'УВІЙТИ'}
              </button>
            </form>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Адмін-панель QR | BRIGHT SHOP">
      <div className="min-h-screen bg-gradient-to-br from-pink-600 via-rose-500 to-pink-850 text-white pt-32 pb-16 px-4 md:px-8 relative overflow-hidden">
        {/* Glow spots */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-300 rounded-full blur-[150px] opacity-10 pointer-events-none"></div>

        <div className="max-w-6xl mx-auto space-y-8 relative z-10">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-pink-500/20 pb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                <QrCode size={36} /> КЕРУВАННЯ QR-КОДАМИ
              </h1>
              <p className="text-pink-200/70 text-sm mt-1">Створення та моніторинг унікальних QR-кодів для мерчу.</p>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="bg-white text-black hover:bg-pink-900 hover:text-white disabled:bg-pink-950/40 disabled:text-pink-300/40 px-6 py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                {generating ? <Loader2 className="animate-spin" size={16} /> : 'ЗГЕНЕРУВАТИ QR'}
              </button>
              <button
                onClick={handleLogout}
                className="border border-white/20 hover:border-red-400/30 hover:bg-red-950/15 text-pink-100 hover:text-red-400 px-6 py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs transition-all cursor-pointer"
              >
                ВИЙТИ
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-950/30 border border-red-900/40 rounded-2xl text-red-300 text-xs font-bold text-center">
              {error}
            </div>
          )}

          {/* Stats & Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-pink-950/40 border border-pink-500/20 p-6 rounded-3xl shadow-xl backdrop-blur-xl">
              <p className="text-pink-200/50 font-bold text-xs uppercase tracking-wider">Усього кодів</p>
              <p className="text-4xl font-black italic mt-2 text-white">{qrList.length}</p>
            </div>
            <div className="bg-pink-950/40 border border-pink-500/20 p-6 rounded-3xl shadow-xl backdrop-blur-xl">
              <p className="text-pink-200/50 font-bold text-xs uppercase tracking-wider">Активовано (Claimed)</p>
              <p className="text-4xl font-black italic mt-2 text-green-300">
                {qrList.filter(q => q.status === 'claimed').length}
              </p>
            </div>
            <div className="bg-pink-950/40 border border-pink-500/20 p-6 rounded-3xl shadow-xl backdrop-blur-xl">
              <p className="text-pink-200/50 font-bold text-xs uppercase tracking-wider">Вільні коди (Unclaimed)</p>
              <p className="text-4xl font-black italic mt-2 text-pink-300">
                {qrList.filter(q => q.status === 'unclaimed').length}
              </p>
            </div>
          </div>

          {/* Table / List */}
          <div className="bg-pink-950/40 border border-pink-500/20 rounded-3xl shadow-xl overflow-hidden backdrop-blur-xl">
            <div className="p-6 border-b border-pink-500/20 flex justify-between items-center">
              <h3 className="font-black uppercase tracking-tighter italic text-sm">Список генерованих кодів</h3>
              <span className="text-[10px] font-bold text-pink-200 bg-pink-900/40 px-3 py-1.5 rounded-full border border-pink-500/10">
                Сортування: Свіжі спочатку
              </span>
            </div>

            {loading ? (
              <div className="py-20 flex justify-center items-center text-pink-200/60 font-bold text-xs uppercase tracking-widest">
                <Loader2 className="animate-spin mr-2" size={20} /> Завантаження кодів...
              </div>
            ) : qrList.length === 0 ? (
              <div className="py-20 text-center text-pink-200/50 font-bold uppercase tracking-wider text-xs">
                Коди ще не генерувались. Натисніть кнопку вище!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-pink-500/20 text-pink-200/70 text-[10px] font-bold uppercase tracking-wider">
                      <th className="p-6">UUID / QR-код</th>
                      <th className="p-6">Статус</th>
                      <th className="p-6">Дата створення</th>
                      <th className="p-6">Власник</th>
                      <th className="p-6 text-right">Дії</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-pink-500/10">
                    {qrList.map((qr) => {
                      const profileUrl = typeof window !== 'undefined' ? `${window.location.origin}/p/${qr.id}` : `/p/${qr.id}`;
                      return (
                        <tr key={qr.id} className="hover:bg-pink-900/20 transition-colors">
                          <td className="p-6">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => {
                                  setPreviewData({
                                    id: qr.id,
                                    url: profileUrl,
                                    svgDataUrl: generateStyledSVGDataUrl(profileUrl)
                                  });
                                }}
                                className="w-9 h-9 bg-white/10 hover:bg-white text-white border border-white/20 hover:text-black rounded-xl flex items-center justify-center font-bold text-xs transition-all cursor-pointer shadow-sm"
                                title="Натисніть для перегляду QR"
                              >
                                QR
                              </button>
                              <div>
                                <div className="font-mono text-sm flex items-center gap-2">
                                  <span className="text-white">{qr.id.substring(0, 18)}...</span>
                                  <button 
                                    onClick={() => copyToClipboard(qr.id, qr.id)}
                                    className="text-pink-200/50 hover:text-white transition-colors"
                                    title="Скопіювати повний UUID"
                                  >
                                    {copiedId === qr.id ? <Check size={14} className="text-green-300" /> : <Copy size={14} />}
                                  </button>
                                </div>
                                <a 
                                  href={`/p/${qr.id}`} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  className="text-xs text-white hover:underline flex items-center gap-1 mt-0.5 font-bold"
                                >
                                  Відкрити сторінку <ExternalLink size={10} />
                                </a>
                              </div>
                            </div>
                          </td>
                          <td className="p-6">
                            {qr.status === 'claimed' ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-950/40 border border-green-900/40 text-green-300">
                                Активовано
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-pink-950/40 border border-pink-900/40 text-pink-300">
                                Вільний
                              </span>
                            )}
                          </td>
                          <td className="p-6 text-sm text-pink-100/70 font-mono">
                            {qr.createdAt ? new Date(qr.createdAt).toLocaleDateString('uk-UA', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '-'}
                          </td>
                          <td className="p-6 text-sm">
                            {qr.status === 'claimed' ? (
                              editingId === qr.id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={editingName}
                                    onChange={(e) => setEditingName(e.target.value)}
                                    className="px-3 py-1.5 bg-pink-950/60 border border-pink-500/30 rounded-xl text-xs text-white focus:outline-none focus:border-white font-bold max-w-[150px]"
                                    maxLength={50}
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => handleSaveName(qr.id)}
                                    disabled={savingName}
                                    className="text-green-300 hover:text-green-200 p-1 cursor-pointer"
                                    title="Зберегти"
                                  >
                                    {savingName ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="text-red-300 hover:text-red-200 p-1 cursor-pointer"
                                    title="Скасувати"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-bold text-white flex items-center gap-1.5">
                                    {qr.ownerName || 'Власник футболки'}
                                    <button
                                      onClick={() => handleStartEditName(qr.id, qr.ownerName || 'Власник футболки')}
                                      className="text-pink-300 hover:text-white transition-colors cursor-pointer"
                                      title="Редагувати ім'я"
                                    >
                                      <Edit3 size={12} />
                                    </button>
                                  </span>
                                  <span className="text-[10px] text-pink-200/50 font-mono">ID: {qr.ownerId.substring(0, 8)}...</span>
                                </div>
                              )
                            ) : (
                              <span className="text-pink-200/30">-</span>
                            )}
                          </td>
                          <td className="p-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setPreviewData({
                                    id: qr.id,
                                    url: profileUrl,
                                    svgDataUrl: generateStyledSVGDataUrl(profileUrl)
                                  });
                                }}
                                className="inline-flex items-center gap-1.5 bg-pink-900/40 hover:bg-pink-800/60 border border-pink-500/20 px-3 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer text-white"
                                title="Переглянути стилізований QR-код"
                              >
                                <Eye size={14} /> Прев'ю
                              </button>
                              <button
                                onClick={() => {
                                  downloadStyledQRPNG(profileUrl, `qr-brightshop-${qr.id.substring(0,8)}.png`);
                                }}
                                className="inline-flex items-center gap-1.5 bg-white text-black hover:bg-pink-900 hover:text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer shadow-md"
                                title="Завантажити високоякісний стилізований PNG"
                              >
                                <Download size={14} /> PNG
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* PREVIEW MODAL */}
      {previewData && (
        <div className="fixed inset-0 z-[500] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-pink-950 border border-pink-500/30 rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative space-y-6 text-center animate-in zoom-in-95">
            <button 
              onClick={() => setPreviewData(null)}
              className="absolute top-4 right-4 text-pink-200 hover:text-white p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>

            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter italic text-white">
                СТИЛІЗОВАНИЙ QR-КОД
              </h3>
              <p className="text-xs text-pink-200/60 font-mono mt-1">ID: {previewData.id.substring(0, 16)}...</p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-2xl flex items-center justify-center mx-auto w-64 h-64 border-4 border-pink-400/30">
              <img src={previewData.svgDataUrl} alt="Styled QR Code" className="w-full h-full object-contain" />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  downloadStyledQRPNG(previewData.url, `qr-brightshop-${previewData.id.substring(0,8)}.png`);
                }}
                className="w-full bg-white text-black hover:bg-pink-900 hover:text-white py-3.5 rounded-2xl font-black uppercase text-xs tracking-wider transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download size={14} /> СКАЧАТИ РЕЗУЛЬТАТ (PNG)
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
