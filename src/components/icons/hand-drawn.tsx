export function HandTerminal(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4.5 17.5l6-6-6-6M12 19h8" strokeDasharray="50" strokeDashoffset="0">
        <animate attributeName="stroke-dashoffset" values="50;0" dur="0.5s" />
      </path>
      {/* Wobble */}
      <path d="M4.2 17.3l6.2-5.8-6.1-5.9M11.8 19.2h8.3" strokeWidth="1" stroke="currentColor" opacity="0.3" />
    </svg>
  )
}

export function HandShield(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM9 12l2 2 4-4" />
      <path d="M11.8 22.2s8.2-4.1 7.8-9.8V4.8l-7.9-2.9-7.8 2.8v7.2c0 6.1 8 10 8 10zM8.8 11.8l2.1 2.2 4.1-3.9" strokeWidth="1" opacity="0.3" />
    </svg>
  )
}

export function HandGraduationCap(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5" />
      <path d="M21.8 9.8v6.2M1.8 10.2l10.1-5.1 9.9 4.9-10.2 5.2zM5.8 12.2v4.8c3.2 2.9 8.8 3.1 12.2 0v-4.8" strokeWidth="1" opacity="0.3" />
    </svg>
  )
}

export function HandUsers(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <path d="M20 8v6M23 11h-6" />
      {/* Wobble */}
      <path d="M15.8 21.2v-2.1a4 4 0 0 0-4.1-3.9H4.8a4 4 0 0 0-3.9 4.1v1.9" strokeWidth="1" opacity="0.3" />
      <circle cx="8.3" cy="7.2" r="4.1" strokeWidth="1" opacity="0.3" />
      <path d="M19.8 7.8v6.2M23.2 10.8h-6.2" strokeWidth="1" opacity="0.3" />
    </svg>
  )
}
