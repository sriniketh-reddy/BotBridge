import React, { useState, useRef, useEffect, type ReactNode } from "react";

interface DropdownProps {
    trigger: ReactNode;
    children: ReactNode;
    align?: "left" | "right";
}

const Dropdown: React.FC<DropdownProps> = ({ trigger, children, align = "right" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <div onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}>
                {trigger}
            </div>

            {isOpen && (
                <div
                    className={`absolute ${align === "right" ? "right-0" : "left-0"} top-full mt-2 w-32 bg-white dark:bg-slate-800 rounded-md shadow-lg z-20 border dark:border-slate-700 py-1 origin-top-right ring-1 ring-black ring-opacity-5 focus:outline-none`}
                >
                    <div onClick={() => setIsOpen(false)}> {/* Close on selection */}
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dropdown;
