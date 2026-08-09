"use client"

import { useState } from "react"
import { Stepper } from "@/components/ui/stepper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { publishSemesterSetup, SemesterSetupData } from "@/lib/actions/academics"
import { useRouter } from "next/navigation"
import { Plus, Trash2, BookOpen, Building2, MapPin, Calendar, Clock, GraduationCap, ArrowRight, ArrowLeft } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SetupWizardClient({ campuses, departments, teachers, academicYears }: any) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  
  const [data, setData] = useState<SemesterSetupData>({
    campusId: "",
    departmentId: "",
    academicYear: { name: "", startDate: "", endDate: "" },
    semester: { name: "", startDate: "", endDate: "" },
    classes: [],
  })

  const filteredDepartments = departments.filter((d: any) => d.campusId === data.campusId)
  const filteredTeachers = teachers.filter((t: any) => t.campusId === data.campusId)

  const steps = ["Institution", "Term Dates", "Classes & Subjects", "Review"]

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0))

  const addClass = () => {
    setData({
      ...data,
      classes: [...data.classes, { name: "", section: "", subjects: [] }]
    })
  }

  const removeClass = (idx: number) => {
    const newClasses = [...data.classes]
    newClasses.splice(idx, 1)
    setData({ ...data, classes: newClasses })
  }

  const addSubject = (classIdx: number) => {
    const newClasses = [...data.classes]
    newClasses[classIdx].subjects.push({ name: "", code: "", teacherId: "" })
    setData({ ...data, classes: newClasses })
  }

  const removeSubject = (classIdx: number, subjIdx: number) => {
    const newClasses = [...data.classes]
    newClasses[classIdx].subjects.splice(subjIdx, 1)
    setData({ ...data, classes: newClasses })
  }

  const handlePublish = async () => {
    setIsLoading(true)
    const res = await publishSemesterSetup(data)
    if (res.success) {
      alert("Semester Setup Published!")
      router.push("/admin")
    } else {
      alert("Error: " + res.error)
      setIsLoading(false)
    }
  }

  const stepVariants = {
    hidden: { opacity: 0, x: 20, filter: "blur(4px)" },
    visible: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, x: -20, filter: "blur(4px)", transition: { duration: 0.3, ease: "easeIn" } }
  }

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/40 shadow-2xl overflow-hidden relative">
      {/* Decorative gradient blur in background */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl opacity-50 pointer-events-none" />

      <div className="p-8 sm:p-12 relative z-10">
        <Stepper steps={steps} currentStep={currentStep} />

        <div className="mt-4 min-h-[420px] relative">
          <AnimatePresence mode="wait">
            {/* STEP 0: Institution */}
            {currentStep === 0 && (
              <motion.div key="step0" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="max-w-xl mx-auto py-8">
                <div className="text-center mb-10">
                  <h3 className="text-3xl font-display font-bold tracking-tight text-foreground mb-3">Select Scope</h3>
                  <p className="text-muted-foreground text-sm">Which campus and department are we configuring for this academic term?</p>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Campus</Label>
                    <div className="relative">
                      <Select value={data.campusId} onValueChange={(val) => setData({...data, campusId: val, departmentId: ""})}>
                        <SelectTrigger className="h-12 w-full rounded-xl border-2 border-muted/50 bg-white/50 backdrop-blur-sm px-4 py-2 text-sm transition-all focus:border-primary focus:ring-4 focus:ring-primary/10">
                          <SelectValue placeholder="Select Campus..." />
                        </SelectTrigger>
                        <SelectContent>
                          {campuses.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-semibold flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /> Department</Label>
                    <div className="relative">
                      <Select disabled={!data.campusId} value={data.departmentId} onValueChange={(val) => setData({...data, departmentId: val})}>
                        <SelectTrigger className="h-12 w-full rounded-xl border-2 border-muted/50 bg-white/50 backdrop-blur-sm px-4 py-2 text-sm transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-50">
                          <SelectValue placeholder="Select Department..." />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredDepartments.map((d: any) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 1: Dates */}
            {currentStep === 1 && (
              <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="max-w-3xl mx-auto py-4">
                <div className="grid md:grid-cols-2 gap-12">
                  
                  {/* Academic Year */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6 border-b pb-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">Academic Year</h3>
                        <p className="text-xs text-muted-foreground">The overarching yearly session.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground">Name (e.g. 2026-2027)</Label>
                        <Input className="h-11 rounded-xl bg-white/50" value={data.academicYear.name} onChange={e => setData({...data, academicYear: {...data.academicYear, name: e.target.value}})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground">Start Date</Label>
                          <Input className="h-11 rounded-xl bg-white/50" type="date" value={data.academicYear.startDate} onChange={e => setData({...data, academicYear: {...data.academicYear, startDate: e.target.value}})} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground">End Date</Label>
                          <Input className="h-11 rounded-xl bg-white/50" type="date" value={data.academicYear.endDate} onChange={e => setData({...data, academicYear: {...data.academicYear, endDate: e.target.value}})} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Semester */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6 border-b pb-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-foreground">Semester Details</h3>
                        <p className="text-xs text-muted-foreground">Specific term within the year.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold text-muted-foreground">Semester Name (e.g. Fall 2026)</Label>
                        <Input className="h-11 rounded-xl bg-white/50" value={data.semester.name} onChange={e => setData({...data, semester: {...data.semester, name: e.target.value}})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground">Start Date</Label>
                          <Input className="h-11 rounded-xl bg-white/50" type="date" value={data.semester.startDate} onChange={e => setData({...data, semester: {...data.semester, startDate: e.target.value}})} />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-semibold text-muted-foreground">End Date</Label>
                          <Input className="h-11 rounded-xl bg-white/50" type="date" value={data.semester.endDate} onChange={e => setData({...data, semester: {...data.semester, endDate: e.target.value}})} />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

            {/* STEP 2: Classes & Subjects */}
            {currentStep === 2 && (
              <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div className="flex justify-between items-end mb-6 border-b pb-4">
                  <div>
                    <h3 className="text-2xl font-display font-bold text-foreground mb-1">Classes & Subjects</h3>
                    <p className="text-sm text-muted-foreground">Define the classes and assign subject teachers.</p>
                  </div>
                  <Button onClick={addClass} className="rounded-full shadow-md hover:shadow-lg transition-all" size="sm">
                    <Plus className="w-4 h-4 mr-2" /> Add Class
                  </Button>
                </div>

                {data.classes.length === 0 ? (
                  <div className="text-center py-16 bg-white/40 rounded-2xl border-2 border-dashed border-muted-foreground/20 backdrop-blur-sm">
                    <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <GraduationCap className="w-8 h-8 text-primary/40" />
                    </div>
                    <h4 className="text-lg font-medium text-foreground mb-2">No classes added yet</h4>
                    <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">Start building your academic structure by creating your first class for this semester.</p>
                    <Button onClick={addClass} variant="outline" className="rounded-full border-primary/20 hover:bg-primary/5 text-primary">
                      <Plus className="w-4 h-4 mr-2" /> Create First Class
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-8 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar pb-10">
                    {data.classes.map((cls, cIdx) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={cIdx} 
                        className="border border-muted/60 rounded-2xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                      >
                        {/* Accent Bar */}
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/80 group-hover:bg-primary transition-colors" />

                        <div className="flex gap-4 items-start mb-6">
                          <div className="space-y-2 flex-1">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Class Name</Label>
                            <Input placeholder="e.g. B.Tech CS 1st Year" className="h-11 rounded-xl bg-muted/20 border-transparent focus:border-primary focus:bg-background transition-all" value={cls.name} onChange={e => {
                              const newC = [...data.classes]; newC[cIdx].name = e.target.value; setData({...data, classes: newC})
                            }} />
                          </div>
                          <div className="space-y-2 w-32">
                            <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">Section</Label>
                            <Input placeholder="A" className="h-11 rounded-xl text-center bg-muted/20 border-transparent focus:border-primary focus:bg-background transition-all" value={cls.section || ""} onChange={e => {
                              const newC = [...data.classes]; newC[cIdx].section = e.target.value; setData({...data, classes: newC})
                            }} />
                          </div>
                          <Button variant="ghost" size="icon" className="mt-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full" onClick={() => removeClass(cIdx)}>
                            <Trash2 className="w-5 h-5" />
                          </Button>
                        </div>

                        {/* Subjects */}
                        <div className="pl-4 sm:pl-8 space-y-4 mt-8">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-sm flex items-center text-foreground"><BookOpen className="w-4 h-4 mr-2 text-primary" /> Curriculum</h4>
                            <Button onClick={() => addSubject(cIdx)} variant="ghost" size="sm" className="text-primary hover:bg-primary/10 rounded-full h-8 text-xs font-medium">
                              <Plus className="w-3 h-3 mr-1" /> Add Subject
                            </Button>
                          </div>
                          
                          {cls.subjects.length === 0 && (
                             <p className="text-xs text-muted-foreground/70 italic pl-6">No subjects assigned yet.</p>
                          )}

                          {cls.subjects.map((subj, sIdx) => (
                            <motion.div 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              key={sIdx} 
                              className="flex flex-col sm:flex-row gap-3 items-center bg-muted/10 p-2 sm:p-3 rounded-xl border border-muted/30 hover:border-primary/30 transition-colors"
                            >
                              <Input placeholder="Subject Name (e.g. Algebra)" value={subj.name} className="flex-1 h-10 bg-white" onChange={e => {
                                const newC = [...data.classes]; newC[cIdx].subjects[sIdx].name = e.target.value; setData({...data, classes: newC})
                              }} />
                              <Input placeholder="Code" value={subj.code} className="w-full sm:w-28 h-10 bg-white" onChange={e => {
                                const newC = [...data.classes]; newC[cIdx].subjects[sIdx].code = e.target.value; setData({...data, classes: newC})
                              }} />
                              
                              <div className="relative w-full sm:w-56">
                                <Select value={subj.teacherId} onValueChange={(val) => {
                                  const newC = [...data.classes]; newC[cIdx].subjects[sIdx].teacherId = val; setData({...data, classes: newC})
                                }}>
                                  <SelectTrigger className="h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all">
                                    <SelectValue placeholder="Assign Teacher..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {filteredTeachers.map((t: any) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              </div>

                              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0" onClick={() => removeSubject(cIdx, sIdx)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* STEP 3: Review */}
            {currentStep === 3 && (
              <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-8 max-w-2xl mx-auto text-center py-12">
                
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1, type: "spring" }}
                  className="w-24 h-24 bg-gradient-to-tr from-primary to-blue-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20"
                >
                  <svg className="w-12 h-12" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </motion.div>

                <div className="space-y-3">
                  <h3 className="text-3xl font-display font-black tracking-tight text-foreground">Ready to Launch!</h3>
                  <p className="text-muted-foreground text-lg px-8">
                    You are about to finalize <span className="font-semibold text-foreground">{data.semester.name}</span> containing <span className="font-semibold text-foreground">{data.classes.length} classes</span>.
                  </p>
                </div>
                
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white/60 backdrop-blur-md p-8 rounded-2xl text-left border shadow-sm max-w-md mx-auto space-y-4"
                >
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Calendar className="w-4 h-4" /> Academic Year</span> 
                    <span className="font-semibold">{data.academicYear.name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Semester</span> 
                    <span className="font-semibold">{data.semester.name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-3">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Total Classes</span> 
                    <span className="font-semibold">{data.classes.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground flex items-center gap-2"><BookOpen className="w-4 h-4" /> Total Subjects</span> 
                    <span className="font-semibold text-primary">{data.classes.reduce((acc, c) => acc + c.subjects.length, 0)}</span>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between mt-12 pt-6 border-t border-muted/50">
          <Button 
            variant="ghost" 
            onClick={prevStep} 
            disabled={currentStep === 0 || isLoading}
            className="text-muted-foreground hover:text-foreground font-medium px-6 py-6 rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button 
              onClick={nextStep} 
              disabled={
                (currentStep === 0 && (!data.campusId || !data.departmentId)) ||
                (currentStep === 1 && (!data.academicYear.name || !data.semester.name))
              }
              className="px-8 py-6 rounded-xl font-bold bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-foreground/10 transition-all active:scale-95"
            >
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handlePublish} 
              disabled={isLoading}
              className="px-8 py-6 rounded-xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
            >
              {isLoading ? "Publishing Setup..." : "Publish Setup"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
