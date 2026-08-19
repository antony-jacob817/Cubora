import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, PlayCircle, Trophy, Target, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageTransition } from '@/components/animations/PageTransition';
import { ACADEMY_COURSES, type Course, type Lesson } from '@/data/academy';
import { LessonPlayer } from '@/components/academy/LessonPlayer';
import { useLearningProgress } from '@/hooks/useLearningProgress';
import { clsx } from 'clsx';

export default function Academy() {
  const [activeCourseId, setActiveCourseId] = useState<string>(ACADEMY_COURSES[1].id);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const { completedLessons, toggleLessonComplete, toggleAlgMastered } = useLearningProgress();

  const activeCourse = (ACADEMY_COURSES.find(c => c.id === activeCourseId) || ACADEMY_COURSES[0]) as Course;

  // Calculate dynamic overall progress metrics
  const allLessons = useMemo(() => ACADEMY_COURSES.flatMap(c => c.modules.flatMap(m => m.lessons)), []);
  const totalAlgsCount = allLessons.length;
  const masteredAlgsCount = allLessons.filter(l => completedLessons.includes(l.id)).length;

  // Active course dynamic progress calculation
  const activeCourseLessons = useMemo(() => activeCourse.modules.flatMap(m => m.lessons), [activeCourse]);
  const activeCourseCompletedCount = useMemo(
    () => activeCourseLessons.filter(l => completedLessons.includes(l.id)).length,
    [activeCourseLessons, completedLessons]
  );
  const activeCourseProgress = activeCourseLessons.length > 0
    ? Math.round((activeCourseCompletedCount / activeCourseLessons.length) * 100)
    : 0;

  const handleToggleLessonComplete = async (lessonId: string) => {
    const isCurrentlyCompleted = completedLessons.includes(lessonId);
    await toggleLessonComplete(lessonId);
    // Also sync algorithm mastery in learning state
    await toggleAlgMastered(lessonId, activeCourse.id, !isCurrentlyCompleted);
  };

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
            <span className="text-[10px] text-slate-700 dark:text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">
              Overall Mastery
            </span>
            <span className="text-sm sm:text-base text-slate-900 dark:text-white font-mono font-bold leading-none">
              {masteredAlgsCount} / {totalAlgsCount} Algs
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-4 gap-6 sm:gap-8 items-start">
        {/* Left Column: Course Selection Menu (Sticky on Desktop, Horizontal Scroll on Mobile/Tablet) */}
        <div className="w-full lg:col-span-1 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] flex flex-row overflow-x-auto hide-scrollbar gap-3 pb-2 lg:pb-0 lg:flex-col snap-x scroll-smooth whitespace-nowrap lg:whitespace-normal lg:overflow-y-auto">
          {ACADEMY_COURSES.map((course) => {
            const isActive = activeCourseId === course.id;
            const courseLessons = course.modules.flatMap(m => m.lessons);
            const courseCompleted = courseLessons.filter(l => completedLessons.includes(l.id)).length;
            const courseProgressPercent = courseLessons.length > 0
              ? Math.round((courseCompleted / courseLessons.length) * 100)
              : 0;

            return (
              <button
                key={course.id}
                type="button"
                onClick={() => setActiveCourseId(course.id)}
                className={clsx(
                  "flex-shrink-0 w-[260px] sm:w-[280px] lg:w-full text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden group snap-center min-h-[44px] cursor-pointer",
                  isActive
                    ? "bg-primary/10 border-primary/30 shadow-md"
                    : "bg-white/40 dark:bg-white/5 border-slate-200/80 dark:border-white/10 hover:bg-white/70 dark:hover:bg-white/10"
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
                    <span className="text-[10px] font-bold font-mono tracking-widest text-primary">
                      {course.badge}
                    </span>
                    <Target className="w-3.5 h-3.5 text-slate-600 dark:text-gray-400" />
                  </div>
                  <h3
                    className={clsx(
                      "font-display font-bold text-base sm:text-lg mb-3 truncate lg:whitespace-normal",
                      isActive ? "text-slate-900 dark:text-white" : "text-slate-800 dark:text-gray-300"
                    )}
                  >
                    {course.title}
                  </h3>

                  {/* Mini Tracking Progress Component */}
                  <div className="w-full h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${courseProgressPercent}%` }}
                    />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Active Course Track Sheets & Horizontal Lesson Carousels */}
        <div className="w-full lg:col-span-3">
          <motion.div
            key={activeCourse.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col gap-5 sm:gap-6"
          >
            {/* Course Header Hero Card */}
            <div className="glass-panel p-5 sm:p-6 md:p-8 relative overflow-hidden w-full">
              {/* Decorative Vector Orb */}
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
                    className="min-h-[44px] px-5 text-sm font-bold tracking-wide"
                    onClick={() => {
                      // Launch first uncompleted or first lesson
                      const firstUncompleted = activeCourseLessons.find(l => !completedLessons.includes(l.id)) || activeCourseLessons[0];
                      if (firstUncompleted) setActiveLesson(firstUncompleted);
                    }}
                  >
                    Continue Track
                  </Button>
                  <span className="text-slate-500 dark:text-gray-400 font-mono text-xs sm:text-sm">
                    {activeCourseProgress}% Completed ({activeCourseCompletedCount}/{activeCourseLessons.length})
                  </span>
                </div>
              </div>
            </div>

            {/* Modules List with Side-Scrollable Carousels */}
            <div className="space-y-5 sm:space-y-6">
              {activeCourse.modules.map((module, mIdx) => (
                <div
                  key={module.id}
                  className="glass-panel p-4 sm:p-6 border-slate-200/80 dark:border-white/5 text-left w-full overflow-hidden"
                >
                  <div className="mb-4 sm:mb-5">
                    <h3 className="font-display font-bold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight">
                      Module {mIdx + 1}: {module.title}
                    </h3>
                    <p className="text-slate-600 dark:text-gray-400 text-xs sm:text-sm mt-1 leading-relaxed">
                      {module.description}
                    </p>
                  </div>

                  {/* Horizontal Side-Scrollable Carousel for Module Cases */}
                  <div className="flex flex-row flex-nowrap gap-3.5 overflow-x-auto pb-3 pt-1 snap-x scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {module.lessons.map((lesson) => {
                      const isCompleted = completedLessons.includes(lesson.id);

                      return (
                        <div
                          key={lesson.id}
                          className="w-[280px] sm:w-[320px] shrink-0 snap-start bg-white/70 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col justify-between group hover:border-primary/30 transition-all shadow-sm min-h-[190px]"
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-1.5">
                              <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-primary transition-colors leading-snug truncate">
                                {lesson.title}
                              </h4>
                              {isCompleted && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-gray-400 line-clamp-2 mb-4 leading-relaxed">
                              {lesson.explanation}
                            </p>
                          </div>

                          {/* Control Box Area with Standardized Fixed Dimensions */}
                          <div className="flex flex-col gap-2.5 mt-auto pt-2 w-full">
                            <span
                              className="px-2.5 py-1.5 w-full truncate bg-slate-200/40 dark:bg-background rounded-xl text-[11px] font-mono font-bold text-slate-800 dark:text-gray-300 border border-slate-200/80 dark:border-white/5 select-all text-center"
                              title={lesson.algorithm}
                            >
                              {lesson.algorithm}
                            </span>

                            {/* Standardized Action Button */}
                            <button
                              type="button"
                              onClick={() => setActiveLesson(lesson)}
                              className={clsx(
                                "h-10 px-5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 select-none group/btn cursor-pointer w-full",
                                isCompleted
                                  ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-primary/20 hover:border-primary/40 hover:text-primary"
                                  : "bg-gradient-to-r from-primary to-secondary text-white btn-glow border border-white/20 hover:opacity-95 shadow-sm"
                              )}
                            >
                              {isCompleted ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 group-hover/btn:hidden shrink-0" />
                                  <PlayCircle className="w-3.5 h-3.5 text-primary hidden group-hover/btn:inline-block shrink-0" />
                                  <span className="group-hover/btn:hidden">Completed</span>
                                  <span className="hidden group-hover/btn:inline">Practice Again</span>
                                </>
                              ) : (
                                <>
                                  <PlayCircle className="w-3.5 h-3.5 shrink-0" />
                                  <span>Practice</span>
                                </>
                              )}
                            </button>
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

      {/* Interactive Modal Tracking Player */}
      <AnimatePresence>
        {activeLesson && (
          <LessonPlayer
            lesson={activeLesson}
            courseId={activeCourse.id}
            isCompleted={completedLessons.includes(activeLesson.id)}
            onClose={() => setActiveLesson(null)}
            onToggleComplete={() => handleToggleLessonComplete(activeLesson.id)}
            onComplete={() => handleToggleLessonComplete(activeLesson.id)}
          />
        )}
      </AnimatePresence>
    </PageTransition>
  );
}