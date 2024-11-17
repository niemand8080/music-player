import { FC, ReactNode } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip'

export const TheTooltip: FC<{ 
  children: ReactNode, 
  text: string | JSX.Element,
  triggerClass?: string,
  triggerClick?: () => void,
}> = ({ children, text, triggerClass, triggerClick }) => {
  return (
    <Tooltip>
      <TooltipTrigger
        className={triggerClass}
        onClick={triggerClick}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>
        {text}
      </TooltipContent>
    </Tooltip>
  )
}
