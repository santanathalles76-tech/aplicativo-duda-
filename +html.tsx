import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#718C73" />
        <meta name="description" content="DUDA — seu organizador pessoal." />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DUDA" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="icon" href="/icons/icon-192.png" />
        <ScrollViewStyleReset />
        <style>{`html,body,#root{min-height:100%;margin:0;background:#F7F5EC}html{min-height:100%;-webkit-text-size-adjust:100%}body{min-height:100vh;min-height:100dvh}body{overscroll-behavior-y:none;-webkit-tap-highlight-color:transparent}*{box-sizing:border-box}input,textarea,button{font:inherit}button{touch-action:manipulation}`}</style>
      </head>
      <body>{children}</body>
    </html>
  );
}
