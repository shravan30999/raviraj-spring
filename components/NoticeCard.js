'use client'

export default function NoticeCard({ notice }) {
  const date = new Date(notice.created_at)
  const formattedDate = date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const formattedTime = date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const typeLabel = notice.notice_type === 'agm' ? 'AGM' : 'General'
  const typeColor = notice.notice_type === 'agm'
    ? 'bg-red-100 text-red-700'
    : 'bg-blue-100 text-blue-700'

  return (
    <div className="notice-card">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeColor}`}>
            {typeLabel}
          </span>
          <span className="text-xs text-gray-400">{formattedDate} at {formattedTime}</span>
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-2">{notice.title}</h3>

      <div className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
        {notice.content}
      </div>

      {notice.members && (
        <p className="mt-3 text-xs text-gray-400">
          Posted by {notice.members.owner_name}
        </p>
      )}
    </div>
  )
}
