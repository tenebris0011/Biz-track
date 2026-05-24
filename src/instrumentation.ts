export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { runMigrations } = await import('./db/migrate')
    await Promise.resolve(runMigrations())
    const { seedDefaults } = await import('./db/seed')
    await seedDefaults()
    const { startCronJobs } = await import('./lib/cron')
    startCronJobs()
  }
}
