"use client";

import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Booking } from "../../lib/mockData";

export const AdminView: React.FC = () => {
  const {
    bookings,
    updateBookingStatus,
    assignPhlebotomist,
    reminders,
    familyMembers
  } = useApp();

  const [activeBookingId, setActiveBookingId] = useState<string | null>(null);
  const [phlebName, setPhlebName] = useState("");
  const [phlebPhone, setPhlebPhone] = useState("");

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBookingId || !phlebName || !phlebPhone) return;

    assignPhlebotomist(activeBookingId, phlebName, phlebPhone);
    setPhlebName("");
    setPhlebPhone("");
    setActiveBookingId(null);
  };

  // KPIs
  const totalOrders = bookings.length;
  const pendingOrders = bookings.filter((b) => b.status === "pending").length;
  const transitOrders = bookings.filter(
    (b) => b.status === "out_for_collection" || b.status === "assigned"
  ).length;
  const completedOrders = bookings.filter((b) => b.status === "completed").length;

  // Reminders metrics
  const totalRem = reminders.length;
  const takenRem = reminders.filter((r) => r.status === "taken").length;
  const averageAdherence = totalRem > 0 ? Math.round((takenRem / totalRem) * 100) : 85;

  return (
    <div className="space-y-stack-lg animate-in fade-in duration-300 pb-16">
      
      {/* 1. Admin KPI Header row */}
      <section className="bg-gradient-to-r from-secondary to-secondary-fixed-variant p-6 rounded-2xl text-white shadow-md space-y-4">
        <div>
          <span className="font-label-sm text-[10px] text-secondary-container font-bold uppercase tracking-wider block">
            Medimz Enterprise
          </span>
          <h2 className="font-headline-md text-xl font-bold">Operational Control Centre</h2>
          <p className="text-secondary-fixed/80 text-xs mt-1">
            Pune Phlebotomy Logistics & Patients Compliance Audit
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-white/10 rounded-xl">
            <span className="text-[9px] uppercase font-bold text-secondary-container block">Active Bookings</span>
            <span className="text-xl font-bold block mt-0.5">{totalOrders}</span>
          </div>

          <div className="p-3 bg-white/10 rounded-xl">
            <span className="text-[9px] uppercase font-bold text-secondary-container block">Pending Dispatch</span>
            <span className="text-xl font-bold block mt-0.5 text-primary-container">{pendingOrders}</span>
          </div>

          <div className="p-3 bg-white/10 rounded-xl">
            <span className="text-[9px] uppercase font-bold text-secondary-container block">In Transit</span>
            <span className="text-xl font-bold block mt-0.5">{transitOrders}</span>
          </div>

          <div className="p-3 bg-white/10 rounded-xl">
            <span className="text-[9px] uppercase font-bold text-secondary-container block">Avg Compliance</span>
            <span className="text-xl font-bold block mt-0.5 text-tertiary-fixed">{averageAdherence}%</span>
          </div>
        </div>
      </section>

      {/* 2. Logistics booking allocation manager table */}
      <section className="space-y-3">
        <h3 className="font-headline-md text-base text-secondary font-bold">Diagnostics Collections & Workflows</h3>
        
        {bookings.length === 0 ? (
          <div className="p-8 text-center glass-card rounded-2xl border border-outline-variant/20 flex flex-col items-center justify-center gap-2">
            <span className="material-symbols-outlined text-4xl text-outline-variant">assignment_late</span>
            <p className="font-label-md text-sm text-on-surface-variant">No client lab bookings recorded in the system.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="p-5 glass-card rounded-2xl border border-outline-variant/20 space-y-4 hover:border-secondary/25 transition-all shadow-sm"
              >
                {/* Header detail */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-label-md text-sm text-secondary font-bold">{booking.id}</span>
                      <span className="bg-surface-container text-outline text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        {booking.timeSlot.split(" - ")[0]}
                      </span>
                    </div>
                    <h4 className="font-label-md text-xs text-on-surface font-bold mt-1">
                      {booking.testNames.join(", ")}
                    </h4>
                    <p className="font-body-md text-[10px] text-on-surface-variant mt-0.5 leading-snug">
                      📍 {booking.address.line1}, {booking.address.area}, {booking.address.city}
                    </p>
                  </div>

                  {/* Status workflow selector */}
                  <select
                    value={booking.status}
                    onChange={(e) => updateBookingStatus(booking.id, e.target.value as Booking["status"])}
                    className="px-3 py-1.5 bg-surface-container-low border border-outline-variant/30 rounded-xl font-label-sm text-[10px] uppercase font-bold text-secondary focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {booking.type === "medicine" ? (
                      <>
                        <option value="pending">Pending Dispatch</option>
                        <option value="assigned">Rider Assigned</option>
                        <option value="out_for_collection">Out for Delivery</option>
                        <option value="collected">Picked Up</option>
                        <option value="processing">In Transit</option>
                        <option value="completed">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </>
                    ) : (
                      <>
                        <option value="pending">Pending Collection</option>
                        <option value="assigned">Phleb Assigned</option>
                        <option value="out_for_collection">Out for Collection</option>
                        <option value="collected">Samples Collected</option>
                        <option value="processing">Processing in Lab</option>
                        <option value="completed">Completed (Report Ready)</option>
                        <option value="cancelled">Cancelled</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Phlebotomist/Rider Assignment details */}
                <div className="h-px bg-outline-variant/20" />
                
                <div className="flex flex-col md:flex-row justify-between items-center gap-3">
                  <div className="flex gap-2.5 items-center">
                    <div className="w-8 h-8 rounded-full bg-secondary-container/20 text-secondary flex items-center justify-center">
                      <span className="material-symbols-outlined text-base">
                        {booking.type === "medicine" ? "directions_bike" : "directions_car"}
                      </span>
                    </div>
                    <div className="text-left">
                      {booking.phlebotomistName ? (
                        <>
                          <span className="font-label-md text-xs text-secondary font-bold block leading-none">
                            {booking.phlebotomistName}
                          </span>
                          <span className="font-body-md text-[9px] text-outline mt-0.5 block">
                            📞 {booking.phlebotomistPhone}
                          </span>
                        </>
                      ) : (
                        <span className="font-body-md text-xs text-outline italic">
                          {booking.type === "medicine" ? "No delivery rider allocated yet." : "No phlebotomist allocated yet."}
                        </span>
                      )}
                    </div>
                  </div>

                  {!booking.phlebotomistName ? (
                    <button
                      onClick={() => setActiveBookingId(booking.id)}
                      className="px-4 py-2 bg-primary text-on-primary font-bold rounded-xl text-xs hover:bg-opacity-95 active:scale-95 transition-all shadow-sm flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">person_add</span>
                      <span>{booking.type === "medicine" ? "Allocate Rider" : "Allocate Phleb"}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveBookingId(booking.id)}
                      className="px-3.5 py-1.5 bg-surface-container text-on-surface font-bold rounded-xl text-xs hover:bg-surface-container-high transition-colors"
                    >
                      Re-assign
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </section>

      {/* 3. Patients Adherence Audit Logs */}
      <section className="space-y-3">
        <h3 className="font-headline-md text-base text-secondary font-bold">Patient adherence audit</h3>
        
        <div className="glass-card rounded-2xl p-5 border border-outline-variant/20 space-y-4 shadow-sm">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-outline-variant/20">
            <span className="font-label-md text-secondary font-bold">Synced Family Log</span>
            <span className="font-body-md text-outline">Total active daily schedules</span>
          </div>

          <div className="space-y-3.5">
            {/* User Adherence */}
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-label-md text-on-surface font-bold w-24">Sarah (Self)</span>
              <div className="flex-grow h-2 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${averageAdherence}%` }} />
              </div>
              <span className="font-label-sm font-bold text-secondary w-8 text-right">{averageAdherence}%</span>
            </div>

            {/* Family Members Adherence */}
            {familyMembers.map((fam) => (
              <div key={fam.id} className="flex items-center justify-between gap-3 text-xs">
                <span className="font-label-md text-on-surface font-bold w-24">{fam.name}</span>
                <div className="flex-grow h-2 bg-surface-container rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary rounded-full" style={{ width: `${fam.adherenceRate || 100}%` }} />
                </div>
                <span className="font-label-sm font-bold text-secondary w-8 text-right">{fam.adherenceRate || 100}%</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. PHLEBOTOMIST/RIDER ALLOCATION DIALOG */}
      {activeBookingId && (() => {
        const activeBooking = bookings.find(b => b.id === activeBookingId);
        const isMedBooking = activeBooking?.type === "medicine";
        return (
          <div className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-[340px] bg-white rounded-3xl p-6 shadow-2xl border border-outline-variant/30 flex flex-col animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-headline-md text-base text-secondary font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">person_add</span>
                  <span>{isMedBooking ? "Assign Delivery Rider" : "Assign Phlebotomist"}</span>
                </h3>
                <button
                  onClick={() => setActiveBookingId(null)}
                  className="w-8 h-8 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center focus:outline-none"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <form onSubmit={handleAssignSubmit} className="space-y-3">
                <div className="space-y-1">
                  <label className="block font-label-md text-xs text-on-surface-variant font-bold">
                    {isMedBooking ? "Rider Name" : "Phlebotomist Name"}
                  </label>
                  <select
                    required
                    value={phlebName}
                    onChange={(e) => {
                      setPhlebName(e.target.value);
                      setPhlebPhone(e.target.value === "Ramesh Delivery Rider" || e.target.value === "Dr. Rajesh Kumar" ? "+91 98765 43210" : "+91 91234 56789");
                    }}
                    className="w-full px-3 py-2 bg-surface-container/40 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none"
                  >
                    <option value="">{isMedBooking ? "Select Rider..." : "Select Technician..."}</option>
                    {isMedBooking ? (
                      <>
                        <option value="Ramesh Delivery Rider">Ramesh Delivery Rider (Fast)</option>
                        <option value="Sanjay Kumar">Sanjay Kumar (Standard)</option>
                      </>
                    ) : (
                      <>
                        <option value="Dr. Rajesh Kumar">Dr. Rajesh Kumar (Highly Rated)</option>
                        <option value="Aman Sharma">Aman Sharma (Active Yerwada)</option>
                        <option value="Rahul Gupta">Rahul Gupta (Active KP)</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-label-md text-xs text-on-surface-variant font-bold">Contact Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 XXXXX XXXXX"
                    value={phlebPhone}
                    onChange={(e) => setPhlebPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-surface-container/40 border border-outline-variant/40 rounded-xl font-body-md text-xs text-on-surface focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary text-on-primary font-bold rounded-xl text-xs hover:opacity-95 active:scale-95 transition-all shadow-md mt-2"
                >
                  Assign & Dispatch Alert
                </button>
              </form>
            </div>
          </div>
        );
      })()}

    </div>
  );
};
