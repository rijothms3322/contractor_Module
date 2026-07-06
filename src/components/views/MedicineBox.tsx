import React from "react";

// Mock data for medicine prescriptions
const mockPrescriptions = [
  { id: 1, name: "Atorvastatin", remaining: 12, dosage: "10mg" },
  { id: 2, name: "Metformin", remaining: 30, dosage: "500mg" },
  { id: 3, name: "Lisinopril", remaining: 5, dosage: "20mg" },
];

export const MedicineBox: React.FC<{ onOrder?: () => void }> = ({ onOrder }) => {
  return (
    <section className="glass-card rounded-2xl p-6 shadow-sm border border-outline-variant/20 space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20 mb-4">
        <h3 className="font-headline-md text-base text-secondary font-bold">Medicine Box</h3>
        <span className="font-label-sm text-xs text-outline font-bold">Today</span>
      </div>
      <div className="grid gap-3">
        {mockPrescriptions.map((rx) => (
          <div key={rx.id} className="flex justify-between items-center bg-surface-container-low rounded-xl p-3 border border-outline-variant/10">
            <div>
              <p className="font-label-md text-sm text-secondary font-bold">{rx.name}</p>
              <p className="text-xs text-on-surface-variant">{rx.dosage}</p>
            </div>
            <p className="font-body-md text-sm text-primary font-bold">{rx.remaining} left</p>
          </div>
        ))}
      </div>
      {onOrder && (
        <button
          onClick={onOrder}
          className="w-full py-2.5 bg-primary/10 hover:bg-primary/20 text-primary font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
        >
          <span className="material-symbols-outlined text-sm font-bold">shopping_cart</span>
          <span>Order New Medicine</span>
        </button>
      )}
    </section>
  );
};
