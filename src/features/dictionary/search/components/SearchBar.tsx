"use client"

import {
  useRef,
  useState,
  type ChangeEvent,
} from "react"
import { Search } from "lucide-react"

import styles from "./SearchBar.module.css"

import HandwritingButton from "@/features/dictionary/handwriting/components/HandwritingButton"
import HandwritingModal from "@/features/dictionary/handwriting/components/HandwritingModal"

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
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [handwritingOpen, setHandwritingOpen] = useState(false)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value)
  }

  function handleOpenHandwriting() {
    inputRef.current?.blur()
    setHandwritingOpen(true)
  }

  function handleCloseHandwriting() {
    setHandwritingOpen(false)
  }

  function handleSelectHandwriting(text: string) {
    inputRef.current?.blur()
    onChange(`${value}${text}`)
  }

  return (
    <>
      <div className={styles.searchContainer}>
        <Search
          size={20}
          className={styles.searchIcon}
        />

        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={handleChange}
          className={styles.searchInput}
        />

        <div className={styles.handwritingAction}>
          <HandwritingButton
            onClick={handleOpenHandwriting}
          />
        </div>
      </div>

      <HandwritingModal
        open={handwritingOpen}
        onClose={handleCloseHandwriting}
        onSelect={handleSelectHandwriting}
      />
    </>
  )
}