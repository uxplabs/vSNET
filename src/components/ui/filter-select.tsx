import { Select, SelectContent, SelectItem, SelectTrigger } from "./select"
import { cn } from "@/lib/utils"

interface FilterSelectProps {
  value: string
  onValueChange: (value: string) => void
  /** Label shown in the trigger when value is "All" */
  label: string
  options: readonly string[]
  className?: string
}

function FilterSelect({ value, onValueChange, label, options, className }: FilterSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <span className={cn("truncate", value === "All" && "text-muted-foreground")}>
          {value === "All" ? label : value}
        </span>
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export { FilterSelect }
export type { FilterSelectProps }
