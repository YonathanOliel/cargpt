'use client';

import { useState } from 'react';
import type { Vehicle } from '../lib/api';

interface Props {
  vehicles: Vehicle[];
  selected: Vehicle | null;
  onSelect: (v: Vehicle) => void;
  onAdd: (make: string, model: string, year: string) => void;
}

export function VehiclesCard({ vehicles, selected, onSelect, onAdd }: Props) {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onAdd(make, model, year);
    setMake('');
    setModel('');
    setYear('');
  }

  return (
    <section className="card" aria-labelledby="vehicles-title">
      <h2 id="vehicles-title" className="section-title">
        הרכבים שלי
      </h2>

      <div className="row mb-10" role="group" aria-label="בחירת רכב">
        {vehicles.map((v) => (
          <button
            key={v.id}
            type="button"
            className={`veh-chip ${selected?.id === v.id ? 'active' : ''}`}
            aria-pressed={selected?.id === v.id}
            onClick={() => onSelect(v)}
          >
            {v.make} {v.model} '{String(v.year).slice(-2)}
          </button>
        ))}
        {vehicles.length === 0 && (
          <span className="muted">עדיין אין רכבים — הוסף/י אחד:</span>
        )}
      </div>

      <form className="row" onSubmit={submit}>
        <label className="sr-only" htmlFor="v-make">
          יצרן
        </label>
        <input
          id="v-make"
          className="input-sm"
          placeholder="יצרן"
          value={make}
          onChange={(e) => setMake(e.target.value)}
        />
        <label className="sr-only" htmlFor="v-model">
          דגם
        </label>
        <input
          id="v-model"
          className="input-sm"
          placeholder="דגם"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
        <label className="sr-only" htmlFor="v-year">
          שנה
        </label>
        <input
          id="v-year"
          className="input-xs"
          type="text"
          inputMode="numeric"
          maxLength={4}
          placeholder="שנה"
          value={year}
          onChange={(e) => setYear(e.target.value.replace(/\D/g, ''))}
        />
        <button className="btn" type="submit" disabled={!make || !model || year.length !== 4}>
          הוסף
        </button>
      </form>
    </section>
  );
}
