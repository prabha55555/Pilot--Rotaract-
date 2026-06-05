import React from 'react'

export const PageHeader = ({
  title,
  subtitle,
  actionText,
  onActionClick,
  actionIcon: ActionIcon
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-darkest tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500 font-medium">
            {subtitle}
          </p>
        )}
      </div>
      {actionText && onActionClick && (
        <button
          onClick={onActionClick}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand/90 text-white text-sm font-semibold rounded-xl shadow-elegant hover:shadow-hover hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          {ActionIcon && <ActionIcon size={16} className="stroke-[2.5]" />}
          {actionText}
        </button>
      )}
    </div>
  )
}
export default PageHeader
