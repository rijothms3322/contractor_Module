import React from "react";
import { useApp } from "../../context/AppContext";

export const MedicineBox: React.FC<{
  onEditMed?: (medId: string, familyMemberId: string | null) => void;
}> = ({ onEditMed }) => {
  const { medicines, reminders, deleteMedicine } = useApp();

  return (
    <section className="glass-card rounded-2xl p-6 shadow-sm border border-outline-variant/20 space-y-4 animate-in fade-in duration-300">
      <div className="flex justify-between items-center pb-2 border-b border-b-outline-variant/20 mb-4">
        <h3 className="font-headline-md text-base text-secondary font-bold">Medicine Box Inventory</h3>
        <span className="font-label-sm text-xs text-outline font-bold">In Stock</span>
      </div>
      <div className="grid gap-3">
        {medicines.length === 0 ? (
          <p className="text-xs text-on-surface-variant italic text-center py-4">No medications configured in inventory.</p>
        ) : (
          medicines.map((med) => {
            // Find who this medicine is registered to by looking up its reminders
            const matchingRem = reminders.find(r => r.medicineId === med.id);
            const recipient = matchingRem ? (matchingRem.recipientNickname || "Myself") : "Myself";
            const isMe = recipient === "Myself";

            return (
              <div
                key={med.id}
                onClick={() => onEditMed?.(med.id, matchingRem?.familyMemberId || null)}
                className="flex justify-between items-center bg-surface-container-low hover:bg-surface-container/60 hover:border-primary/30 cursor-pointer rounded-xl p-3 border border-outline-variant/10 transition-all duration-200 group active:scale-[0.99]"
                title="Click to Edit Medication"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="material-symbols-outlined text-base text-outline group-hover:text-primary transition-colors flex-shrink-0">edit</span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-label-md text-sm text-secondary font-bold group-hover:text-primary transition-colors truncate">{med.name}</p>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider flex-shrink-0 ${
                        isMe ? "bg-orange-50 text-orange-700" : "bg-blue-50 text-blue-700"
                      }`}>
                        👤 {recipient}
                      </span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-0.5 truncate">{med.dosage} • {med.instructions}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-body-md text-sm text-primary font-bold">{med.stockCount !== undefined ? med.stockCount : 30} left</p>
                    {med.stockCount !== undefined && med.stockCount <= 6 && (
                      <span className="text-[8px] text-red-500 font-bold uppercase tracking-wider block mt-0.5 animate-pulse">Refill Needed</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // Avoid triggering stock edit modal
                      if (confirm(`Are you sure you want to delete ${med.name} from inventory?`)) {
                        deleteMedicine(med.id);
                      }
                    }}
                    className="w-7 h-7 rounded-full hover:bg-red-50 flex items-center justify-center text-outline hover:text-red-500 transition-colors ml-1"
                    title="Delete Medicine"
                  >
                    <span className="material-symbols-outlined text-xs">delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
