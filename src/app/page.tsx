"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Shield, GraduationCap, Users, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground relative flex flex-col font-sans overflow-x-hidden">
      
      {/* Navbar */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-border/40 bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="font-display font-black text-2xl tracking-tighter uppercase">CampusConnect</span>
        </div>
        <div>
          <Link href="/login" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Login
          </Link>
        </div>
      </header>

      <main className="flex-1 relative z-10 flex flex-col">
        {/* Split Hero Section */}
        <div className="flex flex-col lg:flex-row border-b border-border/40 bg-white">
          
          {/* LEFT: Photography & Text (65%) */}
          <div className="lg:w-[65%] relative flex flex-col justify-end border-b lg:border-b-0 lg:border-r border-border/40 bg-muted/20 min-h-[50vh] overflow-hidden">
            {/* Real photography background, light and clean */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')" }}
            />
            {/* Light gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
            
            <div className="relative z-10 p-6 lg:p-16 pt-32">
              <motion.h1 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="font-display font-black text-[12vw] lg:text-[9vw] leading-[0.85] tracking-tighter uppercase text-foreground"
              >
                UNIFY<br />
                YOUR<br />
                <span className="text-primary">CAMPUS.</span>
              </motion.h1>
            </div>
          </div>

          {/* RIGHT: CTA Column (35%) */}
          <div className="lg:w-[35%] flex flex-col bg-white">
            <div className="p-8 lg:p-12 flex-1 flex flex-col justify-center">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg text-muted-foreground leading-relaxed mb-12 font-medium"
              >
                A sophisticated, modern ecosystem engineered to connect administrators, teachers, and students without friction. 
                <span className="text-foreground font-semibold block mt-4 text-xl">Brilliantly simple.</span>
              </motion.p>
              
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.3 }}
              >
                <Link
                  href="/login"
                  className="group relative flex items-center justify-between w-full px-6 py-6 bg-primary text-primary-foreground rounded-2xl font-display font-bold text-xl uppercase tracking-widest hover:bg-primary/90 transition-all shadow-glow hover:shadow-lg hover:-translate-y-1"
                >
                  <span>Initialize</span>
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Link>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="p-6 lg:p-16 grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-8 bg-background">
          
          {/* BENTO 1: Admin */}
          <div className="md:col-span-2 md:row-span-2">
            <Card className="h-full flex flex-col justify-between group overflow-hidden bg-white border-border/40 shadow-soft hover:shadow-soft-lg transition-shadow p-8 relative">
              <div className="absolute -top-10 -right-10 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                <Shield className="w-64 h-64 text-primary" />
              </div>
              <div className="relative z-10">
                <div className="text-sm font-bold text-primary mb-4 uppercase tracking-widest">Module 01</div>
                <h3 className="font-display font-black text-5xl lg:text-6xl uppercase mb-4 w-3/4 text-foreground">Total Control.</h3>
              </div>
              <p className="text-muted-foreground text-lg max-w-sm mt-12 leading-relaxed relative z-10">
                Command campus operations, orchestrate user roles, and monitor analytics with absolute precision.
              </p>
            </Card>
          </div>

          {/* BENTO 2: Teachers */}
          <div className="md:col-span-2">
            <Card className="h-full flex items-center justify-between group bg-secondary/10 border-secondary/20 shadow-soft hover:shadow-soft-lg transition-shadow p-8 relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-sm font-bold text-secondary-foreground/60 mb-2 uppercase tracking-widest">Module 02</div>
                <h3 className="font-display font-black text-4xl uppercase text-secondary-foreground">Educators</h3>
                <p className="text-secondary-foreground/80 text-base mt-2 max-w-xs font-medium">
                  Frictionless grading, attendance, and assignment workflows.
                </p>
              </div>
              <GraduationCap className="w-24 h-24 text-secondary opacity-20 relative z-10" />
            </Card>
          </div>

          {/* BENTO 3: Students */}
          <div>
            <Card className="h-full flex flex-col justify-between group bg-white border-border/40 shadow-soft hover:shadow-soft-lg transition-shadow p-8">
              <Users className="w-10 h-10 text-primary mb-4" />
              <div className="relative z-10">
                <h3 className="font-display font-bold text-2xl uppercase text-foreground">Students</h3>
                <p className="text-sm text-muted-foreground font-medium mt-2">
                  Unified data access.
                </p>
              </div>
            </Card>
          </div>

          {/* BENTO 4: Customization */}
          <div>
            <Card className="h-full flex flex-col justify-center items-center text-center group bg-primary/5 border-primary/20 shadow-soft hover:shadow-soft-lg transition-shadow p-8">
              <Settings className="w-8 h-8 text-primary mb-3" />
              <div className="font-display font-bold text-xl mb-1 text-foreground uppercase">Fully Bespoke</div>
              <div className="text-sm text-muted-foreground font-medium mt-1">Tailored for you</div>
            </Card>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 p-6 flex justify-between items-center bg-white text-sm font-medium text-muted-foreground">
        <div>
          &copy; {new Date().getFullYear()} CampusConnect
        </div>
        <div className="flex gap-4">
          <span>Est. 2026</span>
        </div>
      </footer>
    </div>
  );
}
