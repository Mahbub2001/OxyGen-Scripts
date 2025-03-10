import { Textarea } from 'flowbite-react'
import React from 'react'

function Terminal({currentOutput}) {
  return (
    <textarea
      className="w-full h-full bg-transparent text-white font-mono resize-none outline-none"
      placeholder="Console"
      value={currentOutput}
      disabled
      style={{
        lineHeight: "1.5",
        fontSize: "14px",
        scrollbarWidth: "thin",
        scrollbarColor: "#858585 transparent",
      }}
    />
  )
}

export default Terminal
