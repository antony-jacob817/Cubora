import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, PlayCircle, Trophy, Target, CheckCircle2, 
  Sparkles, Clock, Compass, Award, BookOpen, Layers, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageTransition } from '@/components/animations/PageTransition';
import { ACADEMY_COURSES, type Course, type Lesson } from '@/data/academy';
import { LessonPlayer } from '@/components/academy/LessonPlayer';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { clsx } from 'clsx';

export default function Academy() {
  const { 
    completedLessons, 
    currentPath, 
    masteredAlgsCount, 
    toggleLessonComplete, 
    setCurrentPath 
  } = useLearningProgress();

  // Active course state initialized from currentPath or default
  const [activeCourseId, setActiveCourseId] = useState<string>(() => {
    const matched = ACADEMY_COURSES.find(c => c.id === currentPath);
    return matched ? matched.id : 'beginner';
  });

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Compute dynamic progress per course from completedLessons
  const coursesWithDynamicProgress = useMemo(() => {
    return ACADEMY_COURSES.map(course => {
      let totalLessons = 0;
      let completedInCourse = 0;

      course.modules.forEach(module => {
        module.lessons.forEach(lesson => {
          totalLessons++;
          if (completedLessons.includes(lesson.id)) {
            completedInCourse++;
          }
        });
      });

      const calculatedProgress = totalLessons > 0 
        ? Math.round((completedInCourse / totalLessons) * 100) 
        : 0;

      return {
        ...course,
        totalLessons,
        completedInCourse,
        progress: calculatedProgress
      };
    });
  }, [completedLessons]);

  const activeCourse = useMemo(() => {
    return coursesWithDynamicProgress.find(c => c.id === activeCourseId) || coursesWithDynamicProgress[0];
  }, [coursesWithDynamicProgress, activeCourseId]);

  // Compute overall total completed lessons across all courses
  const totalCompletedLessons = useMemo(() => {
    let count = 0;
    ACADEMY_COURSES.forEach(c => {
      c.modules.forEach(m => {
        m.lessons.forEach(l => {
          if (completedLessons.includes(l.id)) count++;
        });
      });
    });
    return count;
  }, [completedLessons]);

  // Compute next lesson in sequence for LessonPlayer modal
  const nextLessonInTrack = useMemo(() => {
    if (!activeLesson) return null;
    let foundCurrent = false;
    for (const mod of activeCourse.modules) {
      for (const les of mod.lessons) {
        if (foundCurrent) return les;
        if (les.id === activeLesson.id) foundCurrent = true;
      }
    }
    return null;
  }, [activeCourse, activeLesson]);

  const handleTabChange = (courseId: string) => {
    setActiveCourseId(courseId);
    if (['beginner', 'simplified-cfop', 'cfop', 'roux', 'zz'].includes(courseId)) {
      setCurrentPath(courseId as any);
    }
  };

  return (
    <PageTransition className="w-full flex flex-col gap-5 sm:gap-6 pb-12 min-h-screen px-1 sm:px-0 text-left">
      
      {/* Header Context Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-1 sm:mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-full flex items-center gap-1 w-fit">
              <Compass className="w-3 h-3" /> Interactive Curriculum
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5 sm:gap-3">
            <GraduationCap className="w-8 h-8 sm:w-9 sm:h-9 text-primary shrink-0" /> Cube Academy
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
            Step-by-step 3D algorithm interactive lessons across all 5 major speedcubing methodologies with interactive example solves.
          </p>
        </div>
        
        {/* Top Mini Stats Dashboard Frame */}
        <div className="flex items-center gap-4 bg-white/60 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 px-4 sm:px-5 py-3 rounded-2xl shadow-sm self-start md:self-auto shrink-0">
          <div className="w-9 h-9 rounded-xl bg-yellow-500/15 border border-yellow-500/20 flex items-center justify-center text-yellow-500 shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">
              Curriculum Mastery
            </span>
            <div className="flex items-center gap-3">
              <span className="text-sm sm:text-base text-slate-900 dark:text-white font-mono font-bold leading-none">
                {totalCompletedLessons} Lessons Mastered
              </span>
              <span className="text-xs text-primary font-mono font-bold border-l border-slate-200 dark:border-white/10 pl-3">
                {masteredAlgsCount} Algs Logged
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Course Method Selection Tabs Sidebar + Active Track Modules */}
      <div className="flex flex-col xl:grid xl:grid-cols-4 gap-6 sm:gap-8 items-start">
        
        {/* Course Navigation Tab Selector */}
        <div className="w-full xl:col-span-1 flex flex-row overflow-x-auto hide-scrollbar gap-3 pb-2 xl:pb-0 xl:flex-col snap-x scroll-smooth whitespace-nowrap xl:whitespace-normal xl:overflow-x-visible">
          {coursesWithDynamicProgress.map((course) => {
            const isActive = activeCourseId === course.id;            

            return (
              <button
                key={course.id}
                onClick={() => handleTabChange(course.id)}
                className={clsx(
                  "flex-shrink-0 w-[240px] sm:w-[260px] xl:w-full text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group snap-center min-h-[44px]",
                  isActive 
                    ? "bg-primary/10 border-primary/40 shadow-md ring-1 ring-primary/20" 
                    : "bg-white/60 dark:bg-white/5 border-slate-200/80 dark:border-white/10 hover:bg-white/90 dark:hover:bg-white/10"
                )}
              >
                {isActive && (
                  <motion.div 
                    layoutId="activeCourseBg" 
                    className="absolute inset-0 bg-gradient-to-r from-primary/15 to-transparent border-b-2 xl:border-b-0 xl:border-l-4 border-primary" 
                  />
                )}
                
                <div className="relative z-10 w-full">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] font-bold font-mono tracking-widest text-primary uppercase">
                      {course.badge}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-gray-400">
                      <span>{course.completedInCourse}/{course.totalLessons}</span>
                    </div>
                  </div>
                  
                  <h3 className={clsx(
                    "font-display font-bold text-base sm:text-lg mb-2.5 truncate xl:whitespace-normal", 
                    isActive ? "text-slate-900 dark:text-white" : "text-slate-800 dark:text-gray-300"
                  )}>
                    {course.title}
                  </h3>
                  
                  {/* Mini Tracking Progress Component */}
                  <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500 rounded-full" 
                      style={{ width: `${course.progress}%` }} 
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Course Modules & Lesson Sheet */}
        <div className="w-full xl:col-span-3">
          <motion.div 
            key={activeCourse.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-5 sm:gap-6"
          >
            {/* Active Course Banner Hero */}
            <div className="glass-panel p-5 sm:p-6 md:p-8 relative overflow-hidden w-full border-slate-200/80 dark:border-white/10">
              <div className="absolute top-0 right-0 w-36 h-36 sm:w-64 sm:h-64 bg-primary/15 blur-[60px] sm:blur-[100px] rounded-full pointer-events-none" />
              
              <div className="relative z-10 max-w-3xl text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-2.5 py-0.5 rounded-md">
                    Method Track: {activeCourse.badge}
                  </span>
                  {activeCourse.progress === 100 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3" /> Track Mastered
                    </span>
                  )}
                </div>
                
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-2.5 tracking-tight">
                  {activeCourse.title}
                </h2>
                <p className="text-slate-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed mb-5">
                  {activeCourse.description}
                </p>
                
                {/* Method Progress Detail */}
                <div className="flex flex-wrap items-center gap-4 pt-1">
                  <div className="flex-1 min-w-[200px] max-w-sm">
                    <div className="flex justify-between text-xs font-mono text-slate-600 dark:text-gray-400 mb-1.5">
                      <span>Method Mastery</span>
                      <span className="font-bold text-slate-900 dark:text-white">{activeCourse.progress}% ({activeCourse.completedInCourse}/{activeCourse.totalLessons})</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200/80 dark:bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500 rounded-full" 
                        style={{ width: `${activeCourse.progress}%` }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modules List Container */}
            <div className="space-y-5 sm:space-y-6">
              {activeCourse.modules.map((module, mIdx) => (
                <div 
                  key={module.id} 
                  className="glass-panel p-4 sm:p-6 border-slate-200/80 dark:border-white/10 text-left w-full"
                >
                  <div className="mb-5 sm:mb-6">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-primary uppercase tracking-widest">
                        Module {mIdx + 1}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight mt-0.5">
                      {module.title}
                    </h3>
                    <p className="text-slate-600 dark:text-gray-400 text-xs sm:text-sm mt-1 leading-relaxed">
                      {module.description}
                    </p>
                  </div>

                  {/* Adaptive Lesson Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {module.lessons.map((lesson) => {
                      const isCompleted = completedLessons.includes(lesson.id);

                      return (
                        <div 
                          key={lesson.id} 
                          className={clsx(
                            "border rounded-2xl p-4 sm:p-5 flex flex-col justify-between group transition-all duration-200 shadow-sm min-h-[175px]",
                            lesson.isExampleSolve
                              ? "bg-gradient-to-br from-primary/10 via-white/70 to-secondary/10 dark:from-primary/10 dark:via-white/5 dark:to-secondary/10 border-primary/40 md:col-span-2"
                              : isCompleted 
                                ? "bg-emerald-500/[0.03] dark:bg-emerald-500/[0.03] border-emerald-500/30" 
                                : "bg-white/70 dark:bg-white/5 border-slate-200/80 dark:border-white/10 hover:border-primary/40 hover:bg-white/90 dark:hover:bg-white/[0.08]"
                          )}
                        >
                          <div className="w-full">
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                {lesson.isExampleSolve && (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 shrink-0">
                                    <Sparkles className="w-3 h-3" /> Full Solve Walkthrough
                                  </span>
                                )}
                                <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-snug">
                                  {lesson.title}
                                </h4>
                                {lesson.difficulty && (
                                  <span className="text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-gray-400 shrink-0">
                                    {lesson.difficulty}
                                  </span>
                                )}
                              </div>
                              {isCompleted && (
                                <div className="flex items-center gap-1 text-emerald-500 shrink-0">
                                  <CheckCircle2 className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            
                            <p className="text-xs text-slate-600 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                              {lesson.explanation}
                            </p>
                          </div>
                          
                          {/* Bottom Algorithm Bar & Launch 3D Button */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-auto pt-3 border-t border-slate-200/50 dark:border-white/5 w-full">
                            <div className="flex items-center gap-2 min-w-0 max-w-full">
                              <span className="px-2.5 py-1.5 max-w-[240px] truncate bg-slate-100 dark:bg-black/40 rounded-lg text-xs font-mono font-bold text-slate-800 dark:text-gray-200 border border-slate-200/80 dark:border-white/10 select-all" title={lesson.algorithm}>
                                {lesson.algorithm}
                              </span>
                              {lesson.estimatedTime && (
                                <span className="text-[10px] font-mono text-slate-400 dark:text-gray-500 flex items-center gap-1 shrink-0">
                                  <Clock className="w-3 h-3" /> {lesson.estimatedTime}
                                </span>
                              )}
                            </div>

                            <Button 
                              variant={lesson.isExampleSolve ? "glow" : isCompleted ? "secondary" : "glow"}
                              size="sm" 
                              className="gap-1.5 h-9 min-h-[38px] px-3.5 text-xs font-bold shrink-0 justify-center"
                              onClick={() => setActiveLesson(lesson)}
                            >
                              <PlayCircle className="w-3.5 h-3.5" /> 
                              {lesson.isExampleSolve ? 'Play Example Solve' : isCompleted ? 'Review 3D' : 'Practice 3D'}
                            </Button>
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

      {/* 3D Interactive Lesson Player Modal View */}
      <AnimatePresence>
        {activeLesson && (
          <LessonPlayer 
            lesson={activeLesson} 
            nextLesson={nextLessonInTrack}
            isCompleted={completedLessons.includes(activeLesson.id)}
            onClose={() => setActiveLesson(null)} 
            onSelectNextLesson={(next) => setActiveLesson(next)}
            onToggleComplete={async (lessonId, isCompletedState) => {
              await toggleLessonComplete(lessonId, isCompletedState);
            }} 
          />
        )}
      </AnimatePresence>

    </PageTransition>
  );
}