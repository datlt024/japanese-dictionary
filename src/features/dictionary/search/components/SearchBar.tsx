"use client"

import {
  useRef,
  type ChangeEvent,
} from "react"
import { ImageIcon, Mic, Search } from "lucide-react"

import styles from "./SearchBar.module.css"

import HandwritingButton from "@/features/dictionary/handwriting/components/HandwritingButton"
import HandwritingModal from "@/features/dictionary/handwriting/components/HandwritingModal"

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  handwritingOpen: boolean
  onHandwritingOpenChange: (open: boolean) => void
  onVoiceSearchOpen?: () => void
  onImageScanOpen?: () => void
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Tìm từ tiếng Nhật...",
  handwritingOpen,
  onHandwritingOpenChange,
  onVoiceSearchOpen,
  onImageScanOpen,
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

  function handleOpenVoiceSearch() {
    inputRef.current?.blur()
    onVoiceSearchOpen?.()
  }

  function handleOpenImageScan() {
    inputRef.current?.blur()
    onImageScanOpen?.()
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

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.imageScanButton}
            onClick={handleOpenImageScan}
            aria-label="Dịch ảnh"
          >
            <ImageIcon size={18} />
            <span className={styles.tooltip}>Dịch ảnh</span>
          </button>

          <div className={styles.actionItem}>
            <HandwritingButton
              onClick={handleOpenHandwriting}
            />
          </div>

          <button
            type="button"
            className={styles.voiceButton}
            onClick={handleOpenVoiceSearch}
            aria-label="Tra cứu bằng giọng nói"
          >
            <Mic size={18} />
          </button>
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