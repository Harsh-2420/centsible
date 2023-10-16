import React, { useState } from "react"
import Chip from "@mui/material/Chip"
import MenuItem from "@mui/material/MenuItem"
import Popover from "@mui/material/Popover"
import { makeStyles } from "@mui/styles"

const groupColors = {
    Entertainment: "rgba(135, 185, 205, 1.0)",
    Uncategorized: "rgba(0, 0, 255, 0.5)",
    Restaurants: "rgba(190, 168, 235, 1.0)",
    Groceries: "rgba(255, 165, 110, 1.0)",
    Miscellaneous: "rgba(210, 255, 240, 1.0)",
    Bills: "rgba(255, 210, 180, 1.0)",
    Income: "rgba(255, 132, 147, 1.0)",
}

const styles = {
    fontFamily: "Futura, sans-serif", // Replace with the appropriate font-family
}

export const SelectableCell = ({ value, options, onUpdate }) => {
    const [anchorEl, setAnchorEl] = useState(null)

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget)
    }

    const handleClose = () => {
        setAnchorEl(null)
    }

    const handleSelect = (selectedValue) => {
        onUpdate(selectedValue)
        handleClose()
    }

    const filteredOptions = options.filter((option) => option !== value)

    return (
        <div>
            <Chip
                label={value}
                style={{ backgroundColor: groupColors[value], ...styles }}
                onClick={handleClick}
            />
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={handleClose}
            >
                <MenuItem
                    value={value}
                    onClick={() => handleSelect(value)}
                    style={styles}
                >
                    {value}
                </MenuItem>
                {filteredOptions.map((option) => (
                    <MenuItem
                        key={option}
                        value={option}
                        onClick={() => handleSelect(option)}
                        style={styles}
                    >
                        {option}
                    </MenuItem>
                ))}
            </Popover>
        </div>
    )
}
