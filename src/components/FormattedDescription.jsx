// components/FormattedDescription.jsx
import './FormattedDescription.css'

export default function FormattedDescription({ text }) {
  if (!text) return null

  // Parse the text into structured content
  const parseDescription = (rawText) => {
    const lines = rawText.split('\n')
    const sections = []
    let currentSection = { title: '', content: [] }
    let currentList = []

    // Common section header patterns
    const headerPatterns = [
      /^(about|overview|summary|description|introduction)/i,
      /^(responsibilities|duties|what you('ll| will) do|your role|key responsibilities)/i,
      /^(requirements|qualifications|what we('re| are) looking for|must have|skills required)/i,
      /^(nice to have|preferred|bonus|plus|good to have)/i,
      /^(benefits|perks|what we offer|compensation|why join)/i,
      /^(about us|about the company|who we are|our company)/i,
      /^(how to apply|application|next steps)/i,
    ]

    const isHeader = (line) => {
      const trimmed = line.trim()
      // Check if line ends with colon or matches header patterns
      if (trimmed.endsWith(':') && trimmed.length < 60) return true
      return headerPatterns.some(pattern => pattern.test(trimmed))
    }

    const isBulletPoint = (line) => {
      const trimmed = line.trim()
      return /^[-•*▪▸►→]\s/.test(trimmed) || /^\d+[.)]\s/.test(trimmed)
    }

    const cleanBulletPoint = (line) => {
      return line.trim().replace(/^[-•*▪▸►→]\s*/, '').replace(/^\d+[.)]\s*/, '')
    }

    const cleanHeader = (line) => {
      return line.trim().replace(/:$/, '')
    }

    lines.forEach((line) => {
      const trimmedLine = line.trim()

      // Skip empty lines but save current list if exists
      if (!trimmedLine) {
        if (currentList.length > 0) {
          currentSection.content.push({ type: 'list', items: [...currentList] })
          currentList = []
        }
        return
      }

      // Check if it's a header
      if (isHeader(trimmedLine)) {
        // Save previous section
        if (currentSection.title || currentSection.content.length > 0) {
          if (currentList.length > 0) {
            currentSection.content.push({ type: 'list', items: [...currentList] })
            currentList = []
          }
          sections.push({ ...currentSection })
        }
        // Start new section
        currentSection = { title: cleanHeader(trimmedLine), content: [] }
        return
      }

      // Check if it's a bullet point
      if (isBulletPoint(trimmedLine)) {
        currentList.push(cleanBulletPoint(trimmedLine))
        return
      }

      // Regular paragraph text
      if (currentList.length > 0) {
        currentSection.content.push({ type: 'list', items: [...currentList] })
        currentList = []
      }
      currentSection.content.push({ type: 'paragraph', text: trimmedLine })
    })

    // Don't forget the last section
    if (currentList.length > 0) {
      currentSection.content.push({ type: 'list', items: [...currentList] })
    }
    if (currentSection.title || currentSection.content.length > 0) {
      sections.push(currentSection)
    }

    return sections
  }

  // If the text is very simple (no structure), create a basic display
  const isSimpleText = (text) => {
    const lines = text.split('\n').filter(l => l.trim())
    return lines.length <= 3 && !text.includes(':') && !/^[-•*]\s/.test(text)
  }

  if (isSimpleText(text)) {
    return (
      <div className="formatted-desc">
        <div className="fd-simple">
          <p>{text}</p>
        </div>
      </div>
    )
  }

  const sections = parseDescription(text)

  // If parsing didn't create meaningful sections, display as enhanced paragraphs
  if (sections.length === 0) {
    return (
      <div className="formatted-desc">
        <div className="fd-simple">
          <p>{text}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="formatted-desc">
      {sections.map((section, sectionIdx) => (
        <div key={sectionIdx} className="fd-section">
          {section.title && (
            <h3 className="fd-section-title">
              <span className="fd-title-icon">
                {getSectionIcon(section.title)}
              </span>
              {section.title}
            </h3>
          )}
          <div className="fd-section-content">
            {section.content.map((item, itemIdx) => {
              if (item.type === 'list') {
                return (
                  <ul key={itemIdx} className="fd-list">
                    {item.items.map((listItem, listIdx) => (
                      <li key={listIdx}>
                        <span className="fd-bullet">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        <span className="fd-list-text">{listItem}</span>
                      </li>
                    ))}
                  </ul>
                )
              }
              return (
                <p key={itemIdx} className="fd-paragraph">
                  {item.text}
                </p>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// Helper function to get icons for different section types
function getSectionIcon(title) {
  const lower = title.toLowerCase()
  
  if (/responsibilities|duties|role|do/.test(lower)) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  
  if (/requirements|qualifications|skills|looking/.test(lower)) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  
  if (/benefits|perks|offer|compensation/.test(lower)) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  
  if (/about|overview|company|who/.test(lower)) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  
  if (/nice|preferred|bonus|plus/.test(lower)) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  }
  
  // Default icon
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}