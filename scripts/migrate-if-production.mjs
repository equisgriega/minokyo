// Veritabanı migration'larını YALNIZCA Vercel'in canlı (production) derlemesinde uygular.
// Önizleme (preview) derlemeleri ve yerel `npm run build` veritabanına dokunmaz.
import { execSync } from "node:child_process";

const env = process.env.VERCEL_ENV;
if (env === "production") {
  console.log("[migrate] Canlı derleme → prisma migrate deploy");
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
} else {
  console.log(`[migrate] Atlandı (VERCEL_ENV=${env ?? "yerel"}) — migration yalnızca canlı derlemede uygulanır.`);
}
