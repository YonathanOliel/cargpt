'use client';

interface Props {
  phone: string;
  setPhone: (v: string) => void;
  code: string;
  setCode: (v: string) => void;
  otpSent: boolean;
  devCode: string;
  onSend: () => void;
  onVerify: () => void;
}

export function LoginCard({
  phone,
  setPhone,
  code,
  setCode,
  otpSent,
  devCode,
  onSend,
  onVerify,
}: Props) {
  return (
    <section className="card" aria-labelledby="login-title">
      <h2 id="login-title" className="section-title">
        התחברות
      </h2>

      {!otpSent ? (
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            onSend();
          }}
        >
          <label className="sr-only" htmlFor="phone">
            מספר טלפון
          </label>
          <input
            id="phone"
            className="input-phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="מספר טלפון (0501234567)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button className="btn" type="submit" disabled={!phone}>
            שלח קוד
          </button>
        </form>
      ) : (
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            onVerify();
          }}
        >
          <label className="sr-only" htmlFor="otp">
            קוד אימות
          </label>
          <input
            id="otp"
            className="input-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="קוד בן 6 ספרות"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          />
          <button className="btn" type="submit" disabled={code.length !== 6}>
            התחבר
          </button>
          {devCode && <span className="muted">קוד לפיתוח: {devCode}</span>}
        </form>
      )}

      <p className="muted mt-10">
        התחברות מאפשרת לשמור רכבים והיסטוריה. אפשר גם לאבחן בלי להתחבר.
      </p>
    </section>
  );
}
