'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import Icon from '@/components/ui/Icon'
import { cn } from '@/lib/utils'
import type { Habit, HabitCategory, HabitRepeat, GoalPer, EndCondition } from '@/lib/types'

const WEEK_DAYS = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
  { label: 'Sun', value: 0 },
]

const CATEGORY_OPTIONS: { value: HabitCategory; label: string; icon: string; defaultIcon: string }[] = [
  { value: 'medication', label: 'Medication',  icon: 'medication',       defaultIcon: 'medication'       },
  { value: 'health',     label: 'Health',       icon: 'favorite',         defaultIcon: 'water_drop'       },
  { value: 'lifestyle',  label: 'Lifestyle',    icon: 'self_improvement', defaultIcon: 'self_improvement' },
]

const GOAL_UNIT_PRESETS: Record<HabitCategory, string[]> = {
  medication: ['times', 'doses', 'tablets', 'ml'],
  health:     ['ml', 'glasses', 'minutes', 'steps', 'times'],
  lifestyle:  ['minutes', 'times', 'pages', 'hours'],
}

interface AddHabitModalProps {
  initialHabit: Habit | null
  onSave: (habit: Habit) => void
  onDelete?: (id: string) => void
  onCancel: () => void
}

export default function AddHabitModal({ initialHabit, onSave, onDelete, onCancel }: AddHabitModalProps) {
  const isEditing = initialHabit !== null

  const [name, setName]                   = useState(initialHabit?.name ?? '')
  const [category, setCategory]           = useState<HabitCategory>(initialHabit?.category ?? 'health')
  const [repeatType, setRepeatType]       = useState<'daily' | 'monthly' | 'interval'>(initialHabit?.repeat.type ?? 'daily')
  const [dailyDays, setDailyDays]         = useState<number[]>(initialHabit?.repeat.type === 'daily'    ? initialHabit.repeat.days        : [])
  const [monthlyDays, setMonthlyDays]     = useState<number[]>(initialHabit?.repeat.type === 'monthly'  ? initialHabit.repeat.days        : [])
  const [intervalDays, setIntervalDays]   = useState<number>  (initialHabit?.repeat.type === 'interval' ? initialHabit.repeat.everyDays   : 2)
  const [goalAmount, setGoalAmount]       = useState<number>(initialHabit?.goalAmount ?? 1)
  const [goalUnit, setGoalUnit]           = useState<string>(initialHabit?.goalUnit   ?? 'times')
  const [goalUnitCustom, setGoalUnitCustom] = useState(false)
  const [goalPer, setGoalPer]             = useState<GoalPer>(initialHabit?.goalPer   ?? 'day')
  const [timeOfDay, setTimeOfDay]         = useState<('morning' | 'afternoon' | 'evening')[]>(initialHabit?.timeOfDay ?? ['morning'])
  const [startDate, setStartDate]         = useState(initialHabit?.startDate ?? format(new Date(), 'yyyy-MM-dd'))
  const [endCondition, setEndCondition]   = useState<EndCondition>(initialHabit?.endCondition ?? 'never')
  const [endDate, setEndDate]             = useState(initialHabit?.endDate ?? '')
  const [dosage, setDosage]               = useState(initialHabit?.medicationDosage ?? '')
  const [freqHours, setFreqHours]         = useState<number>(initialHabit?.medicationFrequencyHours ?? 24)
  const [magicFillToast, setMagicFillToast] = useState(false)
  const [confirmDelete, setConfirmDelete]   = useState(false)

  function handleMagicFill() {
    setMagicFillToast(true)
    setTimeout(() => setMagicFillToast(false), 3000)
  }

  function handleCategoryChange(c: HabitCategory) {
    setCategory(c)
    const presets = GOAL_UNIT_PRESETS[c]
    if (!presets.includes(goalUnit)) setGoalUnit(presets[0])
    setGoalUnitCustom(false)
  }

  function toggleDailyDay(val: number) {
    setDailyDays((prev) => prev.includes(val) ? prev.filter((d) => d !== val) : [...prev, val])
  }

  function toggleMonthlyDay(day: number) {
    setMonthlyDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day])
  }

  function toggleTimeOfDay(t: 'morning' | 'afternoon' | 'evening') {
    setTimeOfDay((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])
  }

  function buildRepeat(): HabitRepeat {
    if (repeatType === 'daily')    return { type: 'daily',    days: dailyDays }
    if (repeatType === 'monthly')  return { type: 'monthly',  days: monthlyDays }
    return { type: 'interval', everyDays: Math.max(1, intervalDays) }
  }

  function handleSave() {
    if (!name.trim()) return
    const categoryDef = CATEGORY_OPTIONS.find((c) => c.value === category)!
    onSave({
      id:                        initialHabit?.id ?? `habit-${Date.now()}`,
      name:                      name.trim(),
      icon:                      initialHabit?.icon ?? categoryDef.defaultIcon,
      category,
      goalAmount,
      goalUnit:                  goalUnit.trim() || 'times',
      goalPer,
      repeat:                    buildRepeat(),
      timeOfDay,
      startDate,
      endCondition,
      endDate:                   endCondition === 'on_date' ? (endDate || undefined) : undefined,
      reminderTime:              initialHabit?.reminderTime ?? '08:00 AM',
      medicationDosage:          category === 'medication' ? (dosage.trim() || undefined) : undefined,
      medicationFrequencyHours:  category === 'medication' ? freqHours : undefined,
    })
  }

  function handleDelete() {
    if (!initialHabit || !onDelete) return
    if (!confirmDelete) { setConfirmDelete(true); return }
    onDelete(initialHabit.id)
    onCancel()
  }

  const canSave = name.trim().length > 0
  const presets = GOAL_UNIT_PRESETS[category]

  const inputClass =
    'px-3 py-2.5 rounded bg-surface-container-low border border-surface-container-high text-on-surface text-sm outline-none focus:border-primary transition-colors'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel() }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ duration: 0.18 }}
        className="w-full max-w-md bg-surface-container-lowest rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container-high">
          <h2 className="font-extrabold text-on-surface text-lg">
            {isEditing ? 'Edit Habit' : 'New Habit'}
          </h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center rounded hover:bg-surface-container-high transition-colors"
          >
            <Icon name="close" size={18} className="text-on-surface-variant" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-5 overflow-y-auto max-h-[72vh]">

          {/* Name + Magic Fill */}
          <div className="flex gap-2 items-stretch">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Habit name"
              className="flex-1 px-4 py-3 rounded bg-surface-container-low border border-surface-container-high text-on-surface placeholder:text-on-surface-variant/50 text-sm outline-none focus:border-primary transition-colors"
            />
            <div className="relative">
              <button
                onClick={handleMagicFill}
                className="flex items-center gap-2 px-4 py-3 rounded bg-error/90 text-white text-sm font-semibold hover:bg-error transition-colors h-full"
              >
                <Icon name="auto_fix_high" size={16} />
                Magic Fill
              </button>
              <AnimatePresence>
                {magicFillToast && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    className="absolute top-full right-0 mt-2 bg-on-surface text-surface text-xs font-medium px-3 py-2 rounded shadow-lg whitespace-nowrap z-10"
                  >
                    Phase 2 — coming soon!
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/60 mb-2 block">
              Category
            </label>
            <div className="flex gap-2">
              {CATEGORY_OPTIONS.map(({ value, label, icon }) => (
                <button
                  key={value}
                  onClick={() => handleCategoryChange(value)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded text-xs font-semibold transition-colors border-2',
                    category === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-surface-container-high text-on-surface-variant hover:bg-surface-container-low'
                  )}
                >
                  <Icon name={icon} size={14} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Medication-specific fields */}
          {category === 'medication' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/60 mb-2 block">
                  Dosage
                </label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g. 10mg"
                  className={cn(inputClass, 'w-full')}
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/60 mb-2 block">
                  Frequency (hrs)
                </label>
                <input
                  type="number"
                  min={1}
                  max={168}
                  value={freqHours}
                  onChange={(e) => setFreqHours(Math.max(1, parseInt(e.target.value) || 24))}
                  className={cn(inputClass, 'w-full text-center')}
                />
              </div>
            </div>
          )}

          {/* Repeat */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/60 mb-2 block">
              Repeat
            </label>
            <div className="flex gap-2 items-center">
              <select
                value={repeatType}
                onChange={(e) => setRepeatType(e.target.value as 'daily' | 'monthly' | 'interval')}
                className={cn(inputClass, 'flex-1')}
              >
                <option value="daily">Daily</option>
                <option value="monthly">Monthly</option>
                <option value="interval">Interval</option>
              </select>

              {repeatType === 'interval' && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded bg-surface-container-low border border-surface-container-high">
                  <span className="text-sm text-on-surface-variant whitespace-nowrap">Every</span>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={intervalDays}
                    onChange={(e) => setIntervalDays(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 bg-transparent text-on-surface text-sm text-center outline-none"
                  />
                  <span className="text-sm text-on-surface-variant">days</span>
                </div>
              )}
            </div>

            {repeatType === 'daily' && (
              <div className="mt-2.5">
                <div className="flex gap-1.5 flex-wrap">
                  {WEEK_DAYS.map(({ label, value }) => (
                    <button
                      key={value}
                      onClick={() => toggleDailyDay(value)}
                      className={cn(
                        'px-3 py-1.5 rounded text-xs font-semibold transition-colors',
                        dailyDays.includes(value)
                          ? 'bg-primary text-white'
                          : 'bg-surface-container-low border border-surface-container-high text-on-surface-variant hover:bg-surface-container-high'
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-on-surface-variant/50 mt-1.5">
                  {dailyDays.length === 0 ? 'No specific days selected — repeats every day' : ''}
                </p>
              </div>
            )}

            {repeatType === 'monthly' && (
              <div className="grid grid-cols-7 gap-1 mt-2.5">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <button
                    key={day}
                    onClick={() => toggleMonthlyDay(day)}
                    className={cn(
                      'h-8 rounded text-xs font-semibold transition-colors',
                      monthlyDays.includes(day)
                        ? 'bg-primary text-white'
                        : 'bg-surface-container-low border border-surface-container-high text-on-surface-variant hover:bg-surface-container-high'
                    )}
                  >
                    {day}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Goal */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/60 mb-2 block">
              Goal
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                value={goalAmount}
                onChange={(e) => setGoalAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-3 py-2.5 rounded bg-surface-container-low border border-surface-container-high text-on-surface text-sm outline-none focus:border-primary text-center transition-colors"
              />
              {goalUnitCustom ? (
                <input
                  type="text"
                  value={goalUnit}
                  onChange={(e) => setGoalUnit(e.target.value)}
                  placeholder="unit"
                  autoFocus
                  onBlur={() => { if (!goalUnit.trim()) { setGoalUnitCustom(false); setGoalUnit(presets[0]) } }}
                  className="w-24 px-3 py-2.5 rounded bg-surface-container-low border border-primary text-on-surface text-sm outline-none transition-colors"
                />
              ) : (
                <select
                  value={presets.includes(goalUnit) ? goalUnit : '__custom__'}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') { setGoalUnitCustom(true); setGoalUnit('') }
                    else setGoalUnit(e.target.value)
                  }}
                  className={cn(inputClass, 'w-28')}
                >
                  {presets.map((u) => <option key={u} value={u}>{u}</option>)}
                  <option value="__custom__">Custom…</option>
                </select>
              )}
              <span className="text-sm text-on-surface-variant whitespace-nowrap">per</span>
              <select
                value={goalPer}
                onChange={(e) => setGoalPer(e.target.value as GoalPer)}
                className={cn(inputClass, 'flex-1')}
              >
                <option value="day">day</option>
                <option value="week">week</option>
                <option value="month">month</option>
                <option value="year">year</option>
              </select>
            </div>
          </div>

          {/* Time of Day */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/60 mb-2 block">
              Time of Day
            </label>
            <div className="flex gap-2">
              {(
                [
                  { key: 'morning',   label: 'Morning',   icon: 'wb_sunny'  },
                  { key: 'afternoon', label: 'Afternoon', icon: 'wb_cloudy' },
                  { key: 'evening',   label: 'Evening',   icon: 'bedtime'   },
                ] as const
              ).map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => toggleTimeOfDay(key)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-1.5 py-2 rounded text-xs font-semibold transition-colors border-2',
                    timeOfDay.includes(key)
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-surface-container-high text-on-surface-variant hover:bg-surface-container-low'
                  )}
                >
                  <Icon name={icon} size={14} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Start Date + End Condition */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/60 mb-2 block">
                Start Date
              </label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded bg-surface-container-low border border-surface-container-high">
                <Icon name="calendar_today" size={14} className="text-on-surface-variant shrink-0" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1 bg-transparent text-on-surface text-sm outline-none min-w-0"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/60 mb-2 block">
                End
              </label>
              <select
                value={endCondition}
                onChange={(e) => setEndCondition(e.target.value as EndCondition)}
                className={cn(inputClass, 'w-full')}
              >
                <option value="never">Never</option>
                <option value="on_date">On Date</option>
              </select>
            </div>
          </div>

          {endCondition === 'on_date' && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/60 mb-2 block">
                End Date
              </label>
              <div className="flex items-center gap-2 px-3 py-2.5 rounded bg-surface-container-low border border-surface-container-high">
                <Icon name="event_busy" size={14} className="text-on-surface-variant shrink-0" />
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1 bg-transparent text-on-surface text-sm outline-none min-w-0"
                />
              </div>
            </div>
          )}

          {/* Reminders — display only */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant/60 mb-2 block">
              Reminders
            </label>
            <div className="flex items-center gap-3 px-4 py-3 rounded bg-surface-container-low border border-surface-container-high text-on-surface-variant/60">
              <Icon name="notifications" size={16} />
              <span className="text-sm flex-1">
                {format(new Date(), 'MMM d')} at {initialHabit?.reminderTime ?? '08:00 AM'}
              </span>
              <span className="text-xs bg-surface-container-high px-2 py-0.5 rounded">Phase 2</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-surface-container-high">
          {isEditing && onDelete ? (
            <button
              onClick={handleDelete}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded text-sm font-semibold transition-all',
                confirmDelete
                  ? 'bg-error text-white hover:bg-error/90'
                  : 'text-error hover:bg-error/10'
              )}
            >
              <Icon name="delete" size={14} />
              {confirmDelete ? 'Confirm Delete' : 'Delete Habit'}
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="px-5 py-2.5 rounded text-sm font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave}
              className="px-5 py-2.5 rounded bg-primary text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              Save Habit
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
