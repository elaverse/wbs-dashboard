import { useState, useEffect } from 'react';
import { getApiConfig, setApiConfig } from '../config/apiConfig';

interface ApiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  theme: 'default' | 'light';
}

export function ApiConfigModal({
  isOpen,
  onClose,
  onSave,
  theme,
}: ApiConfigModalProps) {
  const [apiBase, setApiBase] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    if (isOpen) {
      const cfg = getApiConfig();
      setApiBase(cfg.apiBase);
      setToken(cfg.token);
    }
  }, [isOpen]);

  const handleSave = () => {
    setApiConfig(apiBase.trim(), token.trim());
    onSave();
    onClose();
  };

  if (!isOpen) return null;

  const isDark = theme === 'default';
  const bg = isDark ? '#2d2d2d' : '#fff';
  const inputBg = isDark ? '#1a1a1a' : '#fff';
  const border = isDark ? '#555' : '#ddd';
  const textColor = isDark ? '#fff' : '#333';

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: bg,
          borderRadius: 8,
          padding: 24,
          minWidth: 400,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 20px 0', fontSize: 18, color: textColor }}>
          API 설정
        </h3>
        <p style={{ margin: '0 0 16px 0', fontSize: 13, color: isDark ? '#aaa' : '#666' }}>
          다른 PC에서 사용 시 ITSM API 주소와 토큰을 입력하세요.
        </p>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: textColor }}>
            API 주소
          </label>
          <input
            type="url"
            value={apiBase}
            onChange={(e) => setApiBase(e.target.value)}
            placeholder="https://dev.e-cloud.ai:8443"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${border}`,
              borderRadius: 4,
              background: inputBg,
              color: textColor,
              fontSize: 14,
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: textColor }}>
            Bearer Token
          </label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="API 토큰 입력"
            style={{
              width: '100%',
              padding: '10px 12px',
              border: `1px solid ${border}`,
              borderRadius: 4,
              background: inputBg,
              color: textColor,
              fontSize: 14,
              boxSizing: 'border-box',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '8px 16px',
              background: 'transparent',
              border: `1px solid ${border}`,
              borderRadius: 6,
              color: textColor,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              background: '#2196f3',
              border: 'none',
              borderRadius: 6,
              color: '#fff',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
