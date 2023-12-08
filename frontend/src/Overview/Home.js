// React Imports
import React, { useState } from "react"
import "../App.css"
import "bootstrap/dist/css/bootstrap.min.css"
import { Container, Row, Col } from "react-bootstrap"
import { useDropzone } from "react-dropzone"

// File + Code imports
import { Transactions } from "./Transactions/Transactions"
import Splitwise from "./Splitwise/Splitwise"
import FileUploadComponent from "../Components/FileUploadComponent.js"

// Styling Imports
import Box from "@mui/material/Box"
import Tab from "@mui/material/Tab"
import TabContext from "@mui/lab/TabContext"
import TabList from "@mui/lab/TabList"
import TabPanel from "@mui/lab/TabPanel"

export const Home = () => {
    const [value, setValue] = React.useState("1")
    const [isUploadComplete, setUploadComplete] = useState(false)

    const handleUploadSuccess = () => {
        setUploadComplete(true)
    }

    const handleChange = (event, newValue) => {
        setValue(newValue)
    }
    return (
        <>
            <Box sx={{ width: "100%", typography: { body1: 1 } }}>
                <TabContext value={value}>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                        <TabList
                            onChange={handleChange}
                            aria-label="lab API tabs example"
                        >
                            <Tab label="Transactions" value="1" />
                            <Tab label="Splitwise" value="2" />
                        </TabList>
                    </Box>
                    <>
                        <TabPanel value="1">
                            <Transactions />
                        </TabPanel>
                        <TabPanel value="2">
                            <Splitwise />
                        </TabPanel>
                    </>
                    {/* {!isUploadComplete ? (
                        <FileUploadComponent
                            onUploadSuccess={handleUploadSuccess}
                        />
                    ) : (
                        <>
                            <TabPanel value="1">
                                <Transactions />
                            </TabPanel>
                            <TabPanel value="2">
                                <Splitwise />
                            </TabPanel>
                        </>
                    )} */}

                    {/* If File Uploaded: Show the TabPanels */}
                </TabContext>
            </Box>
        </>
    )
}
