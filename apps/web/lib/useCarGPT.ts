'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ApiError,
  createVehicle,
  listVehicles,
  requestOtp,
  startDiagnosis,
  startDiagnosisFromImage,
  submitAnswers,
  verifyOtp,
  type DiagnosisResponse,
  type DiagnosisResult,
  type FollowUpQuestion,
  type Vehicle,
  type VisionSummary,
} from './api';

const TOKEN_KEY = 'cargpt_token';

function messageOf(err: unknown, fallback: string): string {
  return err instanceof ApiError ? err.message : fallback;
}

export function useCarGPT() {
  // Auth
  const [token, setToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devCode, setDevCode] = useState('');

  // Vehicles
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selected, setSelected] = useState<Vehicle | null>(null);

  // Diagnosis
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [diagnosisId, setDiagnosisId] = useState('');
  const [questions, setQuestions] = useState<FollowUpQuestion[]>([]);
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [vision, setVision] = useState<VisionSummary | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setToken(localStorage.getItem(TOKEN_KEY));
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (!token) return;
    listVehicles(token)
      .then(setVehicles)
      .catch(() => undefined);
  }, [token]);

  /* ---------- Auth ---------- */
  const sendOtp = useCallback(async () => {
    setError('');
    try {
      const res = await requestOtp(phone);
      setOtpSent(true);
      if (res.devCode) {
        setDevCode(res.devCode);
        setCode(res.devCode);
      }
    } catch (err) {
      setError(messageOf(err, 'מספר טלפון לא תקין (למשל 0501234567).'));
    }
  }, [phone]);

  const verify = useCallback(async () => {
    setError('');
    try {
      const t = await verifyOtp(phone, code);
      localStorage.setItem(TOKEN_KEY, t.accessToken);
      setToken(t.accessToken);
      setOtpSent(false);
      setDevCode('');
      setCode('');
    } catch (err) {
      setError(messageOf(err, 'קוד שגוי או שפג תוקפו.'));
    }
  }, [phone, code]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setVehicles([]);
    setSelected(null);
  }, []);

  const addVehicle = useCallback(
    async (make: string, model: string, year: string) => {
      if (!token || !make || !model || !year) return;
      try {
        const v = await createVehicle(token, { make, model, year: Number(year) });
        setVehicles((prev) => [...prev, v]);
        setSelected(v);
      } catch (err) {
        setError(messageOf(err, 'שגיאה בהוספת רכב.'));
      }
    },
    [token],
  );

  /* ---------- Diagnosis ---------- */
  const apply = useCallback((res: DiagnosisResponse) => {
    setDiagnosisId(res.diagnosisId);
    setVision(res.vision ?? null);
    if (res.status === 'complete' && res.result) {
      setResult(res.result);
      setQuestions([]);
    } else {
      setQuestions(res.followUpQuestions ?? []);
      setResult(null);
    }
  }, []);

  const beforeRun = useCallback(() => {
    setLoading(true);
    setError('');
    setResult(null);
    setQuestions([]);
    setVision(null);
  }, []);

  const start = useCallback(async () => {
    if (!text.trim()) return;
    beforeRun();
    try {
      apply(await startDiagnosis(text.trim(), selected ?? undefined));
    } catch (err) {
      setError(messageOf(err, 'שגיאה בחיבור לשרת. ודא/י שה-API רץ על פורט 3000.'));
    } finally {
      setLoading(false);
    }
  }, [text, selected, apply, beforeRun]);

  const diagnoseImage = useCallback(
    async (file: File) => {
      beforeRun();
      try {
        apply(await startDiagnosisFromImage(file));
      } catch (err) {
        setError(messageOf(err, 'שגיאה בניתוח התמונה.'));
      } finally {
        setLoading(false);
        if (fileRef.current) fileRef.current.value = '';
      }
    },
    [apply, beforeRun],
  );

  const answer = useCallback(
    async (questionId: string, value: string) => {
      setLoading(true);
      setError('');
      try {
        apply(await submitAnswers(diagnosisId, [{ questionId, answer: value }]));
      } catch (err) {
        setError(messageOf(err, 'שגיאה בשליחת התשובה.'));
      } finally {
        setLoading(false);
      }
    },
    [diagnosisId, apply],
  );

  const reset = useCallback(() => {
    setText('');
    setResult(null);
    setQuestions([]);
    setDiagnosisId('');
    setVision(null);
    setError('');
  }, []);

  const hasActivity = Boolean(result || questions.length > 0 || vision);

  return {
    // auth
    token,
    authReady,
    phone,
    setPhone,
    code,
    setCode,
    otpSent,
    devCode,
    sendOtp,
    verify,
    logout,
    // vehicles
    vehicles,
    selected,
    setSelected,
    addVehicle,
    // diagnosis
    text,
    setText,
    loading,
    error,
    questions,
    result,
    vision,
    fileRef,
    start,
    diagnoseImage,
    answer,
    reset,
    hasActivity,
  };
}
