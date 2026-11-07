import { useEffect } from 'react';
import { Platform } from 'react-native';

/** Registra o service worker somente na versão web publicada em HTTPS/localhost. */
export function PwaSetup() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;
    const register = () => navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('Não foi possível ativar o modo offline do DUDA:', error);
    });
    void register();
  }, []);
  return null;
}
