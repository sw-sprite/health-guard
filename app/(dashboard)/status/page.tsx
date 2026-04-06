'use client'

import { motion } from 'framer-motion'
import { useApp } from '@/components/providers/AppProvider'
import HeroBanner from './components/HeroBanner'
import AtmosphericCard from './components/AtmosphericCard'
import TreatmentWindowCard from './components/TreatmentWindowCard'
import LocalOutlookCard from './components/LocalOutlookCard'
import AetherSuggestionCard from './components/AetherSuggestionCard'
import WeeklyWellnessCard from './components/WeeklyWellnessCard'
import { staggerContainer, staggerItem } from '@/lib/animations'
import Icon from '@/components/ui/Icon'

export default function StatusPage() {
  const { user, env, logs, cardStates, heroStatus, toggleEnv, envMode } = useApp()

  const atmosphericState = cardStates.find((c) => c.id === 'atmospheric-intelligence')!
  const treatmentState = cardStates.find((c) => c.id === 'treatment-window')!

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      {/* Dev toggle — easy to remove later */}
      <div className="mb-6 flex items-center justify-end">
        <button
          onClick={toggleEnv}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full bg-surface-container text-on-surface-variant hover:bg-surface-container-high transition-all border border-surface-container-high"
        >
          <Icon name={envMode === 'safe' ? 'warning' : 'check_circle'} size={14} />
          Demo: Switch to {envMode === 'safe' ? 'Warning' : 'Safe'} mode
        </button>
      </div>

      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <HeroBanner
          status={heroStatus.status}
          message={heroStatus.message}
          userName={user.profile.name}
        />
      </motion.div>

      {/* Bento Grid */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-5"
      >
        {/* Atmospheric Intelligence — 8/12 */}
        <motion.div variants={staggerItem} className="md:col-span-8">
          <AtmosphericCard cardState={atmosphericState} env={env} />
        </motion.div>

        {/* Local Outlook — 4/12 */}
        <motion.div variants={staggerItem} className="md:col-span-4">
          <LocalOutlookCard env={env} />
        </motion.div>

        {/* Treatment Window — 4/12 */}
        <motion.div variants={staggerItem} className="md:col-span-4">
          <TreatmentWindowCard
            cardState={treatmentState}
            logs={logs}
            medications={user.profile.medications}
          />
        </motion.div>

        {/* Aether Suggestion — 4/12 */}
        <motion.div variants={staggerItem} className="md:col-span-4">
          <AetherSuggestionCard status={heroStatus.status} />
        </motion.div>

        {/* Weekly Wellness — 4/12 */}
        <motion.div variants={staggerItem} className="md:col-span-4">
          <WeeklyWellnessCard />
        </motion.div>
      </motion.div>
    </div>
  )
}
