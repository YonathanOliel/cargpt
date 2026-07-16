# CarGPT

עוזר AI לתחזוקת רכב — מודל B2B2C (נהגים + מוסכים). שוק ראשון: ישראל.

מונורפו מבוסס npm workspaces.

## מבנה
```
apps/
  api/       Backend — NestJS (Clean Architecture, provider-agnostic AI)
  web/       Frontend — Next.js 14 (App Router, RTL, Dark, נגיש)
packages/
  shared/    חוזי דומיין (types) משותפים ל-API ול-clients
docs/        PRD, UX/Design System, Architecture, Roadmap
```

## דרישות
- Node >= 20 (נבדק על 24)
- npm >= 10

## התחלה
```powershell
npm install
npm run build                        # בונה shared + api
npm test                             # בדיקות (jest)

# הרצה חיה (שני טרמינלים)
npm run start:dev --workspace apps/api   # API  -> http://localhost:3000/v1
npm run dev       --workspace apps/web   # Web  -> http://localhost:3001
```

- בדיקת בריאות: `GET http://localhost:3000/v1/health`
- בפיתוח (ללא ספק SMS) קוד ה-OTP נרשם ללוג של ה-API ומוחזר בשדה `devCode`.

## סביבה (משתני env)
ראה `.env.example`. משתנים עיקריים:
- `JWT_SECRET` — חובה בחוזק >= 32 תווים ב-production (האפליקציה לא תעלה אחרת).
- `WEB_ORIGIN` — origin מורשה ל-CORS (ברירת מחדל `http://localhost:3001`).
- `LLM_PROVIDER` / `VISION_PROVIDER` — `mock` (ברירת מחדל) או ספק אמיתי בעתיד.

## ארכיטקטורה
- **AI Abstraction Layer** — `LlmProvider` / `VisionProvider` מאחורי interface; החלפת ספק ללא שינוי לוגיקה.
- **אבחון הסתברותי** עם safety guardrails: דחיפות משוקללת לפי הסתברות; תלונות בטיחות (בלמים/היגוי/צמיגים/חום) לא יורדות מתחת ל-yellow.
- **אבטחה**: Helmet, CORS מוגבל, rate limiting (throttler), ולידציית env בעליית השרת, JWT+RBAC, ולידציה ב-DTO.

## סטטוס
- Sprint 1 (Foundation) + הקשחת production: AI abstraction, אבחון הסתברותי, Auth (OTP+JWT+RBAC), Vehicles, Vision (mock), אתר web מלא ונגיש.
- אחסון נוכחי in-memory. הצעד הבא: Postgres+pgvector, ספקי AI אמיתיים, מנוע מחיר, מוסכים+לידים.

מסמכי תכנון מלאים תחת `docs/`.
