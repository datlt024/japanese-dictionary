"use client"

import { useRef } from "react"
import { ImageIcon, Mic, PenLine, Search } from "lucide-react"
import { Button, Input, Tooltip } from "antd"
import type { InputRef } from "antd"

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
  const inputRef = useRef<InputRef | null>(null)

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
        <Search size={20} className={styles.searchIcon} />

        <Input
          ref={inputRef}
          variant="borderless"
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={styles.searchInput}
        />

        <div className={styles.actions}>
          <Tooltip title="Dịch ảnh">
            <Button
              type="text"
              size="small"
              icon={<ImageIcon size={18} />}
              onClick={() => { inputRef.current?.blur(); onImageScanOpen?.() }}
              className={styles.actionButton}
            />
          </Tooltip>

          <Tooltip title="Viết tay">
            <Button
              type="text"
              size="small"
              icon={<PenLine size={18} />}
              onClick={handleOpenHandwriting}
              className={styles.actionButton}
            />
          </Tooltip>

          <Tooltip title="Thu âm">
            <Button
              type="text"
              size="small"
              icon={<Mic size={18} />}
              onClick={() => { inputRef.current?.blur(); onVoiceSearchOpen?.() }}
              className={styles.actionButton}
            />
          </Tooltip>
        </div>
      </div>

      <HandwritingModal
        open={handwritingOpen}
        onClose={handleCloseHandwriting}
        onSelect={handleSelectHandwriting}
        onSearch={() => {
          inputRef.current?.input?.form?.requestSubmit()
        }}
      />
    </>
  )
}
