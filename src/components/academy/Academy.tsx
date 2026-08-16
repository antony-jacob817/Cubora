import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, PlayCircle, Trophy, Target, CheckCircle2, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageTransition } from '@/components/animations/PageTransition';
import { ACADEMY_COURSES, type Course, type Lesson } from '@/data/academy';
import { LessonPlayer } from '@/components/academy/LessonPlayer';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { clsx } from 'clsx';

export default function Academy() {
  const [activeCourseId, setActiveCourseId] = useState<string>(ACADEMY_COURSES[1].id);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [hoveredButtonLessonId, setHoveredButtonLessonId] = useState<string | null>(null);

  const { completedLessons, toggleLessonComplete, isLessonCompleted } = useLearningProgress();

  const activeCourse = (ACADEMY_COURSES.find(c => c.id === activeCourseId) || ACADEMY_COURSES[0]) as Course;

  // Calculate dynamic overall progress and course progress
  const allLessons = useMemo(() => {
    return ACADEMY_COURSES.flatMap(c => c.modules.flatMap(m => m.lessons));
  }, []);

  const totalMasteredCount = useMemo(() => {
    return allLessons.filter(l => completedLessons.includes(l.id) || l.isCompleted).length;
  }, [allLessons, completedLessons]);

  const courseProgressPercent = useMemo(() => {
    const courseLessons = activeCourse.modules.flatMap(m => m.lessons);
    if (courseLessons.length === 0) return 0;
    const completedInCourse = courseLessons.filter(l => completedLessons.includes(l.id) || l.isCompleted).length;
    return Math.round((completedInCourse / courseLessons.length) * 100);
  }, [activeCourse, completedLessons]);

  return (
    <PageTransition className="w-full flex flex-col gap-5 sm:gap-6 pb-12 min-h-screen px-1 sm:px-0">
      
      {/* Header Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2 sm:mb-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 sm:gap-3">
            <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-primary" /> Cube Academy
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
            Interactive algorithms and methodologies powered by the 3D tracking engine. Master every layer.
          </p>
        </div>
        
        {/* Top Mini Stats Dashboard Frame */}
        <div className="flex items-center gap-3.5 bg-white/40 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 px-4 py-2.5 rounded-2xl shadow-sm self-start md:self-auto min-h-[44px]">
          <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-700 dark:text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">Overall Mastery</span>
            <span className="text-sm sm:text-base text-slate-900 dark:text-white font-mono font-bold leading-none">
              {totalMasteredCount} / {allLessons.length} Algs
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 sm:gap-8 items-start relative">
        
        {/* Left Column: Sticky Course Selection Menu */}
        <div className="w-full lg:col-span-1 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] flex flex-row overflow-x-auto hide-scrollbar gap-3 pb-2 lg:pb-0 lg:flex-col snap-x scroll-smooth whitespace-nowrap lg:whitespace-normal lg:overflow-y-auto">
          {ACADEMY_COURSES.map((course) => {
            const isActive = activeCourseId === course.id;
            const courseLessons = course.modules.flatMap(m => m.lessons);
            const completedCount = courseLessons.filter(l => completedLessons.includes(l.id) || l.isCompleted).length;
            const progressPct = courseLessons.length > 0 ? Math.round((completedCount / courseLessons.length) * 100) : course.progress;

            return (
              <button
                key={course.id}
                onClick={() => setActiveCourseId(course.id)}
                className={clsx(
                  "flex-shrink-0 w-[260px] sm:w-[280px] lg:w-full text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group snap-center min-h-[44px] cursor-pointer",
                  isActive ? "bg-primary/10 border-primary/30 shadow-md" : "bg-white/40 dark:bg-white/5 border-slate-200/80 dark:border-white/10 hover:bg-white/70 dark:hover:bg-white/10"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeCourseBg" 
                    className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent border-b-2 lg:border-b-0 lg:border-l-4 border-primary" 
                  />
                )}
                
                <div className="relative z-10 w-full">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold font-mono tracking-widest text-primary uppercase">{course.badge}</span>
                    <Target className="w-3.5 h-3.5 text-slate-600 dark:text-gray-400" />
                  </div>
                  <h3 className={clsx(
                    "font-display font-bold text-base sm:text-lg mb-3 truncate lg:whitespace-normal", 
                    isActive ? "text-slate-900 dark:text-white" : "text-slate-800 dark:text-gray-300"
                  )}>
                    {course.title}
                  </h3>
                  
                  {/* Mini Tracking Progress Component */}
                  <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Active Course Track & Horizontal Carousels */}
        <div className="w-full lg:col-span-3 min-w-0">
          <motion.div 
            key={activeCourse.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-5 sm:gap-6 min-w-0"
          >
            {/* Course Header Hero Card */}
            <div className="glass-panel p-5 sm:p-6 md:p-8 relative overflow-hidden w-full">
              <div className="absolute top-0 right-0 w-32 h-32 sm:w-64 sm:h-64 bg-primary/10 sm:bg-primary/20 blur-[60px] sm:blur-[100px] rounded-full pointer-events-none" />
              
              <div className="relative z-10 max-w-2xl text-left">
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3 sm:mb-4 tracking-tight">
                  {activeCourse.title}
                </h2>
                <p className="text-slate-700 dark:text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed mb-5 sm:mb-6">
                  {activeCourse.description}
                </p>
                <div className="flex flex-wrap items-center gap-4">
                   <Button 
                    variant="glow" 
                    className="h-10 px-5 rounded-xl text-xs font-bold tracking-wide"
                    onClick={() => {
                      const firstIncomplete = activeCourse.modules.flatMap(m => m.lessons).find(l => !completedLessons.includes(l.id) && !l.isCompleted);
                      if (firstIncomplete) {
                        setActiveLesson(firstIncomplete);
                      } else if (activeCourse.modules[0]?.lessons[0]) {
                        setActiveLesson(activeCourse.modules[0].lessons[0]);
                      }
                    }}
                   >
                     Continue Track
                   </Button>
                   <span className="text-slate-500 dark:text-gray-400 font-mono text-xs sm:text-sm">
                     {courseProgressPercent}% Completed
                   </span>
                </div>
              </div>
            </div>

            {/* Modules List Sheet with Horizontal Side-Scrollable Carousels */}
            <div className="space-y-5 sm:space-y-6 min-w-0">
              {activeCourse.modules.map((module, mIdx) => (
                <div key={module.id} className="glass-panel p-4 sm:p-6 border-slate-200/80 dark:border-white/5 text-left w-full overflow-hidden">
                  <div className="mb-4 sm:mb-5">
                    <h3 className="font-display font-bold text-lg sm:text-xl md:text-2xl text-slate-900 dark:text-white tracking-tight">
                      Module {mIdx + 1}: {module.title}
                    </h3>
                    <p className="text-slate-600 dark:text-gray-400 text-xs sm:text-sm mt-1 leading-relaxed">
                      {module.description}
                    </p>
                  </div>

                  {/* Horizontal Side-Scrollable Carousel for Module Cases */}
                  <div className="flex flex-row flex-nowrap gap-3.5 overflow-x-auto pb-3 pt-1 snap-x scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {module.lessons.map((lesson) => {
                      const isCompleted = isLessonCompleted(lesson.id) || lesson.isCompleted;
                      const isHovered = hoveredButtonLessonId === lesson.id;

                      return (
                        <div 
                          key={lesson.id} 
                          className="w-[280px] sm:w-[320px] shrink-0 snap-start bg-white/70 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between group hover:border-primary/30 transition-all shadow-sm min-h-[220px]"
                        >
                          <div className="w-full">
                            <div className="flex justify-between items-start gap-2 mb-1.5">
                               <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-snug truncate" title={lesson.title}>
                                 {lesson.title}
                               </h4>
                               {isCompleted && (
                                 <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0 mt-0.5" />
                               )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-gray-400 line-clamp-2 mb-3 leading-relaxed">
                              {lesson.explanation}
                            </p>
                          </div>

                          {/* Algorithm Badge */}
                          <div className="w-full mb-3">
                            <span className="block px-2.5 py-1.5 w-full truncate bg-slate-200/40 dark:bg-black/30 rounded-lg text-[11px] font-mono font-bold text-slate-800 dark:text-gray-300 border border-slate-200/80 dark:border-white/5 select-all text-center" title={lesson.algorithm}>
                              {lesson.algorithm}
                            </span>
                          </div>
                          
                          {/* Controls Row: Practice & Standardized Completion Toggle Button */}
                          <div className="flex flex-col gap-2 mt-auto pt-2 w-full">
                            <div className="flex items-center gap-2 w-full">
                              <Button 
                                variant="secondary" 
                                size="sm" 
                                className="h-10 flex-1 px-3 text-xs font-bold hover:bg-primary hover:text-white hover:border-primary flex items-center justify-center gap-1.5 rounded-xl"
                                onClick={() => setActiveLesson(lesson)}
                              >
                                <PlayCircle className="w-3.5 h-3.5 shrink-0" /> Practice
                              </Button>

                              {/* Standardized Completion Toggle Button */}
                              <button
                                type="button"
                                onClick={() => toggleLessonComplete(lesson.id)}
                                onMouseEnter={() => setHoveredButtonLessonId(lesson.id)}
                                onMouseLeave={() => setHoveredButtonLessonId(null)}
                                className={clsx(
                                  "h-10 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 select-none shrink-0 cursor-pointer focus:outline-none",
                                  isCompleted
                                    ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-600 dark:hover:text-rose-400"
                                    : "border border-slate-300 dark:border-white/15 bg-slate-100/70 dark:bg-white/5 text-slate-700 dark:text-gray-300 hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                                )}
                                title={isCompleted ? "Click to undo completion" : "Click to mark complete"}
                              >
                                {isCompleted ? (
                                  isHovered ? (
                                    <>
                                      <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                                      <span className="hidden sm:inline">Undo</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                      <span className="hidden sm:inline">Done</span>
                                    </>
                                  )
                                ) : (
                                  <>
                                    <Check className="w-3.5 h-3.5 shrink-0" />
                                    <span className="hidden sm:inline">Done</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

          </motion.div>
        </div>
      </div>

      {/* Interactive Modal Tracking Sheets */}
      <AnimatePresence>
        {activeLesson && (
          <LessonPlayer 
            lesson={activeLesson} 
            isCompleted={isLessonCompleted(activeLesson.id) || activeLesson.isCompleted}
            onToggleComplete={(lessonId) => toggleLessonComplete(lessonId)}
            onClose={() => setActiveLesson(null)} 
            onComplete={() => {
              toggleLessonComplete(activeLesson.id, true);
            }} 
          />
        )}
      </AnimatePresence>

    </PageTransition>
  );
}