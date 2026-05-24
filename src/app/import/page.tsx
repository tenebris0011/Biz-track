import { listImportTemplates } from '@/actions/templates'
import { ImportPageClient } from './import-page-client'

export default async function ImportPage() {
  const templates = await listImportTemplates()
  return <ImportPageClient initialTemplates={templates} />
}
