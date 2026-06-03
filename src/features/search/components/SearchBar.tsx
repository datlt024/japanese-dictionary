import styles from "./SearchBar.module.css"

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
    <div className={styles.searchContainer}>
      <Search
        size={20}
        className={styles.searchIcon}
      />

      <input
        type="text"
        placeholder="Tìm từ tiếng Nhật..."
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className={styles.searchInput}
      />
    </div>
  )
}