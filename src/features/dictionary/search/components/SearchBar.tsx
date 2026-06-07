"use client"

import {
  useRef,
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
  handwritingOpen: boolean
  onHandwritingOpenChange: (open: boolean) => void
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Tìm từ tiếng Nhật...",
  handwritingOpen,
  onHandwritingOpenChange,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(event.target.value)
  }

  function handleOpenHandwriting() {
    inputRef.current?.blur()
    onHandwritingOpenChange(true)
  }

  function handleCloseHandwriting() {
    onHandwritingOpenChange(false)
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
        onSearch={() => {
          inputRef.current?.form?.requestSubmit()
        }}
      />
    </>
  )
}