import styles from "./SearchBar.module.css"

import type { ChangeEvent } from "react"

import { Search } from "lucide-react"

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Tìm từ tiếng Nhật...",
}: SearchBarProps) {
  function handleChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    onChange(event.target.value)
  }

  return (
    <div className={styles.searchContainer}>
      <Search
        size={20}
        className={styles.searchIcon}
      />

      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        className={styles.searchInput}
      />
    </div>
  )
}