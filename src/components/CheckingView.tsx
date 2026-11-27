"use client";

const STEPS = [
  { hi: "नोट सुना जा रहा है", en: "Listening to the note" },
  { hi: "एक claim ढूँढा जा रहा है", en: "Finding the one checkable claim" },
  { hi: "verified सोर्स चेक किए जा रहे हैं", en: "Checking verified sources" },
];

export function CheckingView({ step }: { step: number }) {
  return (
    <main className="shell checking">
      <div className="checking-card">
        <div className="spinner" aria-hidden="true" />
        <h1 className="checking-title">जाँच हो रही है…</h1>
        <p className="checking-sub">Checking the note against verified sources</p>

        <ol className="checking-steps">
          {STEPS.map((item, index) => {
            const state = index < step ? "done" : index === step ? "active" : "todo";
            return (
              <li key={item.en} className={`checking-step is-${state}`}>
                <span className="checking-dot" aria-hidden="true">
                  {state === "done" ? "✓" : index + 1}
                </span>
                <span className="checking-text">
                  <span className="checking-hi">{item.hi}</span>
                  <span className="checking-en">{item.en}</span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </main>
  );
}
