'use client';

import { useCarGPT } from '../lib/useCarGPT';
import { LoginCard } from '../components/LoginCard';
import { VehiclesCard } from '../components/VehiclesCard';
import { DiagnosisPanel } from '../components/DiagnosisPanel';
import { FollowUps } from '../components/FollowUps';
import { ResultCard } from '../components/ResultCard';
import { VisionBanner } from '../components/VisionBanner';
import { ResultSkeleton } from '../components/ResultSkeleton';

export default function Home() {
  const app = useCarGPT();

  return (
    <main className="container">
      <header className="topbar">
        <div className="brand">
          <span className="dot" aria-hidden="true" />
          CarGPT
        </div>
        {app.token && (
          <button className="link" onClick={app.logout}>
            התנתק
          </button>
        )}
      </header>

      <p className="subtitle">
        תאר/י מה קורה עם הרכב — ונבין יחד מה כנראה הבעיה, כמה זה עולה, וכמה זה דחוף.
      </p>

      {app.authReady && !app.token && (
        <LoginCard
          phone={app.phone}
          setPhone={app.setPhone}
          code={app.code}
          setCode={app.setCode}
          otpSent={app.otpSent}
          devCode={app.devCode}
          onSend={app.sendOtp}
          onVerify={app.verify}
        />
      )}

      {app.token && (
        <VehiclesCard
          vehicles={app.vehicles}
          selected={app.selected}
          onSelect={app.setSelected}
          onAdd={app.addVehicle}
        />
      )}

      <DiagnosisPanel
        ref={app.fileRef}
        text={app.text}
        setText={app.setText}
        loading={app.loading}
        selected={app.selected}
        hasActivity={app.hasActivity}
        onStart={app.start}
        onPickImage={() => app.fileRef.current?.click()}
        onImage={app.diagnoseImage}
        onReset={app.reset}
      />

      <div aria-live="assertive" role="alert">
        {app.error && <p className="error-banner">{app.error}</p>}
      </div>

      {app.vision && <VisionBanner vision={app.vision} />}

      <FollowUps questions={app.questions} loading={app.loading} onAnswer={app.answer} />

      <div aria-live="polite">
        {app.loading && app.questions.length === 0 && <ResultSkeleton />}
        {app.result && <ResultCard result={app.result} />}
      </div>

      <footer className="footer">
        CarGPT נותן הערכה ראשונית בלבד ואינו תחליף לבדיקת מכונאי מוסמך.
      </footer>
    </main>
  );
}
