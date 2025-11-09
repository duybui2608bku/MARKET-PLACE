import * as React from "react"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: number[]
    onValueChange?: (value: number[]) => void
    max?: number
    min?: number
    step?: number
  }
>(({ className, value = [0], onValueChange, max = 100, min = 0, step = 1, ...props }, ref) => {
  const [localValue, setLocalValue] = React.useState(value)
  const currentValue = value ?? localValue

  const handleChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = [...currentValue]
    newValue[index] = Number(e.target.value)
    setLocalValue(newValue)
    onValueChange?.(newValue)
  }

  return (
    <div
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <div className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <div
          className="absolute h-full bg-primary"
          style={{ width: `${(currentValue[0] / max) * 100}%` }}
        />
      </div>
      {currentValue.map((val, index) => (
        <input
          key={index}
          type="range"
          min={min}
          max={max}
          step={step}
          value={val}
          onChange={handleChange(index)}
          className="absolute h-2 w-full cursor-pointer opacity-0"
        />
      ))}
      <span className="absolute left-0 top-0 h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
        style={{ left: `calc(${(currentValue[0] / max) * 100}% - 10px)` }}
      />
    </div>
  )
})
Slider.displayName = "Slider"

export { Slider }
