import React from "react";

export default function Footer() {
  return (
    <footer className="bg-inverse-surface text-inverse-on-surface px-gutter py-16 pb-24 md:pb-16 border-t border-outline-variant/10">
      <div className="max-w-container-max mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary text-on-primary flex items-center justify-center font-display-lg text-lg">M</div>
            <span className="font-headline-md">Medimz</span>
          </div>
          <p className="text-body-sm text-outline-variant max-w-[250px]">
            Your smart healthcare companion for a better, healthier tomorrow.
          </p>
        </div>

        <div>
          <h4 className="font-headline-md mb-4 text-inverse-primary">Company</h4>
          <ul className="space-y-2 text-body-sm text-outline-variant">
            <li><a href="#" className="hover:text-inverse-on-surface transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-inverse-on-surface transition-colors">Careers</a></li>
            <li><a href="#" className="hover:text-inverse-on-surface transition-colors">Press</a></li>
            <li><a href="#" className="hover:text-inverse-on-surface transition-colors">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-headline-md mb-4 text-inverse-primary">Legal</h4>
          <ul className="space-y-2 text-body-sm text-outline-variant">
            <li><a href="#" className="hover:text-inverse-on-surface transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-inverse-on-surface transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-inverse-on-surface transition-colors">HIPAA Compliance</a></li>
          </ul>
        </div>

        <div className="col-span-2 md:col-span-1">
          <h4 className="font-headline-md mb-4 text-inverse-primary">Connect</h4>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-surface-container-high/10 flex items-center justify-center hover:bg-surface-container-high/20 transition-colors">
              <span className="material-symbols-outlined text-[20px]">public</span>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-surface-container-high/10 flex items-center justify-center hover:bg-surface-container-high/20 transition-colors">
              <span className="material-symbols-outlined text-[20px]">mail</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-container-max mx-auto border-t border-outline-variant/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-label-sm text-outline-variant">
        <p>&copy; {new Date().getFullYear()} Medimz Inc. All rights reserved.</p>
        <p>Built with ❤️ in India.</p>
      </div>
    </footer>
  );
}
