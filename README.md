# CarGPT

עוזר AI לתחזוקת רכב — מודל B2B2C (נהגים + מוסכים). שוק ראשון: ישראל.

מונורפו מבוסס npm workspaces.

## מבנה
```
apps/
  api/       Backend — NestJS (Clean Architecture, provider-agnostic AI)
packages/
  shared/    חוזי דומיין (types) משותפים ל-API ו-clients
docs/        PRD, UX/Design System, Architecture, Roadmap
```

## דרישות
- Node >= 20 (נבדק על 24)
- npm >= 10

## התחלה
```powershell
npm install
npm run build        # בונה shared + api
npm test --workspace apps/api
npm run start:dev --workspace apps/api
```

השרת עולה כברירת מחדל על http://localhost:3000. בדיקה: `GET /v1/health`.

## סטטוס
Sprint 1 (Foundation): שכבת AI abstraction + מנוע אבחון הסתברותי (mock provider), חוזי דומיין, health. חיבור Postgres/pgvector וספקי AI אמיתיים — הצעד הבא.

מסמכי תכנון מלאים תחת `docs/`.
