import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Lock, PlayCircle, Trophy, Target, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageTransition } from '@/components/animations/PageTransition';
import { ACADEMY_COURSES, type Course, type Lesson } from '@/data/academy';
import { LessonPlayer } from '@/components/academy/LessonPlayer';
import { clsx } from 'clsx';

export default function Academy() {
  const [activeCourseId, setActiveCourseId] = useState<string>(ACADEMY_COURSES[1].id);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const activeCourse = ACADEMY_COURSES.find(c => c.id === activeCourseId) as Course;

  return (
    <PageTransition className="w-full flex flex-col gap-6 pb-12 min-h-screen">
      
      {/* Header Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <GraduationCap className="w-8 h-8 text-primary" /> Cube Academy
          </h1>
          <p className="text-gray-400 text-sm mt-2 max-w-xl">
            Interactive algorithms and methodologies powered by the 3D tracking engine. Master every layer.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Overall Mastery</span>
            <span className="text-white font-mono font-bold">14 / 85 Algs</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
        
        {/* Left Column: Course Selection */}
        <div className="xl:col-span-1 flex flex-col gap-3">
          {ACADEMY_COURSES.map((course) => {
            const isActive = activeCourseId === course.id;
            const isLocked = course.progress === 0 && course.id !== 'beginner' && course.id !== 'cfop';

            return (
              <button
                key={course.id}
                onClick={() => !isLocked && setActiveCourseId(course.id)}
                className={clsx(
                  "w-full text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group",
                  isActive ? "bg-primary/10 border-primary/30" : "bg-white/5 border-white/10 hover:bg-white/10",
                  isLocked && "opacity-50 cursor-not-allowed"
                )}
              >
                {isActive && (
                  <motion.div layoutId="activeCourseBg" className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent border-l-4 border-primary" />
                )}
                
                <div className="relative z-10">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold font-mono tracking-widest text-primary">{course.badge}</span>
                    {isLocked ? <Lock className="w-4 h-4 text-gray-500" /> : <Target className="w-4 h-4 text-gray-400" />}
                  </div>
                  <h3 className={clsx("font-display font-bold text-lg mb-3", isActive ? "text-white" : "text-gray-300")}>{course.title}</h3>
                  
                  {/* Mini Progress Bar */}
                  <div className="w-full h-1.5 bg-background rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Active Course Modules */}
        <div className="xl:col-span-3">
          <motion.div 
            key={activeCourse.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-6"
          >
            {/* Course Header Hero */}
            <div className="glass-panel p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
              <div className="relative z-10 max-w-2xl">
                <h2 className="font-display text-4xl font-bold text-white mb-4">{activeCourse.title}</h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-6">{activeCourse.description}</p>
                <div className="flex items-center gap-4">
                   <Button variant="glow">Continue Track</Button>
                   <span className="text-gray-400 font-mono text-sm">{activeCourse.progress}% Completed</span>
                </div>
              </div>
            </div>

            {/* Modules List */}
            <div className="space-y-6">
              {activeCourse.modules.map((module, mIdx) => (
                <div key={module.id} className="glass-panel p-6 border-white/5">
                  <div className="mb-6">
                    <h3 className="font-display font-bold text-2xl text-white">Module {mIdx + 1}: {module.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{module.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {module.lessons.map((lesson) => (
                      <div 
                        key={lesson.id} 
                        className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col justify-between group hover:border-primary/30 transition-colors"
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                             <h4 className="font-bold text-white group-hover:text-primary transition-colors">{lesson.title}</h4>
                             {lesson.isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                          </div>
                          <p className="text-xs text-gray-400 line-clamp-2 mb-4">{lesson.explanation}</p>
                        </div>
                        
                        <div className="flex items-center justify-between mt-auto">
                          <span className="px-2 py-1 bg-background rounded-md text-xs font-mono text-gray-300 border border-white/5">
                            {lesson.algorithm}
                          </span>
                          <Button 
                            variant="secondary" size="sm" className="gap-2 px-3 hover:bg-primary hover:text-white hover:border-primary"
                            onClick={() => setActiveLesson(lesson)}
                          >
                            <PlayCircle className="w-4 h-4" /> Practice
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

          </motion.div>
        </div>
      </div>

      {/* Interactive Modal Overlay */}
      <AnimatePresence>
        {activeLesson && (
          <LessonPlayer 
            lesson={activeLesson} 
            onClose={() => setActiveLesson(null)} 
            onComplete={() => {
              // In production, dispatch an API call to update the user's progress model
              console.log("Mastered:", activeLesson.id);
            }} 
          />
        )}
      </AnimatePresence>

    </PageTransition>
  );
}