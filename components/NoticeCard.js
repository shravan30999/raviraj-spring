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

  const attachments = notice.notice_attachments || []

  function isImage(type) {
    return type?.startsWith('image/')
  }

  function isPdf(type) {
    return type?.includes('pdf')
  }

  function formatSize(bytes) {
    if (!bytes) return ''
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

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

      {notice.content && (
        <div className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed mb-3">
          {notice.content}
        </div>
      )}

      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Attachments ({attachments.length})
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {attachments.map(att => (
              <a
                key={att.id}
                href={att.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors group"
              >
                {isImage(att.file_type) ? (
                  <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                ) : isPdf(att.file_type) ? (
                  <div className="w-10 h-10 bg-red-100 rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-red-600">PDF</span>
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate group-hover:text-primary">
                    {att.file_name}
                  </p>
                  {att.file_size && (
                    <p className="text-xs text-gray-400">{formatSize(att.file_size)}</p>
                  )}
                </div>
              </a>
            ))}
          </div>

          {/* Image previews */}
          {attachments.filter(a => isImage(a.file_type)).length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {attachments.filter(a => isImage(a.file_type)).map(att => (
                <a key={att.id + '-preview'} href={att.file_url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={att.file_url}
                    alt={att.file_name}
                    className="rounded-lg border w-full max-h-64 object-contain bg-gray-50"
                  />
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {notice.members && (
        <p className="mt-3 text-xs text-gray-400">
          Posted by {notice.members.owner_name}
        </p>
      )}
    </div>
  )
}
