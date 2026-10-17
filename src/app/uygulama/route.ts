// Mobil uygulamanın giriş adresi (capacitor.config.ts → server.appStartPath).
// Uygulamayı tanıyan çerezi bırakır ve mağazaya geçer. Capacitor sayfa isteklerini kendi HTTP
// istemcisiyle yaptığı için kullanıcı ajanına güvenilemez; çerez ise her istekte taşınır.
// Yönlendirme istemci tarafında yapılır: sunucu yönlendirmesinde (302) çerez kaybolurdu.
export const dynamic = "force-dynamic";

export function GET() {
  const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>minokyo</title><style>html,body{margin:0;height:100%;background:#faf8f5}</style></head>
<body><script>location.replace("/")</script></body></html>`;
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Set-Cookie": `mnk_app=1; Path=/; Max-Age=31536000; SameSite=Lax; Secure; HttpOnly`,
    },
  });
}
