import React from 'react'

const TrashIcon = ({ size = 16 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M9 3H15M4 7H20M18 7L17.2 19.4C17.1478 20.1685 16.8322 20.8972 16.3137 21.4375C15.7951 21.9777 15.1098 22.2899 14.386 22.32H9.614C8.8902 22.2899 8.2049 21.9777 7.68633 21.4375C7.16776 20.8972 6.85221 20.1685 6.8 19.4L6 7M10 11V17M14 11V17"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)

export default TrashIcon
