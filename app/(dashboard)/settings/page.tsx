'use client'

import { motion } from 'framer-motion'
import Icon from '@/components/ui/Icon'
import { useApp } from '@/components/providers/AppProvider'
import { staggerContainer, staggerItem } from '@/lib/animations'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const { user, isMockMode } = useApp()
  const { profile } = user

  function handleToggleMockMode() {
    // Toggle the guest cookie then reload so AppProvider re-initialises
    if (isMockMode) {
      document.cookie = 'healthguard_guest=; max-age=0; path=/'
    } else {
      document.cookie = 'healthguard_guest=true; max-age=2592000; path=/; samesite=lax'
    }
    window.location.reload()
  }

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-6 py-8">
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="flex flex-col gap-6"
      >
        {/* Header */}
        <motion.div variants={staggerItem}>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1">
            Preferences
          </p>
          <h1 className="text-3xl font-extrabold text-on-surface tracking-tight">Settings</h1>
        </motion.div>

        {/* Profile card */}
        <motion.div variants={staggerItem} className="bg-surface-container-low rounded-xl p-6 shadow-card flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-secondary/20 border-2 border-secondary/30 flex items-center justify-center shrink-0">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className="text-secondary font-bold text-lg">
                {profile.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-on-surface truncate">{profile.name}</p>
            <p className="text-sm text-on-surface-variant truncate">{profile.email}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className={cn(
                'text-xs font-semibold px-2 py-0.5 rounded-full',
                isMockMode
                  ? 'bg-tertiary/10 text-tertiary'
                  : 'bg-secondary/10 text-secondary'
              )}>
                {isMockMode ? 'Demo Mode' : 'Live Account'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Medications */}
        <motion.div variants={staggerItem}>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-3">
            Medications
          </p>
          <div className="flex flex-col gap-2">
            {profile.medications.length === 0 && (
              <div className="px-5 py-4 bg-surface-container-low rounded-xl text-sm text-on-surface-variant">
                No medications configured yet.
              </div>
            )}
            {profile.medications.map((med) => (
              <div key={med.id} className="flex items-center gap-4 px-5 py-4 bg-surface-container-low rounded-xl">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
                  <Icon name="medication" filled size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-on-surface">{med.name}</p>
                  <p className="text-xs text-on-surface-variant">{med.dosage} · every {med.frequencyHours} hours</p>
                </div>
                <Icon name="edit" size={18} className="text-on-surface-variant/40" />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Location */}
        <motion.div variants={staggerItem}>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-3">
            Location
          </p>
          <div className="flex items-center gap-4 px-5 py-4 bg-surface-container-low rounded-xl">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-secondary/10">
              <Icon name="location_on" filled size={20} className="text-secondary" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-on-surface">{profile.city}</p>
              <p className="text-xs text-on-surface-variant">Used for pollen and air quality data</p>
            </div>
            <Icon name="edit" size={18} className="text-on-surface-variant/40" />
          </div>
        </motion.div>

        {/* Demo / Mock mode toggle */}
        <motion.div variants={staggerItem}>
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant/60 mb-3">
            Demo
          </p>
          <button
            onClick={handleToggleMockMode}
            className="w-full flex items-center gap-4 px-5 py-4 bg-surface-container-low rounded-xl hover:bg-surface-container transition-colors text-left"
          >
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center shrink-0',
              isMockMode ? 'bg-tertiary/10' : 'bg-secondary/10'
            )}>
              <Icon
                name={isMockMode ? 'visibility_off' : 'visibility'}
                filled size={20}
                className={isMockMode ? 'text-tertiary' : 'text-secondary'}
              />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-on-surface">
                {isMockMode ? 'Exit Demo Mode' : 'Switch to Demo Mode'}
              </p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {isMockMode
                  ? 'Return to your real account and live data'
                  : 'View the app with pre-populated sample data'}
              </p>
            </div>
            <Icon name="chevron_right" size={20} className="text-on-surface-variant/40 shrink-0" />
          </button>
        </motion.div>

        {/* Sign out */}
        <motion.div variants={staggerItem}>
          <a
            href="/api/auth/signout"
            className="w-full flex items-center gap-4 px-5 py-4 bg-surface-container-low rounded-xl hover:bg-error/5 transition-colors group"
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-error/10">
              <Icon name="logout" size={20} className="text-error" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-error">Sign Out</p>
              <p className="text-xs text-on-surface-variant mt-0.5">
                {isMockMode ? 'Exit demo and return to login' : 'Sign out of your Google account'}
              </p>
            </div>
          </a>
        </motion.div>

        {/* Coming soon */}
        <motion.div variants={staggerItem} className="rounded-xl border-2 border-dashed border-surface-container-high p-6 text-center flex flex-col items-center gap-2">
          <Icon name="smart_toy" filled size={32} className="text-on-surface-variant/40" />
          <p className="font-semibold text-on-surface-variant/60">Health Guard Assistant Configuration</p>
          <p className="text-xs text-on-surface-variant/40">Messaging integrations, smart rules, and automation — Phase 3</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
