import React from "react";

export default function Roadmap() {
  return (
    <section id="roadmap" className="px-gutter py-24 bg-background border-t border-outline-variant/10">
      <div className="max-w-container-max mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display-lg text-3xl md:text-5xl mb-4">The Future of Medimz</h2>
          <p className="text-body-lg text-on-surface-variant max-w-[600px] mx-auto">
            We're building an end-to-end healthcare ecosystem. Here's what is launching soon in Early Access.
          </p>
        </div>

        <div className="relative border-l-2 border-surface-container-high ml-4 md:ml-[50%] md:-translate-x-[1px] space-y-12 pb-12">
          
          {/* Phase 1 */}
          <div className="relative pl-8 md:pl-0 md:w-1/2 md:-ml-0">
            <div className="absolute left-[-5px] top-0 md:right-[-5px] md:left-auto w-3 h-3 rounded-full bg-primary ring-4 ring-primary-container"></div>
            <div className="md:pr-12 md:text-right">
              <div className="text-label-sm font-label-md text-primary mb-1">Phase 1 (Live in Beta)</div>
              <h3 className="font-headline-lg text-on-surface mb-2">Smart Reminders & Insights</h3>
              <p className="text-body-md text-on-surface-variant">Intelligent medication tracking, AI health nudges, and basic lab report analysis.</p>
            </div>
          </div>

          {/* Phase 2 */}
          <div className="relative pl-8 md:pl-0 md:w-1/2 md:ml-[50%]">
            <div className="absolute left-[-5px] top-0 w-3 h-3 rounded-full bg-secondary ring-4 ring-secondary-container"></div>
            <div className="md:pl-12">
              <div className="text-label-sm font-label-md text-secondary mb-1">Phase 2 (Coming Soon)</div>
              <h3 className="font-headline-lg text-on-surface mb-2">Dark Pharmacy Delivery</h3>
              <p className="text-body-md text-on-surface-variant">10-minute medicine delivery through our network of optimized dark stores. Auto-refills before you run out.</p>
            </div>
          </div>

          {/* Phase 3 */}
          <div className="relative pl-8 md:pl-0 md:w-1/2 md:-ml-0">
            <div className="absolute left-[-5px] top-0 md:right-[-5px] md:left-auto w-3 h-3 rounded-full bg-outline ring-4 ring-surface-container-high"></div>
            <div className="md:pr-12 md:text-right opacity-60">
              <div className="text-label-sm font-label-md text-on-surface-variant mb-1">Phase 3</div>
              <h3 className="font-headline-lg text-on-surface mb-2">AI Diagnostic Chatbot</h3>
              <p className="text-body-md text-on-surface-variant">A conversational AI agent that can pre-diagnose symptoms and immediately connect you to the right specialist.</p>
            </div>
          </div>

          {/* Phase 4 */}
          <div className="relative pl-8 md:pl-0 md:w-1/2 md:ml-[50%]">
            <div className="absolute left-[-5px] top-0 w-3 h-3 rounded-full bg-outline ring-4 ring-surface-container-high"></div>
            <div className="md:pl-12 opacity-60">
              <div className="text-label-sm font-label-md text-on-surface-variant mb-1">Phase 4</div>
              <h3 className="font-headline-lg text-on-surface mb-2">Teleconsultations</h3>
              <p className="text-body-md text-on-surface-variant">Instant 1-on-1 video consultations with verified doctors seamlessly integrated with your health records.</p>
            </div>
          </div>

        </div>

        <div className="mt-16 text-center">
          <div className="glass-card max-w-[600px] mx-auto rounded-[32px] p-8 border border-primary/20">
            <h3 className="font-headline-lg mb-4">Be the first to experience the future.</h3>
            <p className="text-body-md text-on-surface-variant mb-6">Join the waitlist to get early access to our Dark Pharmacy delivery and AI features.</p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-[400px] mx-auto">
              <input type="email" placeholder="Enter your email address" className="flex-grow bg-surface border border-outline-variant/30 rounded-full px-6 py-3 text-body-md focus:outline-none focus:border-primary" />
              <button className="bg-primary text-on-primary px-8 py-3 rounded-full font-label-md hover:bg-primary/90 transition-colors whitespace-nowrap">
                Join Waitlist
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
