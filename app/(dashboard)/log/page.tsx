'use client'

import { useState, useEffect } from 'react'
import { addDays, differenceInDays, format, parseISO, startOfWeek, subDays } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import Icon from '@/components/ui/Icon'
import { cn } from '@/lib/utils'
import type { Habit, HabitEntry, HabitStatus } from '@/lib/types'
import AddHabitModal from '@/components/log/AddHabitModal'
import { useApp } from '@/components/providers/AppProvider'

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d: Date): string {
  return format(d, 'yyyy-MM-dd')
}

function isHabitActiveForDate(habit: Habit, date: Date): boolean {
  const dateStr = fmtDate(date)
  if (dateStr < habit.startDate) return false
  if (habit.endCondition === 'on_date' && habit.endDate && dateStr > habit.endDate) return false

  const { repeat } = habit
  if (repeat.type === 'daily') {
    return repeat.days.length === 0 || repeat.days.includes(date.getDay())
  }
  if (repeat.type === 'monthly') {
    return repeat.days.includes(date.getDate())
  }
  const start = parseISO(habit.startDate)
  const diff = differenceInDays(date, start)
  return diff >= 0 && diff % repeat.everyDays === 0
}

function frequencyText(habit: Habit): string {
  const { repeat } = habit
  if (repeat.type === 'daily') {
    if (repeat.days.length === 0 || repeat.days.length === 7) return 'Daily'
    const names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    return [...repeat.days].sort().map((d) => names[d]).join(', ')
  }
  if (repeat.type === 'monthly') return 'Monthly'
  return `Every ${repeat.everyDays} day${repeat.everyDays !== 1 ? 's' : ''}`
}

const STATUS_CONFIG: Record<
  HabitStatus,
  { label: string; textColor: string; bgColor: string; dotColor: string }
> = {
  pending: {
    label: 'Pending',
    textColor: 'text-on-surface-variant',
    bgColor: 'bg-surface-container-high',
    dotColor: 'bg-on-surface-variant/40',
  },
  success: {
    label: 'Success',
    textColor: 'text-secondary',
    bgColor: 'bg-secondary/15',
    dotColor: 'bg-secondary',
  },
  skipped: {
    label: 'Skipped',
    textColor: 'text-tertiary',
    bgColor: 'bg-tertiary/15',
    dotColor: 'bg-tertiary',
  },
  failed: {
    label: 'Fail',
    textColor: 'text-error',
    bgColor: 'bg-error/10',
    dotColor: 'bg-error',
  },
}

const HABIT_COLORS = [
  { iconColor: 'text-secondary', iconBg: 'bg-secondary/15' },
  { iconColor: 'text-tertiary',  iconBg: 'bg-tertiary/15'  },
  { iconColor: 'text-primary',   iconBg: 'bg-primary/10'   },
  { iconColor: 'text-error',     iconBg: 'bg-error/10'     },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function LogPage() {
  const { habits, habitEntries, addHabit, updateHabit, deleteHabit, upsertHabitEntry } = useApp()
  const todayStr = fmtDate(new Date())

  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [weekStart, setWeekStart] = useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  )
  const [modalOpen, setModalOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [pendingAmounts, setPendingAmounts] = useState<Record<string, string>>({})

  useEffect(() => {
    if (!openMenuId) return
    function close() { setOpenMenuId(null) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [openMenuId])

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const isReadOnly = selectedDate < todayStr

  // ── Entry helpers ────────────────────────────────────────────────────────────

  function getEntry(habitId: string): HabitEntry | undefined {
    return habitEntries.find((e) => e.habitId === habitId && e.date === selectedDate)
  }

  function getStatus(habitId: string): HabitStatus {
    return getEntry(habitId)?.status ?? 'pending'
  }

  function getAmount(habitId: string): number {
    return getEntry(habitId)?.amount ?? 0
  }

  async function confirmAmount(habit: Habit) {
    const raw = pendingAmounts[habit.id] ?? String(getAmount(habit.id))
    const amt = Math.max(0, parseInt(raw) || 0)
    await upsertHabitEntry({ habitId: habit.id, date: selectedDate, status: 'success', amount: amt })
    setPendingAmounts((prev) => { const n = { ...prev }; delete n[habit.id]; return n })
  }

  async function clearEntry(habitId: string) {
    await upsertHabitEntry({ habitId, date: selectedDate, status: 'pending', amount: 0 })
    setPendingAmounts((prev) => { const n = { ...prev }; delete n[habitId]; return n })
  }

  async function setStatus(habitId: string, status: HabitStatus) {
    const amount = getAmount(habitId)
    await upsertHabitEntry({ habitId, date: selectedDate, status, amount })
    setOpenMenuId(null)
  }

  // ── Habit CRUD ───────────────────────────────────────────────────────────────

  async function saveHabit(habit: Habit) {
    if (editingHabit) {
      await updateHabit(habit)
    } else {
      const { id: _id, ...rest } = habit
      await addHabit(rest)
    }
    setEditingHabit(null)
    setModalOpen(false)
  }

  async function handleDeleteHabit(id: string) {
    await deleteHabit(id)
    setEditingHabit(null)
    setModalOpen(false)
  }

  function openAddModal() {
    setEditingHabit(null)
    setModalOpen(true)
  }

  function openEditModal(habit: Habit) {
    setEditingHabit(habit)
    setModalOpen(true)
    setOpenMenuId(null)
  }

  // ── Derived ──────────────────────────────────────────────────────────────────

  const selectedDateObj = parseISO(selectedDate)
  const activeHabits = habits.filter((h) => isHabitActiveForDate(h, selectedDateObj))

  const todayHabits = habits.filter((h) => isHabitActiveForDate(h, parseISO(todayStr)))
  const todaySuccesses = todayHabits.filter(
    (h) => habitEntries.find((e) => e.habitId === h.id && e.date === todayStr)?.status === 'success'
  )
  const scorePercent =
    todayHabits.length === 0
      ? 0
      : Math.round((todaySuccesses.length / todayHabits.length) * 100)

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="px-6 py-8 max-w-screen-xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">

        {/* ── Left column ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Page header */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">
              Tracker
            </p>
            <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">
              Daily Activity Log
            </h1>
          </div>

          {/* Date strip */}
          <div className="bg-surface-container-lowest rounded-lg shadow-card px-3 py-3">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setWeekStart((prev) => subDays(prev, 7))}
                className="w-8 h-8 rounded flex items-center justify-center hover:bg-surface-container-high transition-colors shrink-0"
              >
                <Icon name="chevron_left" size={20} className="text-on-surface-variant" />
              </button>

              <div className="flex-1 grid grid-cols-7 gap-1">
                {weekDays.map((day) => {
                  const dateStr = fmtDate(day)
                  const isSelected = dateStr === selectedDate
                  const isToday = dateStr === todayStr
                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={cn(
                        'flex flex-col items-center gap-0.5 py-2 rounded transition-all',
                        isSelected
                          ? 'bg-primary text-white'
                          : isToday
                          ? 'bg-primary/10 text-primary'
                          : 'text-on-surface-variant hover:bg-surface-container-high'
                      )}
                    >
                      <span className="text-[10px] font-bold tracking-wide">
                        {format(day, 'EEE').toUpperCase()}
                      </span>
                      <span className="text-sm font-bold">{format(day, 'd')}</span>
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setWeekStart((prev) => addDays(prev, 7))}
                className="w-8 h-8 rounded flex items-center justify-center hover:bg-surface-container-high transition-colors shrink-0"
              >
                <Icon name="chevron_right" size={20} className="text-on-surface-variant" />
              </button>
            </div>
          </div>

          {/* Habit table */}
          <div className="bg-surface-container-lowest rounded-lg shadow-card overflow-visible">

            {/* Table header */}
            <div
              className="grid items-center px-6 py-4 border-b border-surface-container-high"
              style={{ gridTemplateColumns: '1fr 100px 130px 110px 180px' }}
            >
              {['Activity Name', 'Progress', 'Frequency', 'Status', 'Quick Actions'].map(
                (col, i) => (
                  <span
                    key={col}
                    className={cn(
                      'text-xs font-bold uppercase tracking-wider text-on-surface-variant/60',
                      i === 4 && 'text-right pr-1'
                    )}
                  >
                    {col}
                  </span>
                )
              )}
            </div>

            {/* Rows */}
            {activeHabits.length === 0 ? (
              <div className="py-14 text-center">
                <Icon name="event_busy" size={32} className="text-on-surface-variant/30 mx-auto mb-2" />
                <p className="text-sm text-on-surface-variant">No habits scheduled for this day.</p>
              </div>
            ) : (
              activeHabits.map((habit, idx) => {
                const status = getStatus(habit.id)
                const amount = getAmount(habit.id)
                const statusCfg = STATUS_CONFIG[status]
                const colorCfg = HABIT_COLORS[idx % HABIT_COLORS.length]
                const pendingAmt =
                  pendingAmounts[habit.id] !== undefined
                    ? pendingAmounts[habit.id]
                    : String(amount)
                const isMenuOpen = openMenuId === habit.id

                return (
                  <div
                    key={habit.id}
                    className="group/row grid items-center px-6 py-4 border-b border-surface-container-high/50 last:border-0 hover:bg-surface-container-low/40 transition-colors"
                    style={{ gridTemplateColumns: '1fr 100px 130px 110px 180px' }}
                  >
                    {/* Activity name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          'w-9 h-9 rounded flex items-center justify-center shrink-0',
                          colorCfg.iconBg
                        )}
                      >
                        <Icon name={habit.icon} filled size={18} className={colorCfg.iconColor} />
                      </div>
                      <span className="font-semibold text-on-surface text-sm truncate">
                        {habit.name}
                      </span>
                    </div>

                    {/* Progress */}
                    <span className="text-sm text-on-surface-variant tabular-nums">
                      {amount}/{habit.goalAmount}
                    </span>

                    {/* Frequency */}
                    <span className="text-sm text-on-surface-variant">{frequencyText(habit)}</span>

                    {/* Status badge */}
                    <div>
                      <span
                        className={cn(
                          'inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold',
                          statusCfg.bgColor,
                          statusCfg.textColor
                        )}
                      >
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Quick actions */}
                    <div className="flex items-center justify-end gap-2">

                      {isReadOnly ? (
                        <span className="text-xs text-on-surface-variant/40 italic">read-only</span>
                      ) : status === 'pending' ? (
                        /* Pending: hidden until row hover */
                        <div className="flex items-center rounded border border-surface-container-high overflow-hidden bg-surface-container-low opacity-0 group-hover/row:opacity-100 transition-all">
                          <input
                            type="number"
                            min={0}
                            max={999}
                            value={pendingAmt}
                            onChange={(e) =>
                              setPendingAmounts((prev) => ({
                                ...prev,
                                [habit.id]: e.target.value,
                              }))
                            }
                            onKeyDown={(e) => e.key === 'Enter' && confirmAmount(habit)}
                            className="w-14 px-2 py-1.5 text-sm text-on-surface bg-transparent outline-none text-center"
                          />
                          <button
                            onClick={() => confirmAmount(habit)}
                            title="Confirm"
                            className="px-2 py-1.5 bg-secondary/20 hover:bg-secondary/35 transition-colors border-l border-surface-container-high"
                          >
                            <Icon name="check" size={14} className="text-secondary" />
                          </button>
                        </div>
                      ) : (
                        /* Non-pending: Clear button — shows on hover */
                        <button
                          onClick={() => clearEntry(habit.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold text-on-surface-variant border border-surface-container-high hover:bg-surface-container-high transition-all opacity-0 group-hover/row:opacity-100"
                        >
                          <Icon name="close" size={13} />
                          Clear
                        </button>
                      )}

                      {/* Three-dot menu — shows on hover (or when open) */}
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setOpenMenuId(isMenuOpen ? null : habit.id)
                          }}
                          disabled={isReadOnly}
                          className={cn(
                            'w-8 h-8 rounded flex items-center justify-center transition-all',
                            isReadOnly
                              ? 'opacity-30 cursor-not-allowed'
                              : isMenuOpen
                              ? 'bg-surface-container-high opacity-100'
                              : 'hover:bg-surface-container-high opacity-0 group-hover/row:opacity-100'
                          )}
                        >
                          <Icon name="more_vert" size={18} className="text-on-surface-variant" />
                        </button>

                        <AnimatePresence>
                          {isMenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: -4 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: -4 }}
                              transition={{ duration: 0.12 }}
                              className="absolute right-0 top-full mt-1 w-44 bg-surface-container-lowest rounded-lg shadow-lg border border-surface-container-high z-50 overflow-hidden"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <p className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/50">
                                Set Status
                              </p>
                              {(
                                ['pending', 'success', 'skipped', 'failed'] as HabitStatus[]
                              ).map((s) => (
                                <button
                                  key={s}
                                  onClick={() => setStatus(habit.id, s)}
                                  className={cn(
                                    'flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors hover:bg-surface-container-low',
                                    status === s
                                      ? 'font-semibold text-on-surface'
                                      : 'text-on-surface-variant'
                                  )}
                                >
                                  <span
                                    className={cn(
                                      'w-2 h-2 rounded-full shrink-0',
                                      STATUS_CONFIG[s].dotColor
                                    )}
                                  />
                                  {STATUS_CONFIG[s].label}
                                  {status === s && (
                                    <Icon name="check" size={13} className="ml-auto text-primary" />
                                  )}
                                </button>
                              ))}
                              <div className="border-t border-surface-container-high mx-3 my-1" />
                              <button
                                onClick={() => openEditModal(habit)}
                                className="flex items-center gap-3 w-full px-4 py-2.5 pb-3 text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors"
                              >
                                <Icon name="edit" size={14} />
                                Edit Habit
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Add habit button */}
          <div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-5 py-3 rounded bg-primary text-white font-semibold text-sm hover:opacity-90 active:scale-95 transition-all shadow-card"
            >
              <Icon name="add" size={18} />
              Add New Habit
            </button>
          </div>
        </div>

        {/* ── Right sidebar (mocked) ───────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {/* Curator's Insight */}
          <div className="bg-surface-container-lowest rounded-lg shadow-card overflow-hidden">
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">
                  Curator's Insight
                </p>
                <button className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center hover:bg-surface-container transition-colors">
                  <Icon name="add" size={15} className="text-on-surface-variant" />
                </button>
              </div>
              <h3 className="font-bold text-on-surface mb-2">Hydration Spike</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Your water intake has increased by 15% this week. Studies show this level of
                hydration can improve cognitive focus by up to 20% during afternoon peaks.
              </p>
            </div>
            <div className="mx-5 mb-4 p-4 bg-surface-container-low rounded">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-yellow-400 text-xs">★</span>
                <p className="text-xs font-semibold text-on-surface">Wellness Tip</p>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Try linking your vitamin routine to your morning meditation. Ritual stacking
                increases habit retention by 3×.
              </p>
            </div>
            <div className="px-5 pb-5">
              <button className="w-full py-2.5 rounded bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
                Explore Full Report →
              </button>
            </div>
          </div>

          {/* Today's Daily Score */}
          <div className="bg-surface-container-lowest rounded-lg shadow-card overflow-hidden">
            <div className="px-5 pt-5 pb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant/60">
                  Today's Daily Score
                </p>
                <button className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center hover:bg-surface-container transition-colors">
                  <Icon name="chevron_right" size={15} className="text-on-surface-variant" />
                </button>
              </div>
              <p className="text-6xl font-extrabold text-on-surface tracking-tight leading-none">
                {scorePercent}%
              </p>
              <p className="text-xs text-on-surface-variant mt-2.5 leading-relaxed">
                {scorePercent >= 80
                  ? "You're in the top 5% of health trackers this month."
                  : scorePercent >= 50
                  ? 'Great progress — keep it up today!'
                  : 'Still time to log your habits today!'}
              </p>
            </div>
            <div className="h-28 bg-gradient-to-br from-secondary/25 via-tertiary/15 to-primary/10 flex items-center justify-center">
              <Icon name="local_florist" filled size={52} className="text-secondary/35" />
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <AddHabitModal
            initialHabit={editingHabit}
            onSave={saveHabit}
            onDelete={editingHabit ? handleDeleteHabit : undefined}
            onCancel={() => { setModalOpen(false); setEditingHabit(null) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
