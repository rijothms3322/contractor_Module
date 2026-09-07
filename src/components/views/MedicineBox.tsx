import React from "react";
import { useApp } from "../../context/AppContext";

interface MedicineBoxProps {
  onEditMed?: (medId: string, familyMemberId: string | null) => void;
  onDeleteMed?: (medId: string) => void;
  loadingDelete?: string | null;
}

export const MedicineBox: React.FC<MedicineBoxProps> = ({
  onEditMed,
  onDeleteMed,
  loadingDelete,
}) => {
  const { medicines, reminders } = useApp();
  return (
    <section className="glass-card w-full min-w-0 max-w-full rounded-2xl p-4 sm:p-6 shadow-sm border border-outline-variant/20 space-y-4 overflow-hidden animate-in fade-in duration-300">
      <div className="flex justify-between items-center pb-2 border-b border-b-outline-variant/20 mb-4 min-w-0">
        <h3 className="font-headline-md text-base text-secondary font-bold truncate">
          Medicine Box Inventory
        </h3>

        <span className="font-label-sm text-xs text-outline font-bold flex-shrink-0 ml-3">
          In Stock
        </span>
      </div>

      <div className="grid gap-3 min-w-0">
        {medicines.length === 0 ? (
          <p className="text-xs text-on-surface-variant italic text-center py-4">
            No medications configured in inventory.
          </p>
        ) : (
          medicines.map((med) => {
            const matchingRem = reminders.find(
              (r) => r.medicineId === med.id
            );

            const recipient =
              matchingRem?.recipientNickname || "Myself";

            const isMe = recipient === "Myself";

            return (
              <div
                key={med.id}
                onClick={() =>
                  onEditMed?.(
                    med.id,
                    matchingRem?.familyMemberId || null
                  )
                }
                className="
              grid
              grid-cols-[minmax(0,1fr)_auto]
              items-center
              gap-2
              w-full
              min-w-0
              bg-surface-container-low
              hover:bg-surface-container/60
              hover:border-primary/30
              cursor-pointer
              rounded-xl
              p-3
              border
              border-outline-variant/10
              transition-all
              duration-200
              group
              active:scale-[0.99]
            "
                title="Click to Edit Medication"
              >
                {/* LEFT CONTENT */}
                <div className="flex items-center gap-2.5 min-w-0 overflow-hidden">
                  <span className="material-symbols-outlined text-base text-outline group-hover:text-primary transition-colors flex-shrink-0">
                    edit
                  </span>

                  <div className="min-w-0 flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className="font-label-md text-sm text-secondary font-bold group-hover:text-primary transition-colors truncate min-w-0">
                        {med.name}
                      </p>

                      <span
                        className={`
                      text-[9px]
                      px-1.5
                      py-0.5
                      rounded
                      font-bold
                      uppercase
                      tracking-wider
                      flex-shrink-0
                      whitespace-nowrap
                      ${isMe
                            ? "bg-orange-50 text-orange-700"
                            : "bg-blue-50 text-blue-700"
                          }
                    `}
                      >
                        👤 {recipient}
                      </span>
                    </div>

                    {med.dosage && (
                      <p className="text-xs text-on-surface-variant mt-0.5 truncate">
                        • {med.dosage}
                      </p>
                    )}

                    <p className="text-xs text-on-surface-variant mt-0.5 truncate">
                      • {med.instructions}
                    </p>
                  </div>
                </div>

                {/* RIGHT CONTENT */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="text-right whitespace-nowrap">
                    <p className="font-body-md text-sm text-primary font-bold">
                      {med.stockCount !== undefined
                        ? med.stockCount
                        : 30}{" "}
                      left
                    </p>

                    {med.stockCount !== undefined &&
                      med.stockCount <= 6 && (
                        <span className="text-[8px] text-red-500 font-bold uppercase tracking-wider block mt-0.5 animate-pulse">
                          Refill Needed
                        </span>
                      )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMed?.(med.id);
                    }}
                    disabled={loadingDelete === med.id}
                    className="
                  w-7
                  h-7
                  rounded-full
                  hover:bg-red-50
                  flex
                  items-center
                  justify-center
                  text-outline
                  hover:text-red-500
                  transition-colors
                  flex-shrink-0
                  disabled:opacity-50
                "
                    title="Delete Medicine"
                  >
                    {loadingDelete === med.id ? (
                      <span className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <span className="material-symbols-outlined text-xs">
                        delete
                      </span>
                    )}
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
