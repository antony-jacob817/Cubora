const WEEKLY_CHALLENGE_POOL = [
  // Week 1
  {
    title: 'Roux Transition Week',
    description: 'Complete 50 verified solves using the Roux method.',
    methodFilter: 'Roux',
    targetCount: 50,
    maxTimeMs: null,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 2
  {
    title: 'Sub-20 Speed Sprint',
    description: 'Log 30 verified solves under 20.00s using CFOP.',
    methodFilter: 'CFOP',
    targetCount: 30,
    maxTimeMs: 20000,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 3
  {
    title: 'Clean Streak Mastery',
    description: 'Complete 25 clean solves with zero penalties (+2 or DNF) using any method.',
    methodFilter: 'Any',
    targetCount: 25,
    maxTimeMs: null,
    penaltyAllowed: false,
    phaseSplitRequired: false
  },
  // Week 4
  {
    title: 'Phase Telemetry Drill',
    description: 'Log 40 phase-tracked solves with step-by-step telemetry.',
    methodFilter: 'Any',
    targetCount: 40,
    maxTimeMs: null,
    penaltyAllowed: true,
    phaseSplitRequired: true
  },
  // Week 5
  {
    title: 'ZZ Method Pioneer',
    description: 'Complete 35 verified solves using the ZZ method.',
    methodFilter: 'ZZ',
    targetCount: 35,
    maxTimeMs: null,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 6
  {
    title: 'Sub-15 Mastery Sprint',
    description: 'Log 20 verified solves under 15.00s using any method.',
    methodFilter: 'Any',
    targetCount: 20,
    maxTimeMs: 15000,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 7
  {
    title: 'Beginner Method Foundation',
    description: 'Complete 50 verified solves using the Beginner method.',
    methodFilter: 'Beginner',
    targetCount: 50,
    maxTimeMs: null,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 8
  {
    title: 'CFOP High Volume Marathon',
    description: 'Complete 100 verified solves using CFOP.',
    methodFilter: 'CFOP',
    targetCount: 100,
    maxTimeMs: null,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 9
  {
    title: 'Sub-25 Consistency Drill',
    description: 'Log 40 verified solves under 25.00s using any method.',
    methodFilter: 'Any',
    targetCount: 40,
    maxTimeMs: 25000,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 10
  {
    title: 'Roux Block Building Drill',
    description: 'Log 30 phase-tracked Roux solves with full telemetry.',
    methodFilter: 'Roux',
    targetCount: 30,
    maxTimeMs: null,
    penaltyAllowed: true,
    phaseSplitRequired: true
  },
  // Week 11
  {
    title: 'Sub-30 Foundation Sprint',
    description: 'Log 50 verified solves under 30.00s using any method.',
    methodFilter: 'Any',
    targetCount: 50,
    maxTimeMs: 30000,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 12
  {
    title: 'Zero Penalty Century',
    description: 'Complete 50 clean solves with zero penalties using CFOP.',
    methodFilter: 'CFOP',
    targetCount: 50,
    maxTimeMs: null,
    penaltyAllowed: false,
    phaseSplitRequired: false
  },
  // Week 13
  {
    title: 'ZZ EOLine Efficiency Drill',
    description: 'Log 30 phase-tracked ZZ solves with full phase telemetry.',
    methodFilter: 'ZZ',
    targetCount: 30,
    maxTimeMs: null,
    penaltyAllowed: true,
    phaseSplitRequired: true
  },
  // Week 14
  {
    title: 'Sub-18 Advanced Sprint',
    description: 'Log 25 verified solves under 18.00s using CFOP.',
    methodFilter: 'CFOP',
    targetCount: 25,
    maxTimeMs: 18000,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 15
  {
    title: 'Roux Speed Sprint',
    description: 'Log 25 verified solves under 22.00s using Roux.',
    methodFilter: 'Roux',
    targetCount: 25,
    maxTimeMs: 22000,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 16
  {
    title: 'Beginner Phase Precision',
    description: 'Log 30 phase-tracked solves using the Beginner method.',
    methodFilter: 'Beginner',
    targetCount: 30,
    maxTimeMs: null,
    penaltyAllowed: true,
    phaseSplitRequired: true
  },
  // Week 17
  {
    title: 'Sub-12 Elite Challenge',
    description: 'Log 15 verified solves under 12.00s using any method.',
    methodFilter: 'Any',
    targetCount: 15,
    maxTimeMs: 12000,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 18
  {
    title: 'CFOP Phase Telemetry Drill',
    description: 'Log 50 phase-tracked solves using CFOP.',
    methodFilter: 'CFOP',
    targetCount: 50,
    maxTimeMs: null,
    penaltyAllowed: true,
    phaseSplitRequired: true
  },
  // Week 19
  {
    title: 'Clean Streak Volume Blitz',
    description: 'Complete 40 clean solves without any +2 or DNF penalties.',
    methodFilter: 'Any',
    targetCount: 40,
    maxTimeMs: null,
    penaltyAllowed: false,
    phaseSplitRequired: false
  },
  // Week 20
  {
    title: 'ZZ Method Endurance',
    description: 'Complete 60 verified solves using the ZZ method.',
    methodFilter: 'ZZ',
    targetCount: 60,
    maxTimeMs: null,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 21
  {
    title: 'Sub-40 Beginner Blitz',
    description: 'Log 30 verified solves under 40.00s using Beginner method.',
    methodFilter: 'Beginner',
    targetCount: 30,
    maxTimeMs: 40000,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 22
  {
    title: 'Roux High Volume Marathon',
    description: 'Complete 75 verified solves using the Roux method.',
    methodFilter: 'Roux',
    targetCount: 75,
    maxTimeMs: null,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 23
  {
    title: 'Sub-20 Clean Sprint',
    description: 'Log 20 clean solves under 20.00s with zero penalties.',
    methodFilter: 'Any',
    targetCount: 20,
    maxTimeMs: 20000,
    penaltyAllowed: false,
    phaseSplitRequired: false
  },
  // Week 24
  {
    title: 'Phase Mastery Challenge',
    description: 'Log 60 phase-tracked solves with step-by-step telemetry.',
    methodFilter: 'Any',
    targetCount: 60,
    maxTimeMs: null,
    penaltyAllowed: true,
    phaseSplitRequired: true
  },
  // Week 25
  {
    title: 'Sub-16 CFOP Sprint',
    description: 'Log 25 verified solves under 16.00s using CFOP.',
    methodFilter: 'CFOP',
    targetCount: 25,
    maxTimeMs: 16000,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 26
  {
    title: 'Mid-Year Speed Celebration',
    description: 'Complete 100 verified solves using any speedcubing method.',
    methodFilter: 'Any',
    targetCount: 100,
    maxTimeMs: null,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 27
  {
    title: 'Roux Sub-25 Sprint',
    description: 'Log 30 verified solves under 25.00s using Roux.',
    methodFilter: 'Roux',
    targetCount: 30,
    maxTimeMs: 25000,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 28
  {
    title: 'ZZ Clean Streak Challenge',
    description: 'Complete 30 clean solves with zero penalties using ZZ.',
    methodFilter: 'ZZ',
    targetCount: 30,
    maxTimeMs: null,
    penaltyAllowed: false,
    phaseSplitRequired: false
  },
  // Week 29
  {
    title: 'Sub-14 Advanced Sprint',
    description: 'Log 20 verified solves under 14.00s using any method.',
    methodFilter: 'Any',
    targetCount: 20,
    maxTimeMs: 14000,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 30
  {
    title: 'Beginner Method Mastery',
    description: 'Complete 60 verified solves using the Beginner method.',
    methodFilter: 'Beginner',
    targetCount: 60,
    maxTimeMs: null,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 31
  {
    title: 'CFOP F2L Telemetry Drill',
    description: 'Log 40 phase-tracked CFOP solves with full phase telemetry.',
    methodFilter: 'CFOP',
    targetCount: 40,
    maxTimeMs: null,
    penaltyAllowed: true,
    phaseSplitRequired: true
  },
  // Week 32
  {
    title: 'Sub-22 Volume Blitz',
    description: 'Log 45 verified solves under 22.00s using any method.',
    methodFilter: 'Any',
    targetCount: 45,
    maxTimeMs: 22000,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 33
  {
    title: 'Zero Penalty Roux Drill',
    description: 'Complete 30 clean solves with zero penalties using Roux.',
    methodFilter: 'Roux',
    targetCount: 30,
    maxTimeMs: null,
    penaltyAllowed: false,
    phaseSplitRequired: false
  },
  // Week 34
  {
    title: 'Sub-15 CFOP Precision',
    description: 'Log 20 verified solves under 15.00s using CFOP.',
    methodFilter: 'CFOP',
    targetCount: 20,
    maxTimeMs: 15000,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 35
  {
    title: 'ZZ Sub-25 Sprint',
    description: 'Log 25 verified solves under 25.00s using the ZZ method.',
    methodFilter: 'ZZ',
    targetCount: 25,
    maxTimeMs: 25000,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 36
  {
    title: 'Phase Telemetry Marathon',
    description: 'Log 50 phase-tracked solves with step-by-step telemetry.',
    methodFilter: 'Any',
    targetCount: 50,
    maxTimeMs: null,
    penaltyAllowed: true,
    phaseSplitRequired: true
  },
  // Week 37
  {
    title: 'Sub-10 Pro Challenge',
    description: 'Log 10 verified solves under 10.00s using any method.',
    methodFilter: 'Any',
    targetCount: 10,
    maxTimeMs: 10000,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 38
  {
    title: 'CFOP Century Endurance',
    description: 'Complete 80 verified solves using CFOP.',
    methodFilter: 'CFOP',
    targetCount: 80,
    maxTimeMs: null,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 39
  {
    title: 'Sub-35 Beginner Sprint',
    description: 'Log 25 verified solves under 35.00s using Beginner method.',
    methodFilter: 'Beginner',
    targetCount: 25,
    maxTimeMs: 35000,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 40
  {
    title: 'Roux Block Precision Drill',
    description: 'Log 40 phase-tracked Roux solves with full block telemetry.',
    methodFilter: 'Roux',
    targetCount: 40,
    maxTimeMs: null,
    penaltyAllowed: true,
    phaseSplitRequired: true
  },
  // Week 41
  {
    title: 'Clean Streak Century',
    description: 'Complete 50 clean solves without any penalties using any method.',
    methodFilter: 'Any',
    targetCount: 50,
    maxTimeMs: null,
    penaltyAllowed: false,
    phaseSplitRequired: false
  },
  // Week 42
  {
    title: 'Sub-19 CFOP Blitz',
    description: 'Log 35 verified solves under 19.00s using CFOP.',
    methodFilter: 'CFOP',
    targetCount: 35,
    maxTimeMs: 19000,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 43
  {
    title: 'ZZ Phase Telemetry Drill',
    description: 'Log 35 phase-tracked solves using the ZZ method.',
    methodFilter: 'ZZ',
    targetCount: 35,
    maxTimeMs: null,
    penaltyAllowed: true,
    phaseSplitRequired: true
  },
  // Week 44
  {
    title: 'Sub-20 Volume Sprint',
    description: 'Log 40 verified solves under 20.00s using any method.',
    methodFilter: 'Any',
    targetCount: 40,
    maxTimeMs: 20000,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 45
  {
    title: 'Roux Endurance Build',
    description: 'Complete 60 verified solves using the Roux method.',
    methodFilter: 'Roux',
    targetCount: 60,
    maxTimeMs: null,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 46
  {
    title: 'Sub-13 Elite Sprint',
    description: 'Log 15 verified solves under 13.00s using any method.',
    methodFilter: 'Any',
    targetCount: 15,
    maxTimeMs: 13000,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 47
  {
    title: 'Beginner Clean Streak',
    description: 'Complete 30 clean solves with zero penalties using Beginner method.',
    methodFilter: 'Beginner',
    targetCount: 30,
    maxTimeMs: null,
    penaltyAllowed: false,
    phaseSplitRequired: false
  },
  // Week 48
  {
    title: 'CFOP Sub-17 Challenge',
    description: 'Log 30 verified solves under 17.00s using CFOP.',
    methodFilter: 'CFOP',
    targetCount: 30,
    maxTimeMs: 17000,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 49
  {
    title: 'Phase Telemetry Mastery',
    description: 'Log 45 phase-tracked solves with step-by-step telemetry.',
    methodFilter: 'Any',
    targetCount: 45,
    maxTimeMs: null,
    penaltyAllowed: true,
    phaseSplitRequired: true
  },
  // Week 50
  {
    title: 'ZZ Method Marathon',
    description: 'Complete 50 verified solves using the ZZ method.',
    methodFilter: 'ZZ',
    targetCount: 50,
    maxTimeMs: null,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 51
  {
    title: 'Sub-15 Consistency Blitz',
    description: 'Log 25 verified solves under 15.00s using any method.',
    methodFilter: 'Any',
    targetCount: 25,
    maxTimeMs: 15000,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 52
  {
    title: 'Year-End Volume Showdown',
    description: 'Complete 100 verified solves to wrap up the cubing year.',
    methodFilter: 'Any',
    targetCount: 100,
    maxTimeMs: null,
    penaltyAllowed: true,
    phaseSplitRequired: false
  },
  // Week 53 (Leap Year / ISO Week 53)
  {
    title: 'Grand Finale Speed Festival',
    description: 'Complete 53 verified solves in ISO Week 53 celebration.',
    methodFilter: 'Any',
    targetCount: 53,
    maxTimeMs: null,
    penaltyAllowed: true,
    phaseSplitRequired: false
  }
];

module.exports = { WEEKLY_CHALLENGE_POOL };
