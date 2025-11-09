import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

interface AccordionContextValue {
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
  type: "single" | "multiple"
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined)

const Accordion = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    type: "single" | "multiple"
    value?: string | string[]
    onValueChange?: (value: string | string[]) => void
    defaultValue?: string | string[]
    collapsible?: boolean
  }
>(({ className, type, value, onValueChange, defaultValue, collapsible, ...props }, ref) => {
  const [internalValue, setInternalValue] = React.useState<string | string[]>(
    defaultValue || (type === "multiple" ? [] : "")
  )
  const isControlled = value !== undefined
  const currentValue = isControlled ? value : internalValue
  const setValue = isControlled ? onValueChange! : setInternalValue

  return (
    <AccordionContext.Provider value={{ value: currentValue, onValueChange: setValue, type }}>
      <div ref={ref} className={className} {...props} />
    </AccordionContext.Provider>
  )
})
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => (
  <div ref={ref} className={cn("border-b", className)} data-value={value} {...props} />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(AccordionContext)
  const item = React.useContext(AccordionItemContext)

  const isOpen = context?.type === "multiple"
    ? Array.isArray(context.value) && context.value.includes(item)
    : context?.value === item

  const handleClick = () => {
    if (context?.type === "multiple") {
      const currentValue = (context.value as string[]) || []
      const newValue = currentValue.includes(item)
        ? currentValue.filter(v => v !== item)
        : [...currentValue, item]
      context.onValueChange?.(newValue)
    } else {
      context?.onValueChange?.(isOpen ? "" : item)
    }
  }

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      onClick={handleClick}
      data-state={isOpen ? "open" : "closed"}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </button>
  )
})
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionItemContext = React.createContext<string>("")

const AccordionItemProvider = ({ value, children }: { value: string; children: React.ReactNode }) => (
  <AccordionItemContext.Provider value={value}>{children}</AccordionItemContext.Provider>
)

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const context = React.useContext(AccordionContext)
  const item = React.useContext(AccordionItemContext)

  const isOpen = context?.type === "multiple"
    ? Array.isArray(context.value) && context.value.includes(item)
    : context?.value === item

  if (!isOpen) return null

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",
        className
      )}
      data-state={isOpen ? "open" : "closed"}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  )
})
AccordionContent.displayName = "AccordionContent"

// Update AccordionItem to use the provider
const AccordionItemWithContext = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ value, children, ...props }, ref) => (
  <AccordionItemProvider value={value}>
    <AccordionItem ref={ref} value={value} {...props}>
      {children}
    </AccordionItem>
  </AccordionItemProvider>
))
AccordionItemWithContext.displayName = "AccordionItem"

export { Accordion, AccordionItemWithContext as AccordionItem, AccordionTrigger, AccordionContent }
