"use client"

import {
  useRef,
  type ChangeEvent,
  type ReactNode,
  type RefObject,
} from "react"
import {
  ImageIcon,
  Mic,
  PenLine,
  Search,
} from "lucide-react"

import styles from "./SearchBar.module.css"

import HandwritingModal from "@/features/dictionary/handwriting/components/HandwritingModal"

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  handwritingOpen: boolean
  onHandwritingOpenChange: (open: boolean) => void
  onVoiceSearchOpen?: () => void
  onImageScanOpen?: () => void
  inputRef?: RefObject<HTMLInputElement | null>
}

type ActionButtonProps = {
  label: string
  onClick: () => void
  children: ReactNode
}

function ActionButton({
  label,
  onClick,
  children,
}: ActionButtonProps) {
  return (
    <button
      type="button"
      className={styles.actionButton}
      onClick={onClick}
      aria-label={label}
    >
      {children}
      <span className={styles.tooltip}>{label}</span>
    </button>
  )
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "Tìm từ tiếng Nhật...",
  handwritingOpen,
  onHandwritingOpenChange,
  onVoiceSearchOpen,
  onImageScanOpen,
  inputRef: externalInputRef,
}: SearchBarProps) {
  const localInputRef = useRef<HTMLInputElement | null>(null)
  const inputRef = externalInputRef ?? localInputRef

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
          <ActionButton
            label="Dịch ảnh"
            onClick={handleOpenImageScan}
          >
            <ImageIcon size={18} />
          </ActionButton>

          <ActionButton
            label="Viết tay"
            onClick={handleOpenHandwriting}
          >
            <PenLine size={18} />
          </ActionButton>

          <ActionButton
            label="Thu âm"
            onClick={handleOpenVoiceSearch}
          >
            <Mic size={18} />
          </ActionButton>
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