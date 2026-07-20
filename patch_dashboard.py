import sys

def main():
    with open('test-dashboard.tsx', 'r') as f:
        content = f.read()

    # Chunk 1
    content = content.replace(
        'import { getHabits, createHabit, logHabitCompletion } from "@/server/actions/habits"',
        'import { getHabits, createHabit, logHabitCompletion } from "@/server/actions/habits"\nimport { getSnapshots } from "@/server/actions/progress"'
    )

    # Chunk 2
    content = content.replace(
        '  const [meals, setMeals] = useState<unknown[]>([])\n  const [workouts, setWorkouts] = useState<unknown[]>([])\n  const [habits, setHabits] = useState<unknown[]>([])',
        '  const [meals, setMeals] = useState<any[]>([])\n  const [workouts, setWorkouts] = useState<any[]>([])\n  const [habits, setHabits] = useState<any[]>([])\n  const [snapshots, setSnapshots] = useState<any[]>([])'
    )

    # Chunk 3
    content = content.replace(
        '''        const [mealsRes, workoutsRes, habitsRes] = await Promise.all([
          getMeals(),
          getWorkouts(),
          getHabits()
        ])
        
        if (mealsRes.error) throw new Error(mealsRes.error)
        if (workoutsRes.error) throw new Error(workoutsRes.error)
        if (habitsRes.error) throw new Error(habitsRes.error)

        const meals = mealsRes.data || []
        const workouts = workoutsRes.data || []
        const habits = habitsRes.data || []''',
        '''        const [mealsRes, workoutsRes, habitsRes, snapRes] = await Promise.all([
          getMeals(),
          getWorkouts(),
          getHabits(),
          getSnapshots()
        ])
        
        if (mealsRes.error) throw new Error(mealsRes.error)
        if (workoutsRes.error) throw new Error(workoutsRes.error)
        if (habitsRes.error) throw new Error(habitsRes.error)
        if (snapRes.error) throw new Error(snapRes.error)

        const meals = mealsRes.data || []
        const workouts = workoutsRes.data || []
        const habits = habitsRes.data || []
        const snapshots = snapRes.data || []
        setSnapshots(snapshots)'''
    )

    # Chunk 4
    content = content.replace(
        '  const insightPanel = (',
        '''  const today = new Date().toISOString().split('T')[0];
  const mealsToday = meals?.filter(m => m.logged_at?.startsWith(today)) || [];
  const caloriesToday = mealsToday.reduce((sum, m) => sum + (m.calories_estimate || 0), 0);
  const calorieGoal = profile?.target_calories || 2000;

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const workoutsThisWeek = workouts?.filter(w => new Date(w.date) >= startOfWeek) || [];
  
  const totalStreak = habits?.reduce((sum, h) => sum + (h.streak_count || 0), 0) || 0;

  const sortedSnapshots = [...(snapshots || [])].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const latestWeight = sortedSnapshots[0];
  const lastWeekSnapshot = sortedSnapshots.find(s => {
    const daysDiff = (new Date(sortedSnapshots[0].date).getTime() - new Date(s.date).getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff >= 7;
  });
  const weightChange = latestWeight && lastWeekSnapshot 
    ? latestWeight.weight - lastWeekSnapshot.weight 
    : 0;

  const insightPanel = ('''
    )

    # Chunk 5
    content = content.replace(
        '''        {!loading && !error && (
          <div className="text-[var(--text-secondary)] font-sans text-base sm:text-lg">
            {workoutsCount > 0 ? (
              <p>You&apos;re crushing it! <span className="text-[var(--status-positive)] font-bold">{workoutsCount}</span> workouts this week.</p>
            ) : (
              <p>Let&apos;s get started! Log your first workout.</p>
            )}
          </div>
        )}''',
        '''        {!loading && !error && (
          <div className="text-[var(--text-secondary)] font-sans text-base sm:text-lg">
            <p className="text-[var(--text-secondary)]">
              {workoutsThisWeek.length > 0 
                ? `You're crushing it! ${workoutsThisWeek.length} workouts this week.` 
                : mealsToday.length > 0 
                  ? `Great start! ${mealsToday.length} meals logged today.`
                  : "Let's get started! Log your first activity."
              }
            </p>
          </div>
        )}'''
    )

    # Chunk 6, 7, 8, 9
    old_cards = '''        {/* Stat Card 1: Calories */}
        <motion.div variants={item}>
          {meals.length === 0 ? (
            <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)] text-center h-full flex flex-col items-center justify-center">
              <p className="text-[var(--text-secondary)] mb-2">No data yet</p>
              <p className="text-sm text-[var(--text-secondary)] mb-4">Start tracking to see your progress</p>
              <Link href="/meals" className="bg-[var(--accent-primary)] text-white px-4 py-2 rounded-full text-sm">
                Get Started
              </Link>
            </div>
          ) : (
            <Card className="h-full hover:border-panel-accent/50 transition-colors cursor-default">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center mb-4">
                  <Flame className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-text-secondary mb-1">Calories</h3>
                <div className="font-fredoka text-3xl font-bold text-text-primary mb-2">
                  <CountUp end={calories} /> <span className="text-base text-text-secondary font-sans font-normal">/ 2400</span>
                </div>
                <div className="text-xs font-medium px-3 py-1 bg-[var(--bg-panel-accent)]/30 text-teal-800 rounded-full mt-auto">
                  Goal: Weight Loss
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Stat Card 2: Workouts */}
        <motion.div variants={item}>
          {workouts.length === 0 ? (
            <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)] text-center h-full flex flex-col items-center justify-center">
              <p className="text-[var(--text-secondary)] mb-2">No data yet</p>
              <p className="text-sm text-[var(--text-secondary)] mb-4">Start tracking to see your progress</p>
              <Link href="/workouts" className="bg-[var(--accent-primary)] text-white px-4 py-2 rounded-full text-sm">
                Get Started
              </Link>
            </div>
          ) : (
            <Card className="h-full hover:border-panel-accent/50 transition-colors cursor-default">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-panel-accent)]/50 text-[var(--text-primary)] flex items-center justify-center mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-text-secondary mb-1">Workouts</h3>
                <div className="font-fredoka text-3xl font-bold text-text-primary mb-2">
                  <CountUp end={workoutsCount} /> <span className="text-base text-text-secondary font-sans font-normal">/ 5 days</span>
                </div>
                <div className="w-full mt-auto pt-4 flex gap-1 h-8 items-end justify-center">
                  {[1, 1, 1, 1, 0, 0, 0].map((active, i) => (
                    <div key={i} className={`w-full rounded-sm ${active ? 'bg-[var(--bg-panel-accent)] h-full' : 'bg-[var(--border-color)] h-1/3'}`} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Stat Card 3: Habits */}
        <motion.div variants={item}>
          {habits.length === 0 ? (
            <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)] text-center h-full flex flex-col items-center justify-center">
              <p className="text-[var(--text-secondary)] mb-2">No data yet</p>
              <p className="text-sm text-[var(--text-secondary)] mb-4">Start tracking to see your progress</p>
              <Link href="/habits" className="bg-[var(--accent-primary)] text-white px-4 py-2 rounded-full text-sm">
                Get Started
              </Link>
            </div>
          ) : (
            <Card className="h-full hover:border-panel-accent/50 transition-colors cursor-default">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--status-positive)]/10 text-[var(--status-positive)] flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-text-secondary mb-1">Active Habits</h3>
                <div className="font-fredoka text-3xl font-bold text-text-primary mb-2">
                  <CountUp end={habits.length} /> <span className="text-base text-text-secondary font-sans font-normal">tracking</span>
                </div>
                <div className="text-xs font-medium text-status-positive mt-auto flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 rotate-90" /> On Track
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>'''
    
    new_cards = '''        {/* Stat Card 1: Calories */}
        <motion.div variants={item} className="sm:col-span-2 md:col-span-3">
          {mealsToday.length > 0 ? (
            <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-fredoka text-[var(--text-primary)]">Calories Today</h3>
                <span className="text-sm text-[var(--status-positive)] font-medium">
                  {Math.round((caloriesToday / calorieGoal) * 100)}% of goal
                </span>
              </div>
              <div className="text-4xl font-fredoka text-[var(--text-primary)] mb-2">
                {caloriesToday}
                <span className="text-lg text-[var(--text-secondary)] font-normal"> / {calorieGoal} kcal</span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-3 bg-[var(--border-color)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((caloriesToday / calorieGoal) * 100, 100)}%` }}
                />
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-3">
                {caloriesToday > calorieGoal 
                  ? "You've hit your target! 🔥" 
                  : `${calorieGoal - caloriesToday} kcal remaining`}
              </p>
            </div>
          ) : (
            <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)] text-center">
              <p className="text-[var(--text-secondary)] mb-4">No meals logged today</p>
              <Link href="/meals" className="inline-block bg-[var(--accent-primary)] text-white px-4 py-2 rounded-full text-sm">
                Log a Meal
              </Link>
            </div>
          )}
        </motion.div>

        {/* Stat Card 2: Workouts */}
        <motion.div variants={item}>
          <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)] h-full">
            <h3 className="text-base font-fredoka text-[var(--text-primary)] mb-3">Weekly Workouts</h3>
            {workoutsThisWeek.length > 0 ? (
              <>
                <div className="text-3xl font-fredoka text-[var(--text-primary)] mb-1">
                  {workoutsThisWeek.length}<span className="text-lg text-[var(--text-secondary)]">/5</span>
                </div>
                <div className="flex gap-1 mt-3">
                  {['M','T','W','T','F','S','S'].map((day, i) => {
                    const hasWorkout = workoutsThisWeek.some(w => {
                      const d = new Date(w.date);
                      return d.getDay() === (i + 1) % 7; // adjust based on your week start
                    });
                    return (
                      <div 
                        key={day + i} 
                        className={`flex-1 h-8 rounded-md flex items-center justify-center text-xs font-medium ${
                          hasWorkout 
                            ? 'bg-[var(--accent-primary)] text-white' 
                            : 'bg-[var(--border-color)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">No workouts this week</p>
            )}
          </div>
        </motion.div>

        {/* Stat Card 3: Active Streaks */}
        <motion.div variants={item}>
          <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)] h-full">
            <h3 className="text-base font-fredoka text-[var(--text-primary)] mb-3">Active Streaks</h3>
            {totalStreak > 0 ? (
              <div className="flex items-center gap-3">
                <div className="text-4xl">🔥</div>
                <div>
                  <div className="text-3xl font-fredoka text-[var(--accent-primary)]">{totalStreak}</div>
                  <div className="text-sm text-[var(--text-secondary)]">days total</div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">No streaks yet. Start a habit!</p>
            )}
          </div>
        </motion.div>

        {/* Stat Card 4: Weight */}
        <motion.div variants={item}>
          <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)] h-full">
            <h3 className="text-base font-fredoka text-[var(--text-primary)] mb-3">Weight</h3>
            {latestWeight ? (
              <>
                <div className="text-3xl font-fredoka text-[var(--text-primary)]">
                  {latestWeight.weight} <span className="text-lg text-[var(--text-secondary)]">lbs</span>
                </div>
                {weightChange !== 0 && (
                  <div className={`text-sm font-medium mt-2 ${
                    weightChange < 0 ? 'text-[var(--status-positive)]' : 'text-[var(--status-warning)]'
                  }`}>
                    {weightChange > 0 ? '↑' : '↓'} {Math.abs(weightChange).toFixed(1)} lbs vs last week
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">No weight logged</p>
            )}
          </div>
        </motion.div>'''
    
    content = content.replace(old_cards, new_cards)

    with open('src/app/dashboard/page.tsx', 'w') as f:
        f.write(content)

if __name__ == "__main__":
    main()
