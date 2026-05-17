import React from 'react';
import { cvData } from '@/data/cv';
import { MapPin, Mail, ExternalLink, Download } from 'lucide-react';
import Link from 'next/link';

export default function PortfolioPage() {
  const { header, summary, skills, languages } = cvData;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden selection:bg-primary/30">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none gradient-mesh opacity-50 dark:opacity-100 mix-blend-screen" />
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-primary/10 via-background/50 to-background pointer-events-none z-0" />
      
      <main className="relative z-10 container mx-auto px-6 py-20 max-w-5xl">
        {/* Nav / Top Bar */}
        <nav className="flex justify-between items-center mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          <Link href="/" className="text-xl font-bold tracking-tighter hover:text-primary transition-colors flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg">
              {header.name.charAt(0)}
            </span>
            {header.name}
          </Link>
          <div className="flex items-center gap-4">
            <a href={`mailto:${header.email}`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Contact
            </a>
            <a href="/Utkarsh_Raj_CV.pdf" target="_blank" rel="noopener noreferrer" className="text-sm font-medium bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-full transition-colors flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download CV
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="mb-24 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150 fill-mode-both">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {header.label}
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-balance leading-tight">
              Engineering systems <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                at scale.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl leading-relaxed text-balance">
              {summary}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-6 pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium bg-secondary/10 px-4 py-2 rounded-full border border-secondary/20">
              <MapPin className="h-4 w-4 text-secondary" />
              {header.location}
            </div>
            <div className="flex items-center gap-3">
              {header.links.github && (
                <a href={header.links.github} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-muted-foreground hover:text-foreground" aria-label="GitHub">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                    <path d="M9 18c-4.51 2-5-2-7-2" />
                  </svg>
                </a>
              )}
              {header.links.linkedin && (
                <a href={header.links.linkedin} target="_blank" rel="noopener noreferrer" className="p-3 rounded-full hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-muted-foreground hover:text-foreground" aria-label="LinkedIn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect width="4" height="12" x="2" y="9" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="md:col-span-2 space-y-12">
            
            {/* Skills Section */}
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-primary">#</span> Technical Arsenal
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {skills.map((skillGroup, idx) => (
                  <div key={idx} className="glass-card group hover:-translate-y-1">
                    <h3 className="font-semibold text-lg mb-4 text-foreground/90 group-hover:text-primary transition-colors">
                      {skillGroup.group}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {skillGroup.items.map((item, i) => (
                        <span key={i} className="px-3 py-1.5 text-sm rounded-md bg-background/50 border border-border/50 text-muted-foreground">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Empty States for Future Sections */}
            <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <span className="text-secondary">#</span> Experience & Projects
              </h2>
              <div className="glass-card flex flex-col items-center justify-center py-12 text-center border-dashed">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <ExternalLink className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-medium mb-2">Building in progress...</h3>
                <p className="text-muted-foreground max-w-sm text-balance">
                  More detailed projects and work experience are currently being integrated into this structured portfolio.
                </p>
              </div>
            </section>

          </div>

          {/* Sidebar Column */}
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000 delay-500 fill-mode-both">
            {/* Open To */}
            <div className="glass-card">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Open To Opportunities</h3>
              <ul className="space-y-3">
                {header.openTo.map((loc, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-sm font-medium">
                    <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                    {loc}
                  </li>
                ))}
              </ul>
            </div>

            {/* Languages */}
            <div className="glass-card">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Languages</h3>
              <div className="space-y-4">
                {languages.map((lang, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-sm font-medium">
                      <span>{lang.name}</span>
                      <span className="text-muted-foreground">{lang.level}</span>
                    </div>
                    <div className="h-1.5 w-full bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary/60 rounded-full" 
                        style={{ 
                          width: lang.level === 'C1' || lang.level === 'Native' ? '90%' : 
                                 lang.level === 'B2' ? '70%' : 
                                 lang.level === 'B1' ? '50%' : '25%' 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
