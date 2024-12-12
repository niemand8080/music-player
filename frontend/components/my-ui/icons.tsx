import React from 'react'

interface IconProps {
  size?: number;
}

export const Server: React.FC<IconProps & React.HTMLAttributes<HTMLOrSVGElement>> = ({
  size = 24,
  ...params
}) => {
  return (
    <svg {...params} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 14H4C2.89543 14 2 14.8954 2 16V20C2 21.1046 2.89543 22 4 22H20C21.1046 22 22 21.1046 22 20V16C22 14.8954 21.1046 14 20 14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M6 18H6.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  )
}
