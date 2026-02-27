export interface AbsenceRecord {
  id: string;
  employeeId: string;
  date: string;
  reason: string;
  replacementId?: string;
  originalEntryId: string;
  createdAt: string;
}
