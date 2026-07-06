import React from "react";

export default function HealthBlog() {
  const posts = [
    {
      title: "Understanding Hypertension: Practical Dietary Guidance",
      category: "Cardiology",
      readTime: "5 min read",
      summary: "Explore how simple adjustments in sodium intake and mineral ratios can optimize blood pressure control."
    },
    {
      title: "The Science of Sleep and Metabolic Regulation",
      category: "Wellness",
      readTime: "8 min read",
      summary: "Understand the biochemical pathways linking circadian rhythms to glucose tolerance and cellular health."
    },
    {
      title: "Deciphering Your Lab Reports: Key Biomarkers Explained",
      category: "Diagnostics",
      readTime: "6 min read",
      summary: "A clinician-reviewed guide to understanding lipid profiles, thyroid parameters, and metabolic indices."
    }
  ];

  return (
    <section id="blog" className="py-20 bg-surface-container-low/30 border-t border-outline-variant/20">
      <div className="max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="font-label-sm text-primary uppercase tracking-wider font-bold">Medical Journal</span>
          <h2 className="font-headline-lg text-3xl text-secondary font-bold">Health & Science Insights</h2>
          <p className="font-body-md text-on-surface-variant">Evidence-based clinical insights and wellness guidance written by our medical board.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {posts.map((post, idx) => (
            <div key={idx} className="p-6 bg-white border border-outline-variant/30 rounded-2xl space-y-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider">
                <span className="text-primary">{post.category}</span>
                <span className="text-outline">{post.readTime}</span>
              </div>
              <h3 className="font-headline-md text-base text-secondary font-bold leading-snug">{post.title}</h3>
              <p className="font-body-md text-xs text-on-surface-variant leading-relaxed">{post.summary}</p>
              <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                <span>Read Full Article</span>
                <span className="material-symbols-outlined text-xs">arrow_forward</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
