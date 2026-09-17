// Status color map
const STATUS_CONFIG = {
  // Application
  APPLIED:    { label: 'Applied',    cls: 'badge-info' },
  SHORTLISTED:{ label: 'Shortlisted',cls: 'badge-indigo' },
  INTERVIEW:  { label: 'Interview',  cls: 'badge-warning' },
  SELECTED:   { label: 'Selected',   cls: 'badge-success' },
  OFFERED:    { label: 'Offered',    cls: 'badge-purple' },
  REJECTED:   { label: 'Rejected',   cls: 'badge-danger' },
  // Internship
  OPEN:   { label: 'Open',   cls: 'badge-success' },
  CLOSED: { label: 'Closed', cls: 'badge-danger' },
  DRAFT:  { label: 'Draft',  cls: 'badge-gray' },
  // Interview
  SCHEDULED:   { label: 'Scheduled',    cls: 'badge-info' },
  IN_PROGRESS: { label: 'In Progress',  cls: 'badge-warning' },
  COMPLETED:   { label: 'Completed',    cls: 'badge-success' },
  CANCELLED:   { label: 'Cancelled',    cls: 'badge-danger' },
  // Reports
  SUBMITTED:        { label: 'Submitted',       cls: 'badge-info' },
  REVISION_REQUIRED:{ label: 'Revision Required',cls: 'badge-warning' },
  VERIFIED:         { label: 'Verified',         cls: 'badge-success' },
  // Approvals
  PENDING:  { label: 'Pending',  cls: 'badge-warning' },
  APPROVED: { label: 'Approved', cls: 'badge-success' },
  // Warning
  ON_TRACK:       { label: 'On Track',       cls: 'badge-success' },
  NEEDS_ATTENTION:{ label: 'Needs Attention',cls: 'badge-warning' },
  AT_RISK:        { label: 'At Risk',        cls: 'badge-danger' },
};

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, cls: 'badge-gray' };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}
