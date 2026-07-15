import { OtpStore } from './otp.store';

describe('OtpStore', () => {
  it('verifies a correct code once', () => {
    const store = new OtpStore();
    const code = store.issue('0501234567');
    expect(store.verify('0501234567', code)).toBe(true);
    // Consumed — second attempt fails.
    expect(store.verify('0501234567', code)).toBe(false);
  });

  it('rejects a wrong code', () => {
    const store = new OtpStore();
    store.issue('0501234567');
    expect(store.verify('0501234567', '000000')).toBe(false);
  });

  it('rejects when no code was issued', () => {
    const store = new OtpStore();
    expect(store.verify('0509999999', '123456')).toBe(false);
  });

  it('locks out after too many attempts', () => {
    const store = new OtpStore();
    const code = store.issue('0501234567');
    for (let i = 0; i < 5; i++) store.verify('0501234567', '111111');
    // Even the correct code is now rejected.
    expect(store.verify('0501234567', code)).toBe(false);
  });
});
