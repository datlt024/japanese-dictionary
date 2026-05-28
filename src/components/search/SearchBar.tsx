import "./SearchBar.css"

import { Search } from "lucide-react"

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({
  value,
  onChange,
}: SearchBarProps) {
  return (
    <div className="search-container">
      <Search size={20} className="search-icon" />

      <input
        type="text"
        placeholder="Tìm từ tiếng Nhật..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="search-input"
      />
    </div>
  )
}